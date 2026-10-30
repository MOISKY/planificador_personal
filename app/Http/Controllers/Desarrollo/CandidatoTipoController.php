<?php

namespace App\Http\Controllers\Desarrollo;

use App\Http\Controllers\Controller;
use App\Models\Desarrollo\CandidatoTipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CandidatoTipoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = CandidatoTipo::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%");
                })
                ->withCount('candidatos')
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = CandidatoTipo::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('Descripcion', 'ilike', "%{$search}%");
            })
            ->withCount('candidatos')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('desarrollo/catalogos/candidatos-tipos/index', [
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

        CandidatoTipo::create($validated);

        return back()->with('success', 'Tipo de candidato registrado correctamente.');
    }

    public function update(Request $request, CandidatoTipo $candidatoTipo): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:150'],
            'Descripcion' => ['nullable', 'string'],
        ]);

        $candidatoTipo->update($validated);

        return back()->with('success', 'Tipo de candidato actualizado correctamente.');
    }

    public function destroy(CandidatoTipo $candidatoTipo): RedirectResponse
    {
        $candidatoTipo->delete();

        return back()->with('success', 'Tipo de candidato eliminado correctamente.');
    }
}

