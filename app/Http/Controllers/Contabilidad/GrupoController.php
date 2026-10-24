<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Grupo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Grupo::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Grupo', "%{$search}%");
            })
            ->orderBy('IdGrupo', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/catalogos/grupos/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Grupo' => ['required', 'string', 'max:100'],
        ], [], [
            'Grupo' => 'nombre del grupo',
        ]);

        Grupo::create($validated);

        return back()->with('success', 'Grupo registrado correctamente.');
    }

    public function update(Request $request, Grupo $grupo): RedirectResponse
    {
        $validated = $request->validate([
            'Grupo' => ['required', 'string', 'max:100'],
        ], [], [
            'Grupo' => 'nombre del grupo',
        ]);

        $grupo->update($validated);

        return back()->with('success', 'Grupo actualizado correctamente.');
    }

    public function destroy(Grupo $grupo): RedirectResponse
    {
        $grupo->delete();

        return back()->with('success', 'Grupo eliminado correctamente.');
    }
}
