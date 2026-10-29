<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Alumno;
use App\Models\Ingles\GrupoActividad;
use App\Models\Ingles\GrupoActividadEquipo;
use App\Models\Ingles\GrupoAlumno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadEquipoController extends Controller
{
    public function index(Request $request, GrupoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoActividadEquipo::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with(['alumno'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('alumno', function ($sub) use ($search): void {
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

        // Alumnos disponibles: SOLO alumnos que pertenezcan al grupo actual de la actividad
        $alumnosDisponibles = Alumno::query()
            ->whereIn('IdAlumno', function ($sub) use ($actividad): void {
                $sub->select('IdAlumno')
                    ->from('ingles_grupo_alumno')
                    ->where('IdGrupo', $actividad->IdGrupo);
            })
            ->whereNotIn('IdAlumno', function ($sub) use ($actividad): void {
                $sub->select('IdAlumno')
                    ->from('ingles_grupo_actividad_equipo')
                    ->where('IdActividad', $actividad->IdActividad);
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        $actividad->load(['grupo.periodo', 'grupo.materia']);

        return Inertia::render('ingles/grupos/actividades/equipos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'alumnosDisponibles' => $alumnosDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, GrupoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'IdAlumno' => ['required', 'integer', 'exists:ingles_alumno,IdAlumno'],
        ]);

        $pertenece = GrupoAlumno::where('IdGrupo', $actividad->IdGrupo)
            ->where('IdAlumno', $validated['IdAlumno'])
            ->exists();

        if (! $pertenece) {
            return back()->with('error', 'El alumno debe pertenecer al grupo actual de la actividad.');
        }

        $existe = GrupoActividadEquipo::where('IdActividad', $actividad->IdActividad)
            ->where('IdAlumno', $validated['IdAlumno'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'El alumno ya está asignado al equipo de esta actividad.');
        }

        $validated['IdActividad'] = $actividad->IdActividad;

        GrupoActividadEquipo::create($validated);

        return back()->with('success', 'Alumno agregado al equipo correctamente.');
    }

    public function destroy(GrupoActividadEquipo $equipo): RedirectResponse
    {
        $equipo->delete();

        return back()->with('success', 'Alumno removido del equipo.');
    }
}

