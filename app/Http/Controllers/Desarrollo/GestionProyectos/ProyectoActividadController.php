<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminKardexProyectoActividadEstatus;
use App\Models\Admin\AdminModulo;
use App\Models\Admin\AdminProyecto;
use App\Models\Admin\AdminProyectoActividad;
use App\Models\Admin\AdminProyectoModulo;
use App\Models\Admin\AdminProyectoPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoActividadController extends Controller
{
    public function index(Request $request, AdminProyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $proyecto->load(['estatusActual', 'miembros.personal', 'modulos.modulo']);

        $query = AdminProyectoActividad::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with([
                'modulo',
                'estatusActual',
                'actividadesAdicionales',
                'equipos.personal',
                'recursos.personal',
                'recursos.estatusActual',
            ])
            ->withCount(['actividadesAdicionales', 'equipos', 'recursos'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%")
                        ->orWhere('Tipo', 'ilike', "%{$search}%")
                        ->orWhereHas('modulo', function ($m) use ($search): void {
                            $m->where('Nombre', 'ilike', "%{$search}%")
                                ->orWhere('Codigo', 'ilike', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('IdActividad');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        // REGLA DEL DIAGRAMA:
        // "SOLO SE PODRAN SELECCIONAR LOS MODULOS QUE ESTAN EN LA LISTA DE PROYECTO admin_proyecto_modulo"
        $modulosValidosIds = AdminProyectoModulo::where('IdProyecto', $proyecto->IdProyecto)
            ->pluck('IdModulo');

        $modulosProyecto = AdminModulo::query()
            ->whereIn('IdModulo', $modulosValidosIds)
            ->orderBy('Nombre')
            ->get(['IdModulo', 'Codigo', 'Nombre']);

        // Miembros actuales del proyecto para asignaciones
        $miembrosProyecto = AdminProyectoPersonal::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with('personal')
            ->get()
            ->map(fn ($mp) => $mp->personal)
            ->filter()
            ->values();

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/actividades/index', [
            'proyecto' => $proyecto,
            'items' => $items,
            'modulosProyecto' => $modulosProyecto,
            'miembrosProyecto' => $miembrosProyecto,
            'tiposDisponibles' => AdminProyectoActividad::TIPOS,
            'estatusesDisponibles' => AdminKardexProyectoActividadEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, AdminProyecto $proyecto): RedirectResponse
    {
        // REGLA: Validar que el módulo pertenezca al proyecto
        $modulosValidosIds = AdminProyectoModulo::where('IdProyecto', $proyecto->IdProyecto)
            ->pluck('IdModulo')
            ->toArray();

        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'IdModulo' => ['nullable', 'integer', function ($attribute, $value, $fail) use ($modulosValidosIds): void {
                if ($value && ! in_array((int) $value, $modulosValidosIds, true)) {
                    $fail('El módulo seleccionado no pertenece a la lista de módulos de este proyecto.');
                }
            }],
            'Tipo' => ['required', 'string', 'in:'.implode(',', AdminProyectoActividad::TIPOS)],
        ]);

        $validated['IdProyecto'] = $proyecto->IdProyecto;

        $actividad = AdminProyectoActividad::create($validated);

        return back()->with('success', "Actividad \"{$actividad->Nombre}\" registrada correctamente.");
    }

    public function update(Request $request, AdminProyecto $proyecto, AdminProyectoActividad $actividad): RedirectResponse
    {
        if ($actividad->IdProyecto !== $proyecto->IdProyecto) {
            abort(404);
        }

        $modulosValidosIds = AdminProyectoModulo::where('IdProyecto', $proyecto->IdProyecto)
            ->pluck('IdModulo')
            ->toArray();

        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaEntrega' => ['nullable', 'date'],
            'IdModulo' => ['nullable', 'integer', function ($attribute, $value, $fail) use ($modulosValidosIds): void {
                if ($value && ! in_array((int) $value, $modulosValidosIds, true)) {
                    $fail('El módulo seleccionado no pertenece a la lista de módulos de este proyecto.');
                }
            }],
            'Tipo' => ['required', 'string', 'in:'.implode(',', AdminProyectoActividad::TIPOS)],
        ]);

        $actividad->update($validated);

        return back()->with('success', "Actividad \"{$actividad->Nombre}\" actualizada correctamente.");
    }

    public function destroy(AdminProyecto $proyecto, AdminProyectoActividad $actividad): RedirectResponse
    {
        if ($actividad->IdProyecto !== $proyecto->IdProyecto) {
            abort(404);
        }

        $nombre = $actividad->Nombre;
        $actividad->delete();

        return back()->with('success', "Actividad \"{$nombre}\" eliminada correctamente.");
    }

    public function cambiarEstatus(Request $request, AdminProyecto $proyecto, AdminProyectoActividad $actividad): RedirectResponse
    {
        if ($actividad->IdProyecto !== $proyecto->IdProyecto) {
            abort(404);
        }

        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoActividadEstatus::ESTATUSES)],
        ]);

        $actividad->estatusKardex()->create([
            'Estatus' => $validated['Estatus'],
        ]);

        return back()->with('success', "Estatus de actividad actualizado a \"{$validated['Estatus']}\".");
    }
}
