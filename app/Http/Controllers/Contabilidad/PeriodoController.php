<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Periodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Periodo::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdPeriodo', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('contabilidad/catalogos/periodos/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'FechaInicio' => ['required', 'date'],
            'FechaFin' => ['required', 'date', 'after_or_equal:FechaInicio'],
        ], [], [
            'Nombre' => 'nombre',
            'FechaInicio' => 'fecha de inicio',
            'FechaFin' => 'fecha de fin',
        ]);

        Periodo::create($validated);

        return back()->with('success', 'Periodo registrado correctamente.');
    }

    public function update(Request $request, Periodo $periodo): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'FechaInicio' => ['required', 'date'],
            'FechaFin' => ['required', 'date', 'after_or_equal:FechaInicio'],
        ], [], [
            'Nombre' => 'nombre',
            'FechaInicio' => 'fecha de inicio',
            'FechaFin' => 'fecha de fin',
        ]);

        $periodo->update($validated);

        return back()->with('success', 'Periodo actualizado correctamente.');
    }

    public function destroy(Periodo $periodo): RedirectResponse
    {
        $periodo->delete();

        return back()->with('success', 'Periodo eliminado correctamente.');
    }
}
