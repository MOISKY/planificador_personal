<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GoogleDriveController extends Controller
{
    public function __construct(
        protected GoogleDriveService $driveService
    ) {}

    public function connect(): RedirectResponse
    {
        $url = $this->driveService->getAuthUrl();

        return redirect()->away($url);
    }

    public function callback(Request $request): RedirectResponse
    {
        $code = (string) $request->input('code');

        if (! $code) {
            return redirect('/proyectos/proyectos')->with('error', 'No se recibió código de autorización de Google.');
        }

        $exito = $this->driveService->handleCallback($code);

        if ($exito) {
            return redirect('/proyectos/proyectos')->with('success', '¡Google Drive vinculado correctamente con el ERP!');
        }

        return redirect('/proyectos/proyectos')->with('error', 'Ocurrió un error al vincular Google Drive.');
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
                'error' => 'Google Drive no está conectado. Por favor vincúlalo primero.',
            ], 400);
        }

        try {
            $folderName = $request->input('folder') ?? 'Archivos ERP';
            $result = $this->driveService->uploadFile($request->file('file'), $folderName);

            return response()->json([
                'success' => true,
                'file' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error al subir archivo a Google Drive: '.$e->getMessage(),
            ], 500);
        }
    }
}
