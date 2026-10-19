<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Director;
use App\Models\Produccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProduccionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Produccion::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('NombreProduccion', "%{$search}%")
                    ->orWhereLike('Sinopsis', "%{$search}%");
            })
            ->with(['directores', 'estatusActual', 'recursos'])
            ->withCount(['comentarios', 'seguimientos', 'recursos'])
            ->orderBy('IdProduccion', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $directoresDisponibles = Director::query()
            ->orderBy('NombreDirector')
            ->get(['IdDirector', 'NombreDirector']);

        return Inertia::render('cine/catalogos/producciones/index', [
            'items' => $items,
            'searchValue' => $search,
            'directoresDisponibles' => $directoresDisponibles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'NombreProduccion' => ['required', 'string', 'max:255'],
            'Sinopsis' => ['nullable', 'string'],
            'FechaProduccion' => ['nullable', 'date'],
            'directores_ids' => ['nullable', 'array'],
            'directores_ids.*' => ['integer', 'exists:cine_directores,IdDirector'],
            'directores_nombres' => ['nullable', 'array'],
            'directores_nombres.*' => ['string', 'max:150'],
            'trailer_url' => ['nullable', 'string', 'url'],
            'poster_url' => ['nullable', 'string', 'url'],
        ], [], [
            'NombreProduccion' => 'nombre de la producción',
            'Sinopsis' => 'sinopsis',
            'FechaProduccion' => 'fecha de estreno',
            'directores_ids' => 'directores',
            'directores_nombres' => 'nombres de directores',
        ]);

        $produccion = Produccion::create([
            'NombreProduccion' => $validated['NombreProduccion'],
            'Sinopsis' => $validated['Sinopsis'] ?? null,
            'FechaProduccion' => $validated['FechaProduccion'] ?? null,
        ]);

        $directoresIds = $this->resolverDirectores(
            $validated['directores_ids'] ?? [],
            $validated['directores_nombres'] ?? []
        );

        if (! empty($directoresIds)) {
            $produccion->directores()->sync($directoresIds);
        }

        // Si viene tráiler desde TMDB, crear recurso automático
        if (! empty($validated['trailer_url'])) {
            $produccion->recursos()->create([
                'Tipo' => 'video',
                'URL_produccion_recurso' => $validated['trailer_url'],
            ]);
        }

        // Si viene póster desde TMDB, crear recurso de imagen
        if (! empty($validated['poster_url'])) {
            $produccion->recursos()->create([
                'Tipo' => 'imagen',
                'URL_produccion_recurso' => $validated['poster_url'],
            ]);
        }

        return back()->with('success', "Producción '{$produccion->NombreProduccion}' creada con éxito.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $produccion = Produccion::findOrFail($id);

        $validated = $request->validate([
            'NombreProduccion' => ['required', 'string', 'max:255'],
            'Sinopsis' => ['nullable', 'string'],
            'FechaProduccion' => ['nullable', 'date'],
            'directores_ids' => ['nullable', 'array'],
            'directores_ids.*' => ['integer', 'exists:cine_directores,IdDirector'],
            'directores_nombres' => ['nullable', 'array'],
            'directores_nombres.*' => ['string', 'max:150'],
        ], [], [
            'NombreProduccion' => 'nombre de la producción',
            'Sinopsis' => 'sinopsis',
            'FechaProduccion' => 'fecha de estreno',
            'directores_ids' => 'directores',
            'directores_nombres' => 'nombres de directores',
        ]);

        $produccion->update([
            'NombreProduccion' => $validated['NombreProduccion'],
            'Sinopsis' => $validated['Sinopsis'] ?? null,
            'FechaProduccion' => $validated['FechaProduccion'] ?? null,
        ]);

        if (isset($validated['directores_ids']) || isset($validated['directores_nombres'])) {
            $directoresIds = $this->resolverDirectores(
                $validated['directores_ids'] ?? [],
                $validated['directores_nombres'] ?? []
            );
            $produccion->directores()->sync($directoresIds);
        }

        return back()->with('success', 'Producción actualizada con éxito.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $produccion = Produccion::findOrFail($id);
        $produccion->delete();

        return back()->with('success', 'Producción eliminada.');
    }

    /**
     * Resuelve los IDs de directores asignando los existentes o insertando los nuevos.
     *
     * @param  list<int>  $ids
     * @param  list<string>  $nombres
     * @return list<int>
     */
    private function resolverDirectores(array $ids, array $nombres): array
    {
        $resultadoIds = array_map('intval', $ids);

        foreach ($nombres as $nombre) {
            $nombreLimpio = trim((string) $nombre);
            if ($nombreLimpio === '') {
                continue;
            }

            // Si ya existe el director en el sistema (por nombre), se toma directamente
            $director = Director::buscarPorNombre($nombreLimpio);

            // Si no existe, se genera con insert en cine_directores
            if (! $director) {
                $director = Director::create([
                    'NombreDirector' => $nombreLimpio,
                ]);
            }

            $resultadoIds[] = (int) $director->IdDirector;
        }

        return array_values(array_unique(array_filter($resultadoIds)));
    }
}
