<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\ProyectoRecurso;
use App\Models\Proyectos\ProyectoRecursoAdicional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoRecursoController extends Controller
{
    public function index(Request $request, Proyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = ProyectoRecurso::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
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

        return Inertia::render('proyectos/proyectos/recursos/index', [
            'proyecto' => $proyecto,
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $validated['IdProyecto'] = $proyecto->IdProyecto;

        ProyectoRecurso::create($validated);

        return back()->with('success', 'Recurso de proyecto registrado correctamente.');
    }

    public function update(Request $request, ProyectoRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso de proyecto actualizado correctamente.');
    }

    public function destroy(ProyectoRecurso $recurso): RedirectResponse
    {
        $recurso->recursosAdicionales()->delete();
        $recurso->delete();

        return back()->with('success', 'Recurso de proyecto eliminado correctamente.');
    }

    // --- RECURSOS ADICIONALES (DRAWER MOSTRAR, AGREGAR, ELIMINAR) ---

    public function storeAdicional(Request $request, ProyectoRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Descripcion' => ['required', 'string'],
            'UrlRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdRecurso'] = $recurso->IdRecurso;

        ProyectoRecursoAdicional::create($validated);

        return back()->with('success', 'Recurso adicional agregado correctamente.');
    }

    public function destroyAdicional(ProyectoRecursoAdicional $adicional): RedirectResponse
    {
        $adicional->delete();

        return back()->with('success', 'Recurso adicional eliminado correctamente.');
    }
}

