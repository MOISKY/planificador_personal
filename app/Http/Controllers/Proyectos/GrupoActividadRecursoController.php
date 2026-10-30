<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Mail\Proyectos\RecursosActividadMail;
use App\Models\Proyectos\GrupoActividadEquipo;
use App\Models\Proyectos\GrupoActividadRecurso;
use App\Models\Proyectos\GrupoPersona;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\ProyectoActividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

        // Integrantes asignados al proyecto en proyectos_grupo_persona con correo y rol
        $personasGrupo = GrupoPersona::query()
            ->where('IdProyecto', $actividad->IdProyecto)
            ->with(['persona', 'rol'])
            ->get()
            ->map(function ($gp) {
                $p = $gp->persona;
                if (! $p) {
                    return null;
                }

                return [
                    'IdPersona' => $p->IdPersona,
                    'Nombre' => $p->nombre_completo ?: trim($p->Nombre.' '.$p->ApellidoPaterno),
                    'correoElectronico' => $p->correoElectronico,
                    'Rol' => $gp->rol?->Rol ?? 'Miembro',
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('proyectos/proyectos/actividades/recursos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'personasDisponibles' => $personasDisponibles,
            'personasGrupo' => $personasGrupo,
            'searchValue' => $search,
        ]);
    }

    public function enviarRecursos(Request $request, ProyectoActividad $actividad): JsonResponse
    {
        $validated = $request->validate([
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*.correo' => ['required', 'email'],
            'destinatarios.*.nombre' => ['nullable', 'string', 'max:200'],
            'formato' => ['required', 'string', 'in:xlsx,csv'],
            'archivo_base64' => ['required', 'string'],
            'archivo_nombre' => ['nullable', 'string', 'max:255'],
            'asunto' => ['nullable', 'string', 'max:255'],
            'mensaje' => ['nullable', 'string', 'max:1000'],
        ]);

        $actividad->load('proyecto');

        $archivoBytes = base64_decode($validated['archivo_base64']);
        $formato = strtolower($validated['formato']);
        $extension = '.'.$formato;
        $nombreLimpio = Str::slug($actividad->Nombre, '_');
        $archivoNombre = $validated['archivo_nombre'] ?? "Recursos_{$nombreLimpio}{$extension}";
        if (! str_ends_with(strtolower($archivoNombre), $extension)) {
            $archivoNombre .= $extension;
        }

        $mimeType = $formato === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv;charset=utf-8;';

        $enviados = 0;
        $fallidos = [];

        foreach ($validated['destinatarios'] as $dest) {
            $correo = trim($dest['correo']);
            $nombre = ! empty($dest['nombre']) ? trim($dest['nombre']) : 'Equipo';

            try {
                Mail::to($correo)->send(new RecursosActividadMail(
                    actividad: $actividad,
                    nombreDestinatario: $nombre,
                    mensajePersonalizado: $validated['mensaje'] ?? null,
                    archivoBytes: $archivoBytes,
                    archivoNombre: $archivoNombre,
                    mimeType: $mimeType,
                    formato: $formato,
                    asunto: $validated['asunto'] ?? null,
                ));
                $enviados++;
            } catch (\Throwable $e) {
                $fallidos[] = [
                    'correo' => $correo,
                    'error' => $e->getMessage(),
                ];
            }
        }

        if ($enviados === 0 && ! empty($fallidos)) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo enviar el correo: '.($fallidos[0]['error'] ?? 'Error desconocido al conectar con el servidor de correo'),
                'fallidos' => $fallidos,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Recursos enviados exitosamente a {$enviados} destinatario(s).",
            'enviados' => $enviados,
            'fallidos' => $fallidos,
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
