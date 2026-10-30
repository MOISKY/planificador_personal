<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloRetoRecursoEstatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuloRetoRecursoEstatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $estatus = trim((string) $request->string('estatus'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ModuloRetoRecursoEstatus::query()
            ->with(['recurso.reto.modulo'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('recurso', function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereHas('reto', function ($r) use ($search): void {
                            $r->whereLike('Nombre', "%{$search}%")
                                ->orWhereHas('modulo', function ($m) use ($search): void {
                                    $m->whereLike('Modulo', "%{$search}%");
                                });
                        });
                });
            })
            ->when($estatus !== '', function ($query) use ($estatus): void {
                $query->where('Estatus', $estatus);
            })
            ->orderBy('IdRetoRecursoEstatus', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/retos-recursos-estatus/index', [
            'items' => $items,
            'searchValue' => $search,
            'estatusSeleccionado' => $estatus,
            'estatusDisponibles' => ModuloRetoRecursoEstatus::TODOS_LOS_ESTATUS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return back()->with('error', 'El estatus se genera automáticamente al registrar el recurso del reto.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = ModuloRetoRecursoEstatus::findOrFail($id);

        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:No Realizado,En Proceso,Realizado'],
        ], [], [
            'Estatus' => 'estatus',
        ]);

        $registro->update($validated);

        return back()->with('success', 'Estatus de recurso de reto actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        return back()->with('error', 'Los registros del Kardex no pueden eliminarse, únicamente editarse.');
    }
}
