<?php

namespace App\Http\Controllers;

use App\Exceptions\GoogleDriveAuthException;
use App\Services\GoogleDriveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GoogleDriveController extends Controller
{
    public function __construct(
        protected GoogleDriveService $driveService
    ) {}

    public function connect(Request $request): RedirectResponse
    {
        $requestedRedirect = $request->query('redirect');
        $fallbackUrl = url()->previous('/proyectos/proyectos');

        $returnUrl = $this->resolveSafeReturnUrl(
            $request,
            is_string($requestedRedirect) ? $requestedRedirect : $fallbackUrl
        );

        $request->session()->put('google_drive_return_url', $returnUrl);
        $request->session()->put('google_drive_popup', $request->boolean('popup'));

        $url = $this->driveService->getAuthUrl();

        return redirect()->away($url);
    }

    public function callback(Request $request): RedirectResponse|Response
    {
        $returnUrl = $this->resolveSafeReturnUrl(
            $request,
            (string) $request->session()->pull('google_drive_return_url', '/proyectos/proyectos')
        );
        $isPopup = (bool) $request->session()->pull('google_drive_popup', false);

        $oauthError = (string) $request->query('error', '');
        $code = (string) $request->input('code', '');

        if ($oauthError !== '') {
            $exito = false;
            $message = 'Autorización de Google Drive cancelada o denegada.';
        } elseif ($code === '') {
            $exito = false;
            $message = 'No se recibió código de autorización de Google.';
        } else {
            $exito = $this->driveService->handleCallback($code);
            $message = $exito
                ? '¡Google Drive vinculado correctamente con el ERP!'
                : 'Ocurrió un error al vincular Google Drive. Verifica las credenciales.';
        }

        if ($isPopup) {
            return response()->view('google.callback-popup', [
                'success' => $exito,
                'message' => $message,
                'returnUrl' => $returnUrl,
            ]);
        }

        return redirect($returnUrl)->with($exito ? 'success' : 'error', $message);
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'connected' => $this->driveService->isConnected(),
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:25600'], // 25 MB max
            'folder' => ['nullable', 'string', 'max:100'],
        ]);

        if (! $this->driveService->isConnected()) {
            return response()->json([
                'error' => 'Google Drive no está conectado o la autorización expiró. Por favor autoriza nuevamente.',
                'requires_auth' => true,
            ], 401);
        }

        try {
            $folderName = $request->input('folder') ?? 'Archivos ERP';
            $result = $this->driveService->uploadFile($request->file('file'), $folderName);

            return response()->json([
                'success' => true,
                'file' => $result,
            ]);
        } catch (GoogleDriveAuthException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'requires_auth' => true,
            ], 401);
        } catch (\Throwable $e) {
            if ($this->driveService->isCredentialOrAuthMessage($e->getMessage())) {
                $this->driveService->clearToken();

                return response()->json([
                    'error' => 'Error con las credenciales de acceso a Google Drive: '.$e->getMessage(),
                    'requires_auth' => true,
                ], 401);
            }

            return response()->json([
                'error' => 'Error al subir archivo a Google Drive: '.$e->getMessage(),
            ], 500);
        }
    }

    protected function resolveSafeReturnUrl(Request $request, ?string $candidate): string
    {
        $default = '/proyectos/proyectos';
        if (! is_string($candidate) || trim($candidate) === '') {
            return $default;
        }

        $parsed = parse_url(trim($candidate));
        if (! is_array($parsed)) {
            return $default;
        }

        if (isset($parsed['host'])) {
            $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
            $allowedHosts = array_filter([$request->getHost(), is_string($appHost) ? $appHost : null]);
            if (! in_array($parsed['host'], $allowedHosts, true)) {
                return $default;
            }
        }

        $path = $parsed['path'] ?? '/';
        if (! str_starts_with($path, '/') || str_starts_with($path, '//') || str_starts_with($path, '/google/')) {
            return $default;
        }

        return isset($parsed['query']) && $parsed['query'] !== ''
            ? $path.'?'.$parsed['query']
            : $path;
    }
}
