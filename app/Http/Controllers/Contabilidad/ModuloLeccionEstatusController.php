<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloLeccionEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuloLeccionEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $estatus = trim((string) $request->string('estatus'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ModuloLeccionEstatus::query()
            ->with(['leccion.modulo'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('leccion', function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereHas('modulo', function ($m) use ($search): void {
                            $m->whereLike('Modulo', "%{$search}%");
                        });
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdLeccionEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/lecciones-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => ModuloLeccionEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar la lección.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = ModuloLeccionEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:No leido,Leyendo,Leido'],
        ], [], [
            'Estatus' => 'estatus',
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus de lección actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $registro = ModuloLeccionEstatus::findOrFail($id);
        $registro->delete();

        return back()->with('success', 'Registro de estatus eliminado.');
    }
}
