<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\TipoOpinion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TipoOpinionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = TipoOpinion::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->withCount('comentarios')
            ->orderBy('IdTipoOpinion', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('cine/catalogos/tipos-opinion/index', [
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

        TipoOpinion::create($validated);

        return back()->with('success', 'Tipo de opinión registrado con éxito.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $registro = TipoOpinion::findOrFail($id);

        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
        ], [], [
            'Nombre' => 'nombre',
        ]);

        $registro->update($validated);

        return back()->with('success', 'Tipo de opinión actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $registro = TipoOpinion::findOrFail($id);
        $registro->delete();

        return back()->with('success', 'Tipo de opinión eliminado.');
    }
}
