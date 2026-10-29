<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Materia;
use App\Models\Ingles\MateriaRecurso;
use App\Models\Ingles\MateriaRecursoAdicional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MateriaRecursoController extends Controller
{
    public function index(Request $request, Materia $materia): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = MateriaRecurso::query()
            ->where('IdMateria', $materia->IdMateria)
            ->with(['recursosAdicionales'])
            ->withCount('recursosAdicionales')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('Descripcion', 'ilike', "%{$search}%");
            })
            ->orderBy('Nombre');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        return Inertia::render('ingles/catalogos/materias/recursos/index', [
            'materia' => $materia,
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Materia $materia): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $validated['IdMateria'] = $materia->IdMateria;

        MateriaRecurso::create($validated);

        return back()->with('success', 'Recurso de materia registrado correctamente.');
    }

    public function update(Request $request, MateriaRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso de materia actualizado correctamente.');
    }

    public function destroy(MateriaRecurso $recurso): RedirectResponse
    {
        $recurso->recursosAdicionales()->delete();
        $recurso->delete();

        return back()->with('success', 'Recurso de materia eliminado correctamente.');
    }

    // --- RECURSOS ADICIONALES (DRAWER MOSTRAR, AGREGAR, ELIMINAR) ---

    public function storeAdicional(Request $request, MateriaRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Descripcion' => ['required', 'string'],
            'UrlRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdRecurso'] = $recurso->IdRecurso;

        MateriaRecursoAdicional::create($validated);

        return back()->with('success', 'Recurso adicional agregado correctamente.');
    }

    public function destroyAdicional(MateriaRecursoAdicional $adicional): RedirectResponse
    {
        $adicional->delete();

        return back()->with('success', 'Recurso adicional eliminado correctamente.');
    }
}

