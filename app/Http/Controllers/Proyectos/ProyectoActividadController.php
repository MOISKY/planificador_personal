<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\ProyectoActividad;
use App\Models\Proyectos\ProyectoActividadAdicional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoActividadController extends Controller
{
    public function index(Request $request, Proyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $tipo = trim((string) ($request->input('tipo') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = ProyectoActividad::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with(['actividadesAdicionales', 'estatusActual'])
            ->withCount(['actividadesAdicionales', 'equipos', 'recursos'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%");
                });
            })
            ->when($tipo !== '', function ($q) use ($tipo): void {
                $q->where('Tipo', $tipo);
            })
            ->orderBy('IdActividad', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        return Inertia::render('proyectos/proyectos/actividades/index', [
            'proyecto' => $proyecto,
            'items' => $items,
            'tiposDisponibles' => ProyectoActividad::TIPOS,
            'tipoSeleccionado' => $tipo,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'Tipo' => ['required', 'string', Rule::in(ProyectoActividad::TIPOS)],
        ]);

        $validated['IdProyecto'] = $proyecto->IdProyecto;

        ProyectoActividad::create($validated);

        return back()->with('success', 'Actividad registrada correctamente.');
    }

    public function update(Request $request, ProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'Tipo' => ['required', 'string', Rule::in(ProyectoActividad::TIPOS)],
        ]);

        $actividad->update($validated);

        return back()->with('success', 'Actividad actualizada correctamente.');
    }

    public function destroy(ProyectoActividad $actividad): RedirectResponse
    {
        $actividad->actividadesAdicionales()->delete();
        $actividad->equipos()->delete();
        $actividad->recursos()->delete();
        $actividad->estatusKardex()->delete();
        $actividad->delete();

        return back()->with('success', 'Actividad eliminada correctamente.');
    }

    // --- ACTIVIDADES ADICIONALES (DRAWER MOSTRAR, AGREGAR, ELIMINAR) ---

    public function storeAdicional(Request $request, ProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Descripcion' => ['required', 'string'],
            'UrlRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        ProyectoActividadAdicional::create($validated);

        return back()->with('success', 'Actividad adicional agregada correctamente.');
    }

    public function destroyAdicional(ProyectoActividadAdicional $adicional): RedirectResponse
    {
        $adicional->delete();

        return back()->with('success', 'Actividad adicional eliminada correctamente.');
    }
}

