<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Asesor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsesorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Asesor::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereLike('ApellidoPaterno', "%{$search}%")
                        ->orWhereLike('ApellidoMaterno', "%{$search}%");
                });
            })
            ->orderBy('IdAsesor', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/catalogos/asesores/index', [
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

        Asesor::create($validated);

        return back()->with('success', 'Asesor registrado correctamente.');
    }

    public function update(Request $request, Asesor $asesore): RedirectResponse
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

        $asesore->update($validated);

        return back()->with('success', 'Asesor actualizado correctamente.');
    }

    public function destroy(Asesor $asesore): RedirectResponse
    {
        $asesore->delete();

        return back()->with('success', 'Asesor eliminado correctamente.');
    }
}
