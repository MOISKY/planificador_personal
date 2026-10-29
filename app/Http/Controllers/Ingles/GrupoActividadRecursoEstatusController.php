<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\KardexGrupoActividadRecursoEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadRecursoEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $estatus = trim((string) ($request->input('estatus') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = KardexGrupoActividadRecursoEstatus::query()
            ->with(['recurso.actividad.grupo', 'recurso.alumno'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('recurso', function ($q) use ($search): void {
                    $q->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhereHas('actividad', fn ($a) => $a->where('Nombre', 'ilike', "%{$search}%"))
                        ->orWhereHas('alumno', function ($al) use ($search): void {
                            $al->where('Nombre', 'ilike', "%{$search}%")
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

        return Inertia::render('ingles/grupo-actividad-recursos-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => KardexGrupoActividadRecursoEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar el recurso de la actividad.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = KardexGrupoActividadRecursoEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', Rule::in(KardexGrupoActividadRecursoEstatus::TODOS_LOS_ESTATUS)],
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus del recurso actualizado correctamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $registro = KardexGrupoActividadRecursoEstatus::findOrFail($id);
        $registro->delete();

        return back()->with('success', 'Registro de estatus eliminado.');
    }
}

