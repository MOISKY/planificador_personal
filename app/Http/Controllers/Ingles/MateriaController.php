<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MateriaController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Materia::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%");
                })
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Materia::query()
            ->withCount('recursos')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%");
            })
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ingles/catalogos/materias/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
        ]);

        Materia::create($validated);

        return back()->with('success', 'Materia registrada correctamente.');
    }

    public function update(Request $request, Materia $materia): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
        ]);

        $materia->update($validated);

        return back()->with('success', 'Materia actualizada correctamente.');
    }

    public function destroy(Materia $materia): RedirectResponse
    {
        $materia->delete();

        return back()->with('success', 'Materia eliminada correctamente.');
    }
}

