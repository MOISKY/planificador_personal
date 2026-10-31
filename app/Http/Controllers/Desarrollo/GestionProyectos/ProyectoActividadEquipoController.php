<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminPersonal;
use App\Models\Admin\AdminProyectoActividad;
use App\Models\Admin\AdminProyectoActividadEquipo;
use App\Models\Admin\AdminProyectoPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoActividadEquipoController extends Controller
{
    public function index(Request $request, AdminProyectoActividad $actividad): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));

        $actividad->load(['proyecto.estatusActual', 'modulo', 'estatusActual']);

        $integrantes = AdminProyectoActividadEquipo::query()
            ->where('IdActividad', $actividad->IdActividad)
            ->with('personal')
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('personal', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('APaterno', 'ilike', "%{$search}%")
                        ->orWhere('AMaterno', 'ilike', "%{$search}%")
                        ->orWhere('CorreoElectronico', 'ilike', "%{$search}%");
                });
            })
            ->orderByDesc('IdEquipo')
            ->get();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($integrantes);
        }

        // REGLA DEL DIAGRAMA:
        // "LA SELECCION ESTARA FILTRADA POR QUE EL PERSONAL PERTENEZCA COMO MIEMBRO ACTUAL DEL PROYECTO"
        $miembrosProyectoIds = AdminProyectoPersonal::where('IdProyecto', $actividad->IdProyecto)
            ->pluck('IdPersonal');

        $asignadosEquipoIds = AdminProyectoActividadEquipo::where('IdActividad', $actividad->IdActividad)
            ->pluck('IdPersonal');

        $personalDisponibles = AdminPersonal::query()
            ->whereIn('IdPersonal', $miembrosProyectoIds)
            ->whereNotIn('IdPersonal', $asignadosEquipoIds)
            ->where('EActivo', 'Si')
            ->orderBy('Nombre')
            ->get(['IdPersonal', 'Nombre', 'APaterno', 'AMaterno', 'CorreoElectronico']);

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/actividades/equipos/index', [
            'actividad' => $actividad,
            'integrantes' => $integrantes,
            'personalDisponibles' => $personalDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, AdminProyectoActividad $actividad): RedirectResponse
    {
        // REGLA: Personal debe pertenecer al proyecto
        $miembrosProyectoIds = AdminProyectoPersonal::where('IdProyecto', $actividad->IdProyecto)
            ->pluck('IdPersonal')
            ->toArray();

        $validated = $request->validate([
            'IdPersonal' => ['required', 'integer', function ($attribute, $value, $fail) use ($miembrosProyectoIds): void {
                if (! in_array((int) $value, $miembrosProyectoIds, true)) {
                    $fail('El personal seleccionado debe ser miembro registrado del proyecto.');
                }
            }],
        ]);

        $existe = AdminProyectoActividadEquipo::where('IdActividad', $actividad->IdActividad)
            ->where('IdPersonal', $validated['IdPersonal'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'El personal ya forma parte del equipo de esta actividad.');
        }

        AdminProyectoActividadEquipo::create([
            'IdActividad' => $actividad->IdActividad,
            'IdPersonal' => $validated['IdPersonal'],
        ]);

        return back()->with('success', 'Personal agregado al equipo de la actividad.');
    }

    public function destroy(AdminProyectoActividad $actividad, AdminProyectoActividadEquipo $equipo): RedirectResponse
    {
        if ($equipo->IdActividad !== $actividad->IdActividad) {
            abort(404);
        }

        $equipo->delete();

        return back()->with('success', 'Personal removido del equipo.');
    }
}
