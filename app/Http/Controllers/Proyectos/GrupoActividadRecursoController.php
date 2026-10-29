<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\GrupoActividadEquipo;
use App\Models\Proyectos\GrupoActividadRecurso;
use App\Models\Proyectos\GrupoPersona;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\ProyectoActividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadRecursoController extends Controller
{
    public function index(Request $request, ProyectoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoActividadRecurso::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with(['persona', 'estatusActual'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhereHas('persona', function ($aq) use ($search): void {
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

        // Personas disponibles según el TIPO de la actividad:
        // - Si Individual: ninguna (entidad débil, IdPersona es NULL)
        // - Si Equipo: solo personas que pertenezcan al equipo de la actividad
        // - Si Grupo: solo personas asignadas al proyecto
        $personasDisponibles = collect();
        if ($actividad->Tipo === ProyectoActividad::TIPO_EQUIPO) {
            $personasDisponibles = Persona::query()
                ->whereIn('IdPersona', function ($sub) use ($actividad): void {
                    $sub->select('IdPersona')
                        ->from('proyectos_grupo_actividad_equipo')
                        ->where('IdActividad', $actividad->IdActividad);
                })
                ->orderBy('ApellidoPaterno')
                ->orderBy('Nombre')
                ->get();
        } elseif ($actividad->Tipo === ProyectoActividad::TIPO_GRUPO) {
            $personasDisponibles = Persona::query()
                ->whereIn('IdPersona', function ($sub) use ($actividad): void {
                    $sub->select('IdPersona')
                        ->from('proyectos_grupo_persona')
                        ->where('IdProyecto', $actividad->IdProyecto);
                })
                ->orderBy('ApellidoPaterno')
                ->orderBy('Nombre')
                ->get();
        }

        $actividad->load('proyecto');

        return Inertia::render('proyectos/proyectos/actividades/recursos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'personasDisponibles' => $personasDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, ProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdPersona' => ['nullable', 'integer', 'exists:proyectos_persona,IdPersona'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        if ($actividad->Tipo === ProyectoActividad::TIPO_INDIVIDUAL) {
            $validated['IdPersona'] = null; // Entidad débil: forzar NULL
        } elseif ($actividad->Tipo === ProyectoActividad::TIPO_EQUIPO) {
            if (! empty($validated['IdPersona'])) {
                $enEquipo = GrupoActividadEquipo::where('IdActividad', $actividad->IdActividad)
                    ->where('IdPersona', $validated['IdPersona'])
                    ->exists();
                if (! $enEquipo) {
                    return back()->with('error', 'La persona seleccionada debe pertenecer al equipo de esta actividad.');
                }
            }
        } elseif ($actividad->Tipo === ProyectoActividad::TIPO_GRUPO) {
            if (! empty($validated['IdPersona'])) {
                $enProyecto = GrupoPersona::where('IdProyecto', $actividad->IdProyecto)
                    ->where('IdPersona', $validated['IdPersona'])
                    ->exists();
                if (! $enProyecto) {
                    return back()->with('error', 'La persona seleccionada debe estar asignada al proyecto.');
                }
            }
        }

        GrupoActividadRecurso::create($validated);

        return back()->with('success', 'Recurso de actividad registrado correctamente.');
    }

    public function update(Request $request, GrupoActividadRecurso $recurso): RedirectResponse
    {
        $actividad = $recurso->actividad;

        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdPersona' => ['nullable', 'integer', 'exists:proyectos_persona,IdPersona'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ]);

        if ($actividad && $actividad->Tipo === ProyectoActividad::TIPO_INDIVIDUAL) {
            $validated['IdPersona'] = null; // Entidad débil: forzar NULL
        } elseif ($actividad && $actividad->Tipo === ProyectoActividad::TIPO_EQUIPO) {
            if (! empty($validated['IdPersona'])) {
                $enEquipo = GrupoActividadEquipo::where('IdActividad', $actividad->IdActividad)
                    ->where('IdPersona', $validated['IdPersona'])
                    ->exists();
                if (! $enEquipo) {
                    return back()->with('error', 'La persona seleccionada debe pertenecer al equipo de esta actividad.');
                }
            }
        } elseif ($actividad && $actividad->Tipo === ProyectoActividad::TIPO_GRUPO) {
            if (! empty($validated['IdPersona'])) {
                $enProyecto = GrupoPersona::where('IdProyecto', $actividad->IdProyecto)
                    ->where('IdPersona', $validated['IdPersona'])
                    ->exists();
                if (! $enProyecto) {
                    return back()->with('error', 'La persona seleccionada debe estar asignada al proyecto.');
                }
            }
        }

        $recurso->update($validated);

        return back()->with('success', 'Recurso de actividad actualizado correctamente.');
    }

    public function destroy(GrupoActividadRecurso $recurso): RedirectResponse
    {
        $recurso->estatusKardex()->delete();
        $recurso->delete();

        return back()->with('success', 'Recurso de actividad eliminado correctamente.');
    }
}

