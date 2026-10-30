<?php

namespace App\Http\Controllers\Desarrollo;

use App\Http\Controllers\Controller;
use App\Models\Desarrollo\Especialidad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EspecialidadController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Especialidad::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%");
                })
                ->withCount('candidatos')
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Especialidad::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('Descripcion', 'ilike', "%{$search}%");
            })
            ->withCount('candidatos')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('desarrollo/catalogos/especialidades/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        Especialidad::create($validated);

        return back()->with('success', 'Especialidad registrada correctamente.');
    }

    public function update(Request $request, Especialidad $especialidad): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $especialidad->update($validated);

        return back()->with('success', 'Especialidad actualizada correctamente.');
    }

    public function destroy(Especialidad $especialidad): RedirectResponse
    {
        $especialidad->delete();

        return back()->with('success', 'Especialidad eliminada correctamente.');
    }
}
