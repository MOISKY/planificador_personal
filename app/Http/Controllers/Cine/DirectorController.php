<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Director;
use App\Services\TmdbService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DirectorController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdb
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Director::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('NombreDirector', "%{$search}%")
                    ->orWhereLike('Descripcion', "%{$search}%");
            })
            ->withCount('producciones')
            ->orderBy('IdDirector', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $items->getCollection()->transform(function (Director $director): Director {
            $nombre = trim((string) $director->NombreDirector);
            $cacheKey = 'cine_director_foto_'.md5(mb_strtolower($nombre));

            $fotoUrl = Cache::remember($cacheKey, 86400, function () use ($nombre): ?string {
                $resultado = $this->tmdb->buscarDirectores($nombre);

                return $resultado['results'][0]['foto_url'] ?? null;
            });

            $director->setAttribute('foto_url', $fotoUrl);

            return $director;
        });

        return Inertia::render('cine/catalogos/directores/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'NombreDirector' => ['required', 'string', 'max:150'],
            'Fecha_Nacimiento' => ['nullable', 'date'],
            'Descripcion' => ['nullable', 'string'],
        ], [], [
            'NombreDirector' => 'nombre del director',
            'Fecha_Nacimiento' => 'fecha de nacimiento',
            'Descripcion' => 'descripción',
        ]);

        Director::create($validated);

        return back()->with('success', 'Director registrado correctamente.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $director = Director::findOrFail($id);

        $validated = $request->validate([
            'NombreDirector' => ['required', 'string', 'max:150'],
            'Fecha_Nacimiento' => ['nullable', 'date'],
            'Descripcion' => ['nullable', 'string'],
        ], [], [
            'NombreDirector' => 'nombre del director',
            'Fecha_Nacimiento' => 'fecha de nacimiento',
            'Descripcion' => 'descripción',
        ]);

        $director->update($validated);

        return back()->with('success', 'Director actualizado con éxito.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $director = Director::findOrFail($id);
        $director->delete();

        return back()->with('success', 'Director eliminado.');
    }
}
