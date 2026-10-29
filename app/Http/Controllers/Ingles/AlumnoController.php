<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Alumno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlumnoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Alumno::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                })
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Alumno::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ingles/catalogos/alumnos/index', [
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
        ]);

        Alumno::create($validated);

        return back()->with('success', 'Alumno registrado correctamente.');
    }

    public function update(Request $request, Alumno $alumno): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'ApellidoPaterno' => ['required', 'string', 'max:100'],
            'ApellidoMaterno' => ['nullable', 'string', 'max:100'],
        ]);

        $alumno->update($validated);

        return back()->with('success', 'Alumno actualizado correctamente.');
    }

    public function destroy(Alumno $alumno): RedirectResponse
    {
        $alumno->delete();

        return back()->with('success', 'Alumno eliminado correctamente.');
    }
}

