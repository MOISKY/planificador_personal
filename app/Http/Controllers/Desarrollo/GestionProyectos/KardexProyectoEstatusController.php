<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminKardexProyectoEstatus;
use App\Models\Admin\AdminProyecto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KardexProyectoEstatusController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminKardexProyectoEstatus::query()
            ->with('proyecto')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Estatus', 'ilike', "%{$search}%")
                    ->orWhereHas('proyecto', function ($sub) use ($search): void {
                        $sub->where('Nombre', 'ilike', "%{$search}%");
                    });
            })
            ->orderByDesc('IdAdminProyectoEstatus');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $proyectos = AdminProyecto::orderBy('Nombre')->get(['IdProyecto', 'Nombre']);

        return Inertia::render('desarrollo/gestion-proyectos/kardex/proyectos/index', [
            'items' => $items,
            'proyectos' => $proyectos,
            'estatusesDisponibles' => AdminKardexProyectoEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdProyecto' => ['required', 'integer', 'exists:admin_proyecto,IdProyecto'],
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoEstatus::ESTATUSES)],
        ]);

        AdminKardexProyectoEstatus::create($validated);

        return back()->with('success', 'Estatus de proyecto registrado en el kardex.');
    }
}
