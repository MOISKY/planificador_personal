<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Oportunidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OportunidadController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Oportunidad::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdOportunidad', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/catalogos/oportunidades/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
        ], [], [
            'Nombre' => 'nombre',
        ]);

        Oportunidad::create($validated);

        return back()->with('success', 'Oportunidad registrada correctamente.');
    }

    public function update(Request $request, Oportunidad $oportunidade): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
        ], [], [
            'Nombre' => 'nombre',
        ]);

        $oportunidade->update($validated);

        return back()->with('success', 'Oportunidad actualizada correctamente.');
    }

    public function destroy(Oportunidad $oportunidade): RedirectResponse
    {
        $oportunidade->delete();

        return back()->with('success', 'Oportunidad eliminada correctamente.');
    }
}
