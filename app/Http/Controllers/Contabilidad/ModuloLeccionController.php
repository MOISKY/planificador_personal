<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Modulo;
use App\Models\Contabilidad\ModuloLeccion;
use App\Models\Contabilidad\ModuloLeccionRecurso;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ModuloLeccionController extends Controller
{
    /**
     * Lista de lecciones (Web Inertia o JSON para API/Extensión).
     */
    public function index(Request $request): Response|JsonResponse
    {
        $idModulo = $request->integer('IdModulo');
        $search = trim((string) ($request->input('search') ?? $request->input('Nombre') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = ModuloLeccion::query()
                ->when($idModulo > 0, function ($query) use ($idModulo): void {
                    $query->where('IdModulo', $idModulo);
                })
                ->when($search !== '', function ($query) use ($search): void {
                    $query->whereLike('Nombre', "%{$search}%");
                })
                ->orderBy('IdLeccion', 'asc')
                ->get()
                ->map(fn (ModuloLeccion $item): array => [
                    'id' => (int) $item->IdLeccion,
                    'IdLeccion' => (int) $item->IdLeccion,
                    'IdModulo' => (int) $item->IdModulo,
                    'Nombre' => $item->Nombre,
                    'UrlLeccion' => $item->UrlLeccion,
                    'FechaRegistro' => $item->FechaRegistro,
                ]);

            return response()->json($apiItems);
        }

        $items = ModuloLeccion::query()
            ->with(['modulo:IdModulo,Modulo'])
            ->withCount(['recursos'])
            ->when($idModulo > 0, function ($query) use ($idModulo): void {
                $query->where('IdModulo', $idModulo);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdLeccion', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $modulos = Modulo::query()
            ->orderBy('Modulo')
            ->get(['IdModulo', 'Modulo']);

        $moduloSeleccionado = $idModulo > 0 ? Modulo::find($idModulo) : null;

        return Inertia::render('contabilidad/lecciones/index', [
            'items' => $items,
            'modulos' => $modulos,
            'moduloSeleccionado' => $moduloSeleccionado,
            'idModulo' => $idModulo > 0 ? $idModulo : null,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:contabilidad_modulo,IdModulo'],
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'IdModulo' => 'módulo',
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        ModuloLeccion::create($validated);

        return back()->with('success', 'Lección registrada correctamente.');
    }

    public function update(Request $request, ModuloLeccion $leccion): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        $leccion->update($validated);

        return back()->with('success', 'Lección actualizada correctamente.');
    }

    public function destroy(ModuloLeccion $leccion): RedirectResponse
    {
        $leccion->delete();

        return back()->with('success', 'Lección eliminada correctamente.');
    }

    // --- RECURSOS DENTRO DE LECCIONES ---

    /**
     * Lista de recursos asociados a una lección.
     */
    public function indexRecurso(Request $request, ModuloLeccion $leccion): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? $request->input('Nombre') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = ModuloLeccionRecurso::query()
                ->where('IdLeccion', $leccion->IdLeccion)
                ->when($search !== '', function ($query) use ($search): void {
                    $query->whereLike('Nombre', "%{$search}%");
                })
                ->orderBy('IdLeccionRecurso', 'asc')
                ->get()
                ->map(fn (ModuloLeccionRecurso $recurso): array => [
                    'id' => (int) $recurso->IdLeccionRecurso,
                    'IdLeccionRecurso' => (int) $recurso->IdLeccionRecurso,
                    'IdLeccion' => (int) $recurso->IdLeccion,
                    'Nombre' => $recurso->Nombre,
                    'URLRecurso' => $recurso->URLRecurso,
                    'FechaRegistro' => $recurso->FechaRegistro,
                ]);

            return response()->json($apiItems);
        }

        $items = ModuloLeccionRecurso::query()
            ->where('IdLeccion', $leccion->IdLeccion)
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdLeccionRecurso', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $leccion->load('modulo:IdModulo,Modulo');

        return Inertia::render('contabilidad/lecciones/recursos/index', [
            'leccion' => $leccion,
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function storeRecurso(Request $request, ModuloLeccion $leccion): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
        ]);

        $leccion->recursos()->create($validated);

        return back()->with('success', 'Recurso de lección agregado.');
    }

    public function updateRecurso(Request $request, ModuloLeccionRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso de lección actualizado.');
    }

    public function destroyRecurso(ModuloLeccionRecurso $recurso): RedirectResponse
    {
        $recurso->delete();

        return back()->with('success', 'Recurso de lección eliminado.');
    }

    // --- API MÉTODOS (DEDICADOS) ---

    public function apiIndex(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    public function apiStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:contabilidad_modulo,IdModulo'],
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'IdModulo' => 'módulo',
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        $leccion = ModuloLeccion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lección registrada correctamente.',
            'id' => (int) $leccion->IdLeccion,
            'data' => [
                'id' => (int) $leccion->IdLeccion,
                'IdLeccion' => (int) $leccion->IdLeccion,
                'IdModulo' => (int) $leccion->IdModulo,
                'Nombre' => $leccion->Nombre,
                'UrlLeccion' => $leccion->UrlLeccion,
                'FechaRegistro' => $leccion->FechaRegistro,
            ],
        ], 201);
    }

    public function apiUpdate(Request $request, ModuloLeccion $leccion): JsonResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        $leccion->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lección actualizada correctamente.',
            'id' => (int) $leccion->IdLeccion,
            'data' => [
                'id' => (int) $leccion->IdLeccion,
                'IdLeccion' => (int) $leccion->IdLeccion,
                'IdModulo' => (int) $leccion->IdModulo,
                'Nombre' => $leccion->Nombre,
                'UrlLeccion' => $leccion->UrlLeccion,
                'FechaRegistro' => $leccion->FechaRegistro,
            ],
        ]);
    }

    public function apiDestroy(ModuloLeccion $leccion): JsonResponse
    {
        $id = (int) $leccion->IdLeccion;
        $leccion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lección eliminada correctamente.',
            'id' => $id,
        ]);
    }

    /**
     * Preserva una lección en Supabase Storage (recibe ZIP o URL) y registra en BD.
     */
    public function apiPreservar(Request $request, SupabaseStorageService $storageService): JsonResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:contabilidad_modulo,IdModulo'],
            'Nombre' => ['required', 'string', 'max:200'],
            'Codigo' => ['nullable', 'string', 'max:100'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
            'archivo_zip' => ['nullable', 'file', 'max:51200'], // hasta 50MB
        ], [], [
            'IdModulo' => 'módulo',
            'Nombre' => 'nombre de la lección',
            'Codigo' => 'código de la lección',
            'UrlLeccion' => 'URL de la lección',
            'archivo_zip' => 'archivo ZIP',
        ]);

        $urlFinal = $validated['UrlLeccion'] ?? null;
        $filesCount = 0;

        // Si se envió un archivo ZIP de lección
        if ($request->hasFile('archivo_zip')) {
            $zipFile = $request->file('archivo_zip');
            $slug = ! empty($validated['Codigo'])
                ? Str::slug($validated['Codigo'])
                : Str::slug($validated['Nombre']);

            // 1. Guardar copia de seguridad permanente del ZIP en storage local
            $backupDir = storage_path('app/lecciones_zips');
            if (! File::isDirectory($backupDir)) {
                File::makeDirectory($backupDir, 0755, true);
            }
            $zipFile->move($backupDir, "{$slug}.zip");
            $savedZipPath = "{$backupDir}/{$slug}.zip";

            // 2. Descomprimir y subir a Supabase Storage en la nube
            $uploadResult = $storageService->extractZipAndUpload($savedZipPath, $slug);
            $urlFinal = $uploadResult['url'];
            $filesCount = $uploadResult['files_count'];
        }

        // 3. Crear o actualizar la lección en la base de datos
        $leccion = ModuloLeccion::updateOrCreate(
            [
                'IdModulo' => $validated['IdModulo'],
                'Nombre' => $validated['Nombre'],
            ],
            [
                'UrlLeccion' => $urlFinal,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Lección preservada y sincronizada correctamente en Supabase.',
            'id' => (int) $leccion->IdLeccion,
            'data' => [
                'id' => (int) $leccion->IdLeccion,
                'IdLeccion' => (int) $leccion->IdLeccion,
                'IdModulo' => (int) $leccion->IdModulo,
                'Nombre' => $leccion->Nombre,
                'UrlLeccion' => $leccion->UrlLeccion,
                'ArchivosSubidos' => $filesCount,
                'FechaRegistro' => $leccion->FechaRegistro,
            ],
        ], 201);
    }
}
