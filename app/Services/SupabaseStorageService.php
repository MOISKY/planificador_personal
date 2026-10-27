<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use ZipArchive;

class SupabaseStorageService
{
    protected string $url;

    protected string $serviceKey;

    protected string $bucket;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url', env('SUPABASE_URL', '')), '/');
        $this->serviceKey = (string) config('services.supabase.service_role_key', env('SUPABASE_SERVICE_ROLE_KEY', ''));
        $this->bucket = (string) config('services.supabase.bucket', env('SUPABASE_STORAGE_BUCKET', 'lecciones-scorm'));
    }

    /**
     * Obtiene la URL pública directa de un archivo en el bucket.
     */
    public function getPublicUrl(string $remotePath): string
    {
        $cleanPath = ltrim(str_replace('\\', '/', $remotePath), '/');

        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$cleanPath}";
    }

    /**
     * Sube un archivo individual al bucket de Supabase Storage.
     */
    public function uploadFile(string $remotePath, string $contents, ?string $mimeType = null): bool
    {
        $cleanPath = ltrim(str_replace('\\', '/', $remotePath), '/');
        $endpoint = "{$this->url}/storage/v1/object/{$this->bucket}/{$cleanPath}";

        $mime = $mimeType ?: $this->detectMimeType($cleanPath);

        $client = Http::withHeaders([
            'Authorization' => "Bearer {$this->serviceKey}",
            'x-upsert' => 'true',
            'Content-Type' => $mime,
        ]);

        if (app()->isLocal() || config('app.debug')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->withBody($contents, $mime)->post($endpoint);

        if (! $response->successful()) {
            Log::error("[Supabase Storage] Error subiendo {$cleanPath}: {$response->status()} - {$response->body()}");

            return false;
        }

        return true;
    }

    /**
     * Descomprime un archivo ZIP de lección y sube todos sus archivos a Supabase Storage.
     *
     * @return array{success: bool, url: string, entry_point: string, files_count: int, message?: string}
     */
    public function extractZipAndUpload(string $zipFilePath, string $slug): array
    {
        if (! class_exists('ZipArchive')) {
            throw new Exception('La extensión PHP ZipArchive no está habilitada en el servidor.');
        }

        $cleanSlug = Str::slug($slug);
        if (empty($cleanSlug)) {
            $cleanSlug = 'leccion_'.time();
        }

        $tempDir = storage_path('app/temp_scorm_'.Str::uuid());
        if (! File::isDirectory($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        try {
            $zip = new ZipArchive;
            if ($zip->open($zipFilePath) !== true) {
                throw new Exception('No se pudo abrir el archivo ZIP.');
            }

            $zip->extractTo($tempDir);
            $zip->close();

            $files = File::allFiles($tempDir);
            $uploadedCount = 0;
            $hasStory = false;
            $hasIndex = false;

            foreach ($files as $file) {
                $relativePath = str_replace('\\', '/', $file->getRelativePathname());

                if (strcasecmp($relativePath, 'story.html') === 0) {
                    $hasStory = true;
                }
                if (strcasecmp($relativePath, 'index.html') === 0) {
                    $hasIndex = true;
                }

                $remotePath = "{$cleanSlug}/{$relativePath}";
                $contents = File::get($file->getPathname());
                $mime = $this->detectMimeType($file->getFilename());

                if ($this->uploadFile($remotePath, $contents, $mime)) {
                    $uploadedCount++;
                }
            }

            // story.html es el punto de entrada oficial offline para Storyline
            $entryPoint = $hasStory ? 'story.html' : ($hasIndex ? 'index.html' : 'story.html');
            $publicUrl = $this->getPublicUrl("{$cleanSlug}/{$entryPoint}");

            return [
                'success' => true,
                'url' => $publicUrl,
                'entry_point' => $entryPoint,
                'files_count' => $uploadedCount,
            ];
        } finally {
            if (File::isDirectory($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    /**
     * Detección precisa de Content-Type para activos multimedia de Storyline / HTML5.
     */
    protected function detectMimeType(string $filename): string
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return match ($ext) {
            'html', 'htm' => 'text/html; charset=utf-8',
            'js' => 'application/javascript; charset=utf-8',
            'css' => 'text/css; charset=utf-8',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'eot' => 'application/vnd.ms-fontobject',
            'mp3' => 'audio/mpeg',
            'mp4' => 'video/mp4',
            'pdf' => 'application/pdf',
            default => 'application/octet-stream',
        };
    }
}
