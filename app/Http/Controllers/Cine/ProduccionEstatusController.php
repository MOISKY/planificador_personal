<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Produccion;
use App\Models\ProduccionEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProduccionEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $estatus = trim((string) $request->string('estatus'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ProduccionEstatus::query()
            ->with('produccion.recursos')
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('produccion', function ($q) use ($search): void {
                    $q->where('NombreProduccion', 'like', "%{$search}%");
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdProduccionEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $producciones = Produccion::query()->orderBy('NombreProduccion')->get(['IdProduccion', 'NombreProduccion']);

        return Inertia::render('cine/estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'producciones' => $producciones,
            'estatusDisponibles' => ProduccionEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar la producción.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = ProduccionEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:viendo,por ver,visto'],
        ], [], [
            'Estatus' => 'estatus',
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $registro = ProduccionEstatus::findOrFail($id);
        $registro->delete();

        return back()->with('success', 'Registro de estatus eliminado.');
    }
}
