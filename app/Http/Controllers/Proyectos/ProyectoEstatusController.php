<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\KardexProyectoEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $estatus = trim((string) ($request->input('estatus') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = KardexProyectoEstatus::query()
            ->with('proyecto')
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('proyecto', function ($q) use ($search): void {
                    $q->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%");
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdProyectoEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('proyectos/proyecto-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => KardexProyectoEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar el proyecto.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = KardexProyectoEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', Rule::in(KardexProyectoEstatus::TODOS_LOS_ESTATUS)],
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus del proyecto actualizado correctamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        return back()->with('error', 'Los registros del Kardex no pueden eliminarse, únicamente editarse.');
    }
}
