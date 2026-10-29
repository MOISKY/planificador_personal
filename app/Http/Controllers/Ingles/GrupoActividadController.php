<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Grupo;
use App\Models\Ingles\GrupoActividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadController extends Controller
{
    public function index(Request $request, Grupo $grupo): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $tipo = trim((string) ($request->input('Tipo') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoActividad::query()
            ->where('IdGrupo', $grupo->IdGrupo)
            ->with(['estatusActual', 'actividadesAdicionales'])
            ->withCount(['actividadesAdicionales', 'equipos', 'recursos'])
            ->when($tipo !== '', fn ($q) => $q->where('Tipo', $tipo))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('Descripcion', 'ilike', "%{$search}%");
            })
            ->orderBy('IdActividad', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $grupo->load(['periodo', 'materia', 'asesor']);

        return Inertia::render('ingles/grupos/actividades/index', [
            'grupo' => $grupo,
            'items' => $items,
            'tipos' => GrupoActividad::TIPOS,
            'tipoSeleccionado' => $tipo,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Grupo $grupo): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'Tipo' => ['required', 'string', Rule::in(GrupoActividad::TIPOS)],
        ]);

        $validated['IdGrupo'] = $grupo->IdGrupo;

        GrupoActividad::create($validated);

        return back()->with('success', 'Actividad registrada correctamente.');
    }

    public function update(Request $request, GrupoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'Tipo' => ['required', 'string', Rule::in(GrupoActividad::TIPOS)],
        ]);

        $actividad->update($validated);

        return back()->with('success', 'Actividad actualizada correctamente.');
    }

    public function destroy(GrupoActividad $actividad): RedirectResponse
    {
        $actividad->actividadesAdicionales()->delete();
        $actividad->equipos()->delete();
        $actividad->recursos()->delete();
        $actividad->estatusKardex()->delete();
        $actividad->delete();

        return back()->with('success', 'Actividad eliminada correctamente.');
    }
}

