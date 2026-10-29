<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected string $tokenPath;

    public function __construct()
    {
        $this->tokenPath = storage_path('app/google_drive_token.json');
    }

    public function getAuthUrl(): string
    {
        $params = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/drive',
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.$params;
    }

    public function handleCallback(string $code): bool
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'grant_type' => 'authorization_code',
        ]);

        if (! $response->successful()) {
            Log::error('Error al obtener token de Google Drive: '.$response->body());

            return false;
        }

        $tokenData = $response->json();
        $tokenData['created_at'] = time();

        if (! is_dir(dirname($this->tokenPath))) {
            mkdir(dirname($this->tokenPath), 0755, true);
        }

        file_put_contents($this->tokenPath, json_encode($tokenData, JSON_PRETTY_PRINT));

        return true;
    }

    public function getAccessToken(): ?string
    {
        if (! file_exists($this->tokenPath)) {
            return null;
        }

        $tokenData = json_decode((string) file_get_contents($this->tokenPath), true);
        if (! is_array($tokenData) || empty($tokenData['access_token'])) {
            return null;
        }

        $expiresIn = $tokenData['expires_in'] ?? 3600;
        $createdAt = $tokenData['created_at'] ?? 0;

        // Si expiró o está a menos de 60 segundos de expirar, refrescar
        if ((time() - $createdAt) > ($expiresIn - 60)) {
            if (! empty($tokenData['refresh_token'])) {
                $refreshed = $this->refreshToken($tokenData['refresh_token']);
                if ($refreshed) {
                    return $refreshed;
                }
            }
        }

        return (string) $tokenData['access_token'];
    }

    protected function refreshToken(string $refreshToken): ?string
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if (! $response->successful()) {
            Log::error('Error refrescando token de Google Drive: '.$response->body());

            return null;
        }

        $newToken = $response->json();
        $stored = file_exists($this->tokenPath) ? json_decode((string) file_get_contents($this->tokenPath), true) : [];
        if (! is_array($stored)) {
            $stored = [];
        }

        $stored['access_token'] = $newToken['access_token'];
        $stored['expires_in'] = $newToken['expires_in'] ?? 3600;
        $stored['created_at'] = time();
        if (! empty($newToken['refresh_token'])) {
            $stored['refresh_token'] = $newToken['refresh_token'];
        }

        file_put_contents($this->tokenPath, json_encode($stored, JSON_PRETTY_PRINT));

        return (string) $stored['access_token'];
    }

    public function isConnected(): bool
    {
        return ! empty($this->getAccessToken());
    }

    /**
     * @return array{id: string, name: string, webViewLink: string, webContentLink: ?string}
     */
    public function uploadFile(UploadedFile $file, ?string $folderName = 'Archivos ERP'): array
    {
        $accessToken = $this->getAccessToken();
        if (! $accessToken) {
            throw new \RuntimeException('Google Drive no está conectado o el token ha expirado.');
        }

        // 1. Obtener o crear carpeta contenedora
        $folderId = $this->getOrCreateFolder($accessToken, $folderName ?? 'Archivos ERP');

        // 2. Metadata del archivo
        $metadata = [
            'name' => $file->getClientOriginalName(),
            'parents' => $folderId ? [$folderId] : [],
        ];

        // 3. Subir archivo a Google Drive (Multipart upload)
        $multipart = [
            [
                'name' => 'metadata',
                'contents' => json_encode($metadata),
                'headers' => ['Content-Type' => 'application/json; charset=UTF-8'],
            ],
            [
                'name' => 'file',
                'contents' => fopen($file->getRealPath(), 'r'),
                'filename' => $file->getClientOriginalName(),
                'headers' => ['Content-Type' => $file->getMimeType() ?: 'application/octet-stream'],
            ],
        ];

        $uploadResponse = Http::withToken($accessToken)
            ->send('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', [
                'multipart' => $multipart,
            ]);

        if (! $uploadResponse->successful()) {
            throw new \RuntimeException('Error al subir archivo a Google Drive: '.$uploadResponse->body());
        }

        $fileData = $uploadResponse->json();
        $fileId = (string) $fileData['id'];

        // 4. Establecer permisos para que cualquiera con el enlace pueda verlo ('reader', 'anyone')
        try {
            Http::withToken($accessToken)->post("https://www.googleapis.com/drive/v3/files/{$fileId}/permissions", [
                'role' => 'reader',
                'type' => 'anyone',
            ]);
        } catch (\Throwable $e) {
            Log::warning('No se pudo establecer permiso público de Drive: '.$e->getMessage());
        }

        return [
            'id' => $fileId,
            'name' => (string) $fileData['name'],
            'webViewLink' => (string) ($fileData['webViewLink'] ?? "https://drive.google.com/file/d/{$fileId}/view"),
            'webContentLink' => isset($fileData['webContentLink']) ? (string) $fileData['webContentLink'] : null,
        ];
    }

    protected function getOrCreateFolder(string $accessToken, string $folderName): ?string
    {
        try {
            $query = "mimeType = 'application/vnd.google-apps.folder' and name = '{$folderName}' and trashed = false";
            $search = Http::withToken($accessToken)->get('https://www.googleapis.com/drive/v3/files', [
                'q' => $query,
                'spaces' => 'drive',
                'fields' => 'files(id, name)',
            ]);

            if ($search->successful()) {
                $files = $search->json('files');
                if (! empty($files) && isset($files[0]['id'])) {
                    return (string) $files[0]['id'];
                }
            }

            // Crear carpeta si no existe
            $create = Http::withToken($accessToken)->post('https://www.googleapis.com/drive/v3/files', [
                'name' => $folderName,
                'mimeType' => 'application/vnd.google-apps.folder',
            ]);

            if ($create->successful()) {
                return (string) $create->json('id');
            }
        } catch (\Throwable $e) {
            Log::warning('No se pudo verificar o crear la carpeta en Google Drive: '.$e->getMessage());
        }

        return null;
    }
}
