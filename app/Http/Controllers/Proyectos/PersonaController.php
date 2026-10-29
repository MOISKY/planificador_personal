<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonaController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Persona::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%")
                        ->orWhere('correoElectronico', 'ilike', "%{$search}%");
                })
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Persona::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%")
                    ->orWhere('correoElectronico', 'ilike', "%{$search}%");
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('proyectos/catalogos/personas/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'ApellidoPaterno' => ['required', 'string', 'max:100'],
            'ApellidoMaterno' => ['nullable', 'string', 'max:100'],
            'correoElectronico' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:20'],
        ]);

        Persona::create($validated);

        return back()->with('success', 'Persona registrada correctamente.');
    }

    public function update(Request $request, Persona $persona): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'ApellidoPaterno' => ['required', 'string', 'max:100'],
            'ApellidoMaterno' => ['nullable', 'string', 'max:100'],
            'correoElectronico' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:20'],
        ]);

        $persona->update($validated);

        return back()->with('success', 'Persona actualizada correctamente.');
    }

    public function destroy(Persona $persona): RedirectResponse
    {
        $persona->delete();

        return back()->with('success', 'Persona eliminada correctamente.');
    }
}

