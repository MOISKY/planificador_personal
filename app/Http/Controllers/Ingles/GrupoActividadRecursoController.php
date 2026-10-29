<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Alumno;
use App\Models\Ingles\GrupoActividad;
use App\Models\Ingles\GrupoActividadEquipo;
use App\Models\Ingles\GrupoActividadRecurso;
use App\Models\Ingles\GrupoAlumno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadRecursoController extends Controller
{
    public function index(Request $request, GrupoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoActividadRecurso::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with(['alumno', 'estatusActual'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhereHas('alumno', function ($aq) use ($search): void {
                            $aq->where('Nombre', 'ilike', "%{$search}%")
                                ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                                ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                        });
                });
            })
            ->orderBy('IdActividadRecurso', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        // Alumnos disponibles según el TIPO de la actividad:
        // - Si Individual: ninguno (entidad débil, IdAlumno es NULL)
        // - Si Equipo: solo alumnos que pertenezcan al equipo de la actividad
        // - Si Grupo: solo alumnos inscritos en el grupo
        $alumnosDisponibles = collect();
        if ($actividad->Tipo === GrupoActividad::TIPO_EQUIPO) {
            $alumnosDisponibles = Alumno::query()
                ->whereIn('IdAlumno', function ($sub) use ($actividad): void {
                    $sub->select('IdAlumno')
                        ->from('ingles_grupo_actividad_equipo')
                        ->where('IdActividad', $actividad->IdActividad);
                })
                ->orderBy('ApellidoPaterno')
                ->orderBy('Nombre')
                ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);
        } elseif ($actividad->Tipo === GrupoActividad::TIPO_GRUPO) {
            $alumnosDisponibles = Alumno::query()
                ->whereIn('IdAlumno', function ($sub) use ($actividad): void {
                    $sub->select('IdAlumno')
                        ->from('ingles_grupo_alumno')
                        ->where('IdGrupo', $actividad->IdGrupo);
                })
                ->orderBy('ApellidoPaterno')
                ->orderBy('Nombre')
                ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);
        }

        $actividad->load(['grupo.periodo', 'grupo.materia']);

        return Inertia::render('ingles/grupos/actividades/recursos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'alumnosDisponibles' => $alumnosDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, GrupoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdAlumno' => ['nullable', 'integer', 'exists:ingles_alumno,IdAlumno'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        if ($actividad->Tipo === GrupoActividad::TIPO_INDIVIDUAL) {
            $validated['IdAlumno'] = null; // Entidad débil: forzar NULL por default
        } elseif ($actividad->Tipo === GrupoActividad::TIPO_EQUIPO) {
            if (! empty($validated['IdAlumno'])) {
                $enEquipo = GrupoActividadEquipo::where('IdActividad', $actividad->IdActividad)
                    ->where('IdAlumno', $validated['IdAlumno'])
                    ->exists();
                if (! $enEquipo) {
                    return back()->with('error', 'El alumno seleccionado debe pertenecer al equipo de esta actividad.');
                }
            }
        } elseif ($actividad->Tipo === GrupoActividad::TIPO_GRUPO) {
            if (! empty($validated['IdAlumno'])) {
                $enGrupo = GrupoAlumno::where('IdGrupo', $actividad->IdGrupo)
                    ->where('IdAlumno', $validated['IdAlumno'])
                    ->exists();
                if (! $enGrupo) {
                    return back()->with('error', 'El alumno seleccionado debe pertenecer al grupo de esta actividad.');
                }
            }
        }

        GrupoActividadRecurso::create($validated);

        return back()->with('success', 'Recurso o entrega registrado correctamente.');
    }

    public function update(Request $request, GrupoActividadRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdAlumno' => ['nullable', 'integer', 'exists:ingles_alumno,IdAlumno'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ]);

        if ($recurso->actividad && $recurso->actividad->Tipo === GrupoActividad::TIPO_INDIVIDUAL) {
            $validated['IdAlumno'] = null;
        }

        $recurso->update($validated);

        return back()->with('success', 'Recurso o entrega actualizado correctamente.');
    }

    public function destroy(GrupoActividadRecurso $recurso): RedirectResponse
    {
        $recurso->estatusKardex()->delete();
        $recurso->delete();

        return back()->with('success', 'Recurso eliminado correctamente.');
    }
}

