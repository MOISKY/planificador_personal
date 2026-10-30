<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\KardexGrupoActividadEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GrupoActividadEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $estatus = trim((string) ($request->input('estatus') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = KardexGrupoActividadEstatus::query()
            ->with(['actividad.grupo'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('actividad', function ($q) use ($search): void {
                    $q->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhereHas('grupo', fn ($g) => $g->where('Grupo', 'ilike', "%{$search}%"));
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdActividadEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ingles/grupo-actividades-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => KardexGrupoActividadEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar la actividad.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = KardexGrupoActividadEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', Rule::in(KardexGrupoActividadEstatus::TODOS_LOS_ESTATUS)],
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus de la actividad actualizado correctamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        return back()->with('error', 'Los registros del Kardex no pueden eliminarse, únicamente editarse.');
    }
}
