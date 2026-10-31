<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminKardexProyectoActividadRecursoEstatus;
use App\Models\Admin\AdminProyectoActividadRecurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KardexProyectoActividadRecursoEstatusController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminKardexProyectoActividadRecursoEstatus::query()
            ->with(['recurso.actividad.proyecto', 'recurso.personal'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Estatus', 'ilike', "%{$search}%")
                    ->orWhereHas('recurso', function ($sub) use ($search): void {
                        $sub->where('Nombre', 'ilike', "%{$search}%")
                            ->orWhereHas('actividad', function ($a) use ($search): void {
                                $a->where('Nombre', 'ilike', "%{$search}%");
                            });
                    });
            })
            ->orderByDesc('IdAdminActividadRecursoEstatus');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $recursos = AdminProyectoActividadRecurso::with('actividad')
            ->orderBy('Nombre')
            ->get(['IdActividadRecurso', 'Nombre', 'IdActividad']);

        return Inertia::render('desarrollo/gestion-proyectos/kardex/recursos/index', [
            'items' => $items,
            'recursos' => $recursos,
            'estatusesDisponibles' => AdminKardexProyectoActividadRecursoEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdActividadRecurso' => ['required', 'integer', 'exists:admin_proyecto_actividad_recurso,IdActividadRecurso'],
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoActividadRecursoEstatus::ESTATUSES)],
        ]);

        AdminKardexProyectoActividadRecursoEstatus::create($validated);

        return back()->with('success', 'Estatus de recurso registrado en el kardex.');
    }
}
