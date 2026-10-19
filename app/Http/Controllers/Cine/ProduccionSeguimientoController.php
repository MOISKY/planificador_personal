<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Produccion;
use App\Models\ProduccionSeguimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProduccionSeguimientoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ProduccionSeguimiento::query()
            ->with('produccion.recursos')
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Descripcion', "%{$search}%")
                    ->orWhereHas('produccion', function ($q) use ($search): void {
                        $q->whereLike('NombreProduccion', "%{$search}%");
                    });
            })
            ->orderBy('Fecha', 'desc')
            ->orderBy('Hora', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $producciones = Produccion::query()->orderBy('NombreProduccion')->get(['IdProduccion', 'NombreProduccion']);

        return Inertia::render('cine/seguimiento/index', [
            'items' => $items,
            'searchValue' => $search,
            'producciones' => $producciones,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdProduccion' => ['required', 'integer', 'exists:cine_produccion,IdProduccion'],
            'Fecha' => ['required', 'date'],
            'Hora' => ['required', 'string'],
            'Descripcion' => ['required', 'string'],
        ], [], [
            'IdProduccion' => 'producción',
            'Fecha' => 'fecha',
            'Hora' => 'hora',
            'Descripcion' => 'descripción de la bitácora',
        ]);

        ProduccionSeguimiento::create($validated);

        return back()->with('success', 'Registro de seguimiento agregado a la bitácora.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $seguimiento = ProduccionSeguimiento::findOrFail($id);
        $seguimiento->delete();

        return back()->with('success', 'Registro de bitácora eliminado.');
    }
}
