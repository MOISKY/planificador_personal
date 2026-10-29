<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Asesor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsesorController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Asesor::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                })
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Asesor::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('Nombre', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                    ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ingles/catalogos/asesores/index', [
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

        Asesor::create($validated);

        return back()->with('success', 'Asesor registrado correctamente.');
    }

    public function update(Request $request, Asesor $asesor): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'ApellidoPaterno' => ['required', 'string', 'max:100'],
            'ApellidoMaterno' => ['nullable', 'string', 'max:100'],
        ]);

        $asesor->update($validated);

        return back()->with('success', 'Asesor actualizado correctamente.');
    }

    public function destroy(Asesor $asesor): RedirectResponse
    {
        $asesor->delete();

        return back()->with('success', 'Asesor eliminado correctamente.');
    }
}

