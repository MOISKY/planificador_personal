<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Produccion;
use App\Models\ProduccionRecurso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProduccionRecursoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $tipo = trim((string) $request->string('tipo'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ProduccionRecurso::query()
            ->with('produccion.recursos')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('URL_produccion_recurso', 'like', "%{$search}%")
                    ->orWhereHas('produccion', function ($q) use ($search): void {
                        $q->where('NombreProduccion', 'like', "%{$search}%");
                    });
            })
            ->when($tipo !== '', function ($query) use ($tipo): void {
                $query->where('Tipo', $tipo);
            })
            ->orderBy('IdProduccionRecurso', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $producciones = Produccion::query()
            ->orderBy('NombreProduccion')
            ->get(['IdProduccion', 'NombreProduccion']);

        return Inertia::render('cine/catalogos/recursos/index', [
            'items' => $items,
            'searchValue' => $search,
            'tipoSeleccionado' => $tipo,
            'producciones' => $producciones,
            'tipos' => ProduccionRecurso::TIPOS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdProduccion' => ['required', 'integer', 'exists:cine_produccion,IdProduccion'],
            'Tipo' => ['required', 'string', 'in:ver,video,sitio,imagen,documento'],
            'URL_produccion_recurso' => ['required', 'string'],
        ], [], [
            'IdProduccion' => 'producción',
            'Tipo' => 'tipo de recurso',
            'URL_produccion_recurso' => 'URL del recurso',
        ]);

        ProduccionRecurso::create($validated);

        return back()->with('success', 'Recurso registrado con éxito.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $recurso = ProduccionRecurso::findOrFail($id);

        $validated = $request->validate([
            'IdProduccion' => ['required', 'integer', 'exists:cine_produccion,IdProduccion'],
            'Tipo' => ['required', 'string', 'in:ver,video,sitio,imagen,documento'],
            'URL_produccion_recurso' => ['required', 'string'],
        ], [], [
            'IdProduccion' => 'producción',
            'Tipo' => 'tipo de recurso',
            'URL_produccion_recurso' => 'URL del recurso',
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $recurso = ProduccionRecurso::findOrFail($id);
        $recurso->delete();

        return back()->with('success', 'Recurso eliminado.');
    }
}
