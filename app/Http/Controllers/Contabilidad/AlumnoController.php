<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Alumno;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlumnoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Alumno::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereLike('ApellidoPaterno', "%{$search}%")
                        ->orWhereLike('ApellidoMaterno', "%{$search}%");
                });
            })
            ->orderBy('IdAlumno', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/catalogos/alumnos/index', [
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
        ], [], [
            'Nombre' => 'nombre',
            'ApellidoPaterno' => 'apellido paterno',
            'ApellidoMaterno' => 'apellido materno',
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
        ], [], [
            'Nombre' => 'nombre',
            'ApellidoPaterno' => 'apellido paterno',
            'ApellidoMaterno' => 'apellido materno',
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
