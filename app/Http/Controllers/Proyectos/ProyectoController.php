<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\Proyecto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = Proyecto::query()
            ->withCount(['recursos', 'personasAsignadas', 'actividades'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('Descripcion', 'ilike', "%{$search}%");
            })
            ->orderBy('IdProyecto', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        return Inertia::render('proyectos/proyectos/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaInicio' => ['nullable', 'date'],
            'FechaFinal' => ['nullable', 'date', 'after_or_equal:FechaInicio'],
        ]);

        Proyecto::create($validated);

        return back()->with('success', 'Proyecto registrado correctamente.');
    }

    public function update(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaInicio' => ['nullable', 'date'],
            'FechaFinal' => ['nullable', 'date', 'after_or_equal:FechaInicio'],
        ]);

        $proyecto->update($validated);

        return back()->with('success', 'Proyecto actualizado correctamente.');
    }

    public function destroy(Proyecto $proyecto): RedirectResponse
    {
        $proyecto->delete();

        return back()->with('success', 'Proyecto eliminado correctamente.');
    }
}

