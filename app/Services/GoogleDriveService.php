<?php

namespace App\Services;

use App\Exceptions\GoogleDriveAuthException;
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

    public function hasOAuthCredentials(): bool
    {
        return ! empty(config('services.google.client_id'))
            && ! empty(config('services.google.client_secret'))
            && ! empty(config('services.google.redirect_uri'));
    }

    public function clearToken(): void
    {
        if (file_exists($this->tokenPath)) {
            @unlink($this->tokenPath);
        }
    }

    public function isCredentialOrAuthMessage(string $message): bool
    {
        $lower = strtolower($message);

        foreach ([
            'invalid_grant',
            'invalid_client',
            'unauthorized_client',
            'deleted_client',
            'invalid credentials',
            'unauthenticated',
            'autherror',
            'invalid_token',
            'insufficientpermissions',
            'insufficient_scope',
            'access_token_scope_insufficient',
            'access_denied',
            'token has been expired',
            'token has been revoked',
            'no está conectado',
            'token ha expirado',
            'credenciales',
        ] as $needle) {
            if (str_contains($lower, $needle)) {
                return true;
            }
        }

        return false;
    }

    protected function isAuthErrorResponse(int $status, string $body): bool
    {
        if ($status === 401) {
            return true;
        }

        if (in_array($status, [400, 403], true) && $this->isCredentialOrAuthMessage($body)) {
            return true;
        }

        return false;
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
        if (! $this->hasOAuthCredentials()) {
            Log::error('Credenciales de Google Drive incompletas en la configuración.');

            return false;
        }

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
        if (! is_array($tokenData) || empty($tokenData['access_token'])) {
            Log::error('Respuesta inválida al obtener token de Google Drive.');

            return false;
        }

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
            $this->clearToken();

            return null;
        }

        $expiresIn = (int) ($tokenData['expires_in'] ?? 3600);
        $createdAt = (int) ($tokenData['created_at'] ?? 0);

        // Si expiró o está a menos de 60 segundos de expirar, intentar refrescar o invalidar el token
        if ((time() - $createdAt) > ($expiresIn - 60)) {
            if (! empty($tokenData['refresh_token'])) {
                $refreshed = $this->refreshToken((string) $tokenData['refresh_token']);
                if ($refreshed !== null) {
                    return $refreshed;
                }
            }

            $this->clearToken();

            return null;
        }

        return (string) $tokenData['access_token'];
    }

    protected function refreshToken(string $refreshToken): ?string
    {
        if (! $this->hasOAuthCredentials()) {
            Log::error('Credenciales OAuth de Google Drive no configuradas al refrescar token.');

            return null;
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if (! $response->successful()) {
            Log::error('Error refrescando token de Google Drive: '.$response->body());
            if ($this->isAuthErrorResponse($response->status(), $response->body())) {
                $this->clearToken();
            }

            return null;
        }

        $newToken = $response->json();
        if (! is_array($newToken) || empty($newToken['access_token'])) {
            $this->clearToken();

            return null;
        }

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
        if (! $this->hasOAuthCredentials()) {
            throw new GoogleDriveAuthException('Las credenciales de acceso a Google Drive no están configuradas.');
        }

        $accessToken = $this->getAccessToken();
        if (! $accessToken) {
            throw new GoogleDriveAuthException('Google Drive no está conectado o el token ha expirado. Autoriza nuevamente.');
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

        if ($this->isAuthErrorResponse($uploadResponse->status(), $uploadResponse->body())) {
            $this->clearToken();

            throw new GoogleDriveAuthException('Error de credenciales o autorización en Google Drive. Vuelve a autorizar tu cuenta.');
        }

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

            if ($this->isAuthErrorResponse($search->status(), $search->body())) {
                $this->clearToken();

                throw new GoogleDriveAuthException('Las credenciales de Google Drive expiraron o fueron revocadas. Autoriza nuevamente.');
            }

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

            if ($this->isAuthErrorResponse($create->status(), $create->body())) {
                $this->clearToken();

                throw new GoogleDriveAuthException('Las credenciales de Google Drive expiraron o fueron revocadas. Autoriza nuevamente.');
            }

            if ($create->successful()) {
                return (string) $create->json('id');
            }
        } catch (GoogleDriveAuthException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::warning('No se pudo verificar o crear la carpeta en Google Drive: '.$e->getMessage());
        }

        return null;
    }
}
