<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Mail\Admin\AdminRecursosActividadMail;
use App\Models\Admin\AdminKardexProyectoActividadRecursoEstatus;
use App\Models\Admin\AdminPersonal;
use App\Models\Admin\AdminProyectoActividad;
use App\Models\Admin\AdminProyectoActividadEquipo;
use App\Models\Admin\AdminProyectoActividadRecurso;
use App\Models\Admin\AdminProyectoPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoActividadRecursoController extends Controller
{
    public function index(Request $request, AdminProyectoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $actividad->load(['proyecto.estatusActual', 'modulo', 'estatusActual']);

        $query = AdminProyectoActividadRecurso::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with(['personal', 'estatusActual', 'estatusKardex'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('URLRecurso', 'ilike', "%{$search}%")
                        ->orWhereHas('personal', function ($p) use ($search): void {
                            $p->where('Nombre', 'ilike', "%{$search}%")
                                ->orWhere('APaterno', 'ilike', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('IdActividadRecurso');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        // REGLA DEL DIAGRAMA:
        // "LA SELECCION ESTARA FILTRADA POR QUE EL PERSONAL PERTENEZCA AL EQUIPO ACTUAL DE ACTIVIDAD"
        // Si la actividad es 'Equipo', personal disponible son los del equipo.
        // Si la actividad es 'Todos', personal disponible son todos los miembros del proyecto.
        // Si es 'Individual', puede asignarse a cualquier miembro del proyecto o ser nulo.
        if ($actividad->Tipo === AdminProyectoActividad::TIPO_EQUIPO) {
            $personalIds = AdminProyectoActividadEquipo::where('IdActividad', $actividad->IdActividad)
                ->pluck('IdPersonal');
        } else {
            $personalIds = AdminProyectoPersonal::where('IdProyecto', $actividad->IdProyecto)
                ->pluck('IdPersonal');
        }

        $personalDisponibles = AdminPersonal::query()
            ->whereIn('IdPersonal', $personalIds)
            ->where('EActivo', 'Si')
            ->orderBy('Nombre')
            ->get(['IdPersonal', 'Nombre', 'APaterno', 'AMaterno', 'CorreoElectronico']);

        // Destinatarios con correo para el modal de Enviar Correos
        $miembrosProyectoIds = AdminProyectoPersonal::where('IdProyecto', $actividad->IdProyecto)
            ->pluck('IdPersonal');

        $destinatariosDisponibles = AdminPersonal::query()
            ->whereIn('IdPersonal', $miembrosProyectoIds)
            ->whereNotNull('CorreoElectronico')
            ->where('CorreoElectronico', '!=', '')
            ->where('EActivo', 'Si')
            ->orderBy('Nombre')
            ->get(['IdPersonal', 'Nombre', 'APaterno', 'AMaterno', 'CorreoElectronico']);

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/actividades/recursos/index', [
            'actividad' => $actividad,
            'items' => $items,
            'personalDisponibles' => $personalDisponibles,
            'destinatariosDisponibles' => $destinatariosDisponibles,
            'estatusesDisponibles' => AdminKardexProyectoActividadRecursoEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, AdminProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdPersonal' => ['nullable', 'integer', 'exists:admin_personal,IdPersonal'],
            'URLRecurso' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        $recurso = AdminProyectoActividadRecurso::create($validated);

        return back()->with('success', "Recurso \"{$recurso->Nombre}\" registrado correctamente.");
    }

    public function update(Request $request, AdminProyectoActividad $actividad, AdminProyectoActividadRecurso $recurso): RedirectResponse
    {
        if ($recurso->IdActividad !== $actividad->IdActividad) {
            abort(404);
        }

        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'IdPersonal' => ['nullable', 'integer', 'exists:admin_personal,IdPersonal'],
            'URLRecurso' => ['nullable', 'string', 'max:1000'],
        ]);

        $recurso->update($validated);

        return back()->with('success', "Recurso \"{$recurso->Nombre}\" actualizado correctamente.");
    }

    public function destroy(AdminProyectoActividad $actividad, AdminProyectoActividadRecurso $recurso): RedirectResponse
    {
        if ($recurso->IdActividad !== $actividad->IdActividad) {
            abort(404);
        }

        $nombre = $recurso->Nombre;
        $recurso->delete();

        return back()->with('success', "Recurso \"{$nombre}\" eliminado correctamente.");
    }

    public function cambiarEstatus(Request $request, AdminProyectoActividad $actividad, AdminProyectoActividadRecurso $recurso): RedirectResponse
    {
        if ($recurso->IdActividad !== $actividad->IdActividad) {
            abort(404);
        }

        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoActividadRecursoEstatus::ESTATUSES)],
        ]);

        $recurso->estatusKardex()->create([
            'Estatus' => $validated['Estatus'],
        ]);

        return back()->with('success', "Estatus de recurso actualizado a \"{$validated['Estatus']}\".");
    }

    public function enviarRecursos(Request $request, AdminProyectoActividad $actividad): JsonResponse
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

        $actividad->load(['proyecto', 'modulo']);

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
                Mail::to($correo)->send(new AdminRecursosActividadMail(
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
}
