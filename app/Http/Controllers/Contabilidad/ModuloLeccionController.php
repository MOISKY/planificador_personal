<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloLeccion;
use App\Models\Contabilidad\ModuloLeccionRecurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuloLeccionController extends Controller
{
    /**
     * Lista de lecciones (Web / Lectura).
     */
    public function index(Request $request): JsonResponse
    {
        $idModulo = $request->integer('IdModulo');
        $nombre = trim((string) ($request->input('Nombre') ?? $request->input('search') ?? ''));

        $items = ModuloLeccion::query()
            ->when($idModulo > 0, function ($query) use ($idModulo): void {
                $query->where('IdModulo', $idModulo);
            })
            ->when($nombre !== '', function ($query) use ($nombre): void {
                $query->whereLike('Nombre', "%{$nombre}%");
            })
            ->orderBy('IdLeccion', 'asc')
            ->get()
            ->map(function (ModuloLeccion $item): array {
                return [
                    'id' => (int) $item->IdLeccion,
                    'IdLeccion' => (int) $item->IdLeccion,
                    'IdModulo' => (int) $item->IdModulo,
                    'Nombre' => $item->Nombre,
                    'UrlLeccion' => $item->UrlLeccion,
                    'FechaRegistro' => $item->FechaRegistro,
                ];
            });

        return response()->json($items);
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
    public function indexRecurso(Request $request, ?ModuloLeccion $leccion = null): JsonResponse
    {
        $idLeccion = $leccion?->IdLeccion ?? ($request->integer('IdLeccion') ?: null);

        $items = ModuloLeccionRecurso::query()
            ->when($idLeccion !== null, function ($query) use ($idLeccion): void {
                $query->where('IdLeccion', $idLeccion);
            })
            ->orderBy('IdLeccionRecurso', 'asc')
            ->get()
            ->map(function (ModuloLeccionRecurso $recurso): array {
                return [
                    'id' => (int) $recurso->IdLeccionRecurso,
                    'IdLeccionRecurso' => (int) $recurso->IdLeccionRecurso,
                    'IdLeccion' => (int) $recurso->IdLeccion,
                    'Nombre' => $recurso->Nombre,
                    'URLRecurso' => $recurso->URLRecurso,
                    'FechaRegistro' => $recurso->FechaRegistro,
                ];
            });

        return response()->json($items);
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
}
