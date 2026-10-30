<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\KardexProyectoActividadRecursoEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoActividadRecursoEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $estatus = trim((string) ($request->input('estatus') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = KardexProyectoActividadRecursoEstatus::query()
            ->with(['recurso.actividad.proyecto', 'recurso.persona'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('recurso', function ($q) use ($search): void {
                    $q->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhereHas('actividad', function ($act) use ($search): void {
                            $act->where('Nombre', 'ilike', "%{$search}%")
                                ->orWhereHas('proyecto', fn ($p) => $p->where('Nombre', 'ilike', "%{$search}%"));
                        })
                        ->orWhereHas('persona', function ($per) use ($search): void {
                            $per->where('Nombre', 'ilike', "%{$search}%")
                                ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                                ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                        });
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdActividadRecursoEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('proyectos/proyecto-actividad-recursos-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => KardexProyectoActividadRecursoEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar el recurso de la actividad.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = KardexProyectoActividadRecursoEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', Rule::in(KardexProyectoActividadRecursoEstatus::TODOS_LOS_ESTATUS)],
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus del recurso actualizado correctamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        return back()->with('error', 'Los registros del Kardex no pueden eliminarse, únicamente editarse.');
    }
}
