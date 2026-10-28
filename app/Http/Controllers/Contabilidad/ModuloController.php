<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Alumno;
use App\Models\Contabilidad\Modulo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuloController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) ($request->input('IdModuloUveg') ?? $request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Modulo::query()
            ->withCount(['retos', 'lecciones'])
            ->with([
                'retos.recursos',
                'retos.actividadesAlumnos.alumno',
                'lecciones.recursos',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('IdModuloUveg', "%{$search}%");
            })
            ->orderBy('IdModulo', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $alumnos = Alumno::query()
            ->orderBy('Nombre')
            ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        return Inertia::render('contabilidad/modulos/index', [
            'items' => $items,
            'searchValue' => $search,
            'alumnos' => $alumnos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdModuloUveg' => ['nullable', 'string', 'max:50'],
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'IdModuloUveg' => 'ID del módulo UVEG',
            'Modulo' => 'nombre del módulo',
        ]);

        Modulo::create($validated);

        return back()->with('success', 'Módulo registrado correctamente.');
    }

    public function update(Request $request, Modulo $modulo): RedirectResponse
    {
        $validated = $request->validate([
            'IdModuloUveg' => ['nullable', 'string', 'max:50'],
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'IdModuloUveg' => 'ID del módulo UVEG',
            'Modulo' => 'nombre del módulo',
        ]);

        $modulo->update($validated);

        return back()->with('success', 'Módulo actualizado correctamente.');
    }

    public function destroy(Modulo $modulo): RedirectResponse
    {
        $modulo->delete();

        return back()->with('success', 'Módulo eliminado correctamente.');
    }

    // --- API MÉTODOS ---

    public function apiIndex(Request $request): JsonResponse
    {
        $search = trim((string) ($request->input('IdModuloUveg') ?? $request->input('search') ?? $request->input('Nombre') ?? ''));

        $items = Modulo::query()
            ->withCount(['retos', 'lecciones'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('IdModuloUveg', "%{$search}%");
            })
            ->orderBy('IdModulo', 'desc')
            ->get()
            ->map(function (Modulo $item): array {
                return [
                    'id' => (int) $item->IdModulo,
                    'IdModulo' => (int) $item->IdModulo,
                    'IdModuloUveg' => $item->IdModuloUveg,
                    'Modulo' => $item->Modulo,
                    'FechaRegistro' => $item->FechaRegistro,
                    'lecciones_count' => (int) ($item->lecciones_count ?? 0),
                    'retos_count' => (int) ($item->retos_count ?? 0),
                ];
            });

        return response()->json($items);
    }

    public function apiStore(Request $request): JsonResponse
    {
        if ($request->filled('Nombre') && ! $request->filled('Modulo')) {
            $request->merge(['Modulo' => $request->input('Nombre')]);
        }

        $validated = $request->validate([
            'IdModuloUveg' => ['nullable', 'string', 'max:50'],
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'IdModuloUveg' => 'ID del módulo UVEG',
            'Modulo' => 'nombre del módulo',
        ]);

        $modulo = Modulo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Módulo registrado correctamente.',
            'id' => (int) $modulo->IdModulo,
            'data' => [
                'id' => (int) $modulo->IdModulo,
                'IdModulo' => (int) $modulo->IdModulo,
                'IdModuloUveg' => $modulo->IdModuloUveg,
                'Modulo' => $modulo->Modulo,
                'FechaRegistro' => $modulo->FechaRegistro,
            ],
        ], 201);
    }

    public function apiUpdate(Request $request, Modulo $modulo): JsonResponse
    {
        if ($request->filled('Nombre') && ! $request->filled('Modulo')) {
            $request->merge(['Modulo' => $request->input('Nombre')]);
        }

        $validated = $request->validate([
            'IdModuloUveg' => ['nullable', 'string', 'max:50'],
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'IdModuloUveg' => 'ID del módulo UVEG',
            'Modulo' => 'nombre del módulo',
        ]);

        $modulo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Módulo actualizado correctamente.',
            'id' => (int) $modulo->IdModulo,
            'data' => [
                'id' => (int) $modulo->IdModulo,
                'IdModulo' => (int) $modulo->IdModulo,
                'IdModuloUveg' => $modulo->IdModuloUveg,
                'Modulo' => $modulo->Modulo,
                'FechaRegistro' => $modulo->FechaRegistro,
            ],
        ]);
    }

    public function apiDestroy(Modulo $modulo): JsonResponse
    {
        $id = (int) $modulo->IdModulo;
        $modulo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Módulo eliminado correctamente.',
            'id' => $id,
        ]);
    }
}
