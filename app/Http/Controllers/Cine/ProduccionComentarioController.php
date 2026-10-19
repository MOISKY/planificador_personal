<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Produccion;
use App\Models\ProduccionComentario;
use App\Models\TipoOpinion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProduccionComentarioController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = ProduccionComentario::query()
            ->with(['produccion.recursos', 'tipoOpinion:IdTipoOpinion,Nombre'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('titulo', 'like', "%{$search}%")
                    ->orWhere('comentario', 'like', "%{$search}%")
                    ->orWhereHas('produccion', function ($q) use ($search): void {
                        $q->where('NombreProduccion', 'like', "%{$search}%");
                    });
            })
            ->orderBy('IdProduccionComentario', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $producciones = Produccion::query()->orderBy('NombreProduccion')->get(['IdProduccion', 'NombreProduccion']);
        $tiposOpinion = TipoOpinion::query()->orderBy('Nombre')->get(['IdTipoOpinion', 'Nombre']);

        return Inertia::render('cine/comentarios/index', [
            'items' => $items,
            'searchValue' => $search,
            'producciones' => $producciones,
            'tiposOpinion' => $tiposOpinion,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdProduccion' => ['required', 'integer', 'exists:cine_produccion,IdProduccion'],
            'IdTipoOpinion' => ['nullable', 'integer', 'exists:cine_tipo_opinion,IdTipoOpinion'],
            'titulo' => ['required', 'string', 'max:200'],
            'comentario' => ['required', 'string'],
            'calificacion' => ['nullable', 'integer', 'between:1,10'],
        ], [], [
            'IdProduccion' => 'producción',
            'IdTipoOpinion' => 'tipo de opinión',
            'titulo' => 'título de la reseña',
            'comentario' => 'comentario',
            'calificacion' => 'calificación',
        ]);

        ProduccionComentario::create($validated);

        return back()->with('success', 'Comentario / Reseña registrada con éxito.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $comentario = ProduccionComentario::findOrFail($id);

        $validated = $request->validate([
            'IdProduccion' => ['required', 'integer', 'exists:cine_produccion,IdProduccion'],
            'IdTipoOpinion' => ['nullable', 'integer', 'exists:cine_tipo_opinion,IdTipoOpinion'],
            'titulo' => ['required', 'string', 'max:200'],
            'comentario' => ['required', 'string'],
            'calificacion' => ['nullable', 'integer', 'between:1,10'],
        ], [], [
            'IdProduccion' => 'producción',
            'IdTipoOpinion' => 'tipo de opinión',
            'titulo' => 'título de la reseña',
            'comentario' => 'comentario',
            'calificacion' => 'calificación',
        ]);

        $comentario->update($validated);

        return back()->with('success', 'Comentario actualizado.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $comentario = ProduccionComentario::findOrFail($id);
        $comentario->delete();

        return back()->with('success', 'Comentario eliminado.');
    }
}
