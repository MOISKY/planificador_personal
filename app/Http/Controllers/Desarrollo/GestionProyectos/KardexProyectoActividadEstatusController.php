<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminKardexProyectoActividadEstatus;
use App\Models\Admin\AdminProyectoActividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KardexProyectoActividadEstatusController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminKardexProyectoActividadEstatus::query()
            ->with(['actividad.proyecto'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Estatus', 'ilike', "%{$search}%")
                    ->orWhereHas('actividad', function ($sub) use ($search): void {
                        $sub->where('Nombre', 'ilike', "%{$search}%")
                            ->orWhereHas('proyecto', function ($p) use ($search): void {
                                $p->where('Nombre', 'ilike', "%{$search}%");
                            });
                    });
            })
            ->orderByDesc('IdAdminActividadEstatus');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $actividades = AdminProyectoActividad::with('proyecto')
            ->orderBy('Nombre')
            ->get(['IdActividad', 'Nombre', 'IdProyecto']);

        return Inertia::render('desarrollo/gestion-proyectos/kardex/actividades/index', [
            'items' => $items,
            'actividades' => $actividades,
            'estatusesDisponibles' => AdminKardexProyectoActividadEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdActividad' => ['required', 'integer', 'exists:admin_proyecto_actividad,IdActividad'],
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoActividadEstatus::ESTATUSES)],
        ]);

        AdminKardexProyectoActividadEstatus::create($validated);

        return back()->with('success', 'Estatus de actividad registrado en el kardex.');
    }
}
