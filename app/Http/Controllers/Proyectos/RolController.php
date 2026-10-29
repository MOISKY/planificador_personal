<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Rol::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Rol', 'ilike', "%{$search}%");
                })
                ->orderBy('Rol')
                ->get();

            return response()->json($apiItems);
        }

        $items = Rol::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Rol', 'ilike', "%{$search}%");
            })
            ->orderBy('Rol')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('proyectos/catalogos/roles/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Rol' => ['required', 'string', 'max:100'],
        ]);

        Rol::create($validated);

        return back()->with('success', 'Rol registrado correctamente.');
    }

    public function update(Request $request, Rol $rol): RedirectResponse
    {
        $validated = $request->validate([
            'Rol' => ['required', 'string', 'max:100'],
        ]);

        $rol->update($validated);

        return back()->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy(Rol $rol): RedirectResponse
    {
        $rol->delete();

        return back()->with('success', 'Rol eliminado correctamente.');
    }
}

