<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\GrupoActividadEquipo;
use App\Models\Proyectos\GrupoPersona;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\ProyectoActividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadEquipoController extends Controller
{
    public function index(Request $request, ProyectoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoActividadEquipo::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with(['persona'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('persona', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('IdEquipo', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        // Personas disponibles: SOLO personas asignadas al proyecto actual de la actividad
        $personasDisponibles = Persona::query()
            ->whereIn('IdPersona', function ($sub) use ($actividad): void {
                $sub->select('IdPersona')
                    ->from('proyectos_grupo_persona')
                    ->where('IdProyecto', $actividad->IdProyecto);
            })
            ->whereNotIn('IdPersona', function ($sub) use ($actividad): void {
                $sub->select('IdPersona')
                    ->from('proyectos_grupo_actividad_equipo')
                    ->where('IdActividad', $actividad->IdActividad);
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->get();

        $actividad->load('proyecto');

        return Inertia::render('proyectos/proyectos/actividades/equipos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'personasDisponibles' => $personasDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, ProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'IdPersona' => ['required', 'integer', 'exists:proyectos_persona,IdPersona'],
        ]);

        $perteneceAlProyecto = GrupoPersona::where('IdProyecto', $actividad->IdProyecto)
            ->where('IdPersona', $validated['IdPersona'])
            ->exists();

        if (! $perteneceAlProyecto) {
            return back()->with('error', 'La persona debe estar asignada al proyecto actual.');
        }

        $existe = GrupoActividadEquipo::where('IdActividad', $actividad->IdActividad)
            ->where('IdPersona', $validated['IdPersona'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'La persona ya está asignada al equipo de esta actividad.');
        }

        $validated['IdActividad'] = $actividad->IdActividad;

        GrupoActividadEquipo::create($validated);

        return back()->with('success', 'Persona agregada al equipo correctamente.');
    }

    public function destroy(GrupoActividadEquipo $equipo): RedirectResponse
    {
        $equipo->delete();

        return back()->with('success', 'Persona removida del equipo.');
    }
}

