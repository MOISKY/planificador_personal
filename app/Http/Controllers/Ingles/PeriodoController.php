<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Periodo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Periodo::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%");
                })
                ->orderBy('FechaInicio', 'desc')
                ->get();

            return response()->json($apiItems);
        }

        $items = Periodo::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%");
            })
            ->orderBy('FechaInicio', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ingles/catalogos/periodos/index', [
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

