<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador puente para consultar TMDB desde el frontend sin exponer tokens.
 */
class TmdbController extends Controller
{
    public function __construct(private TmdbService $tmdb) {}

    public function buscarProducciones(Request $request): JsonResponse
    {
        $query = (string) $request->string('query');
        $pagina = max(1, (int) $request->integer('page', 1));

        $resultado = $this->tmdb->buscarProducciones($query, $pagina);

        return response()->json($resultado);
    }

    public function detalleProduccion(int $id, Request $request): JsonResponse
    {
        $tipo = (string) $request->string('tipo', 'movie');

        $detalle = $this->tmdb->obtenerDetalleProduccion($id, $tipo);

        return response()->json($detalle);
    }

    public function buscarDirectores(Request $request): JsonResponse
    {
        $query = (string) $request->string('query');
        $pagina = max(1, (int) $request->integer('page', 1));

        $resultado = $this->tmdb->buscarDirectores($query, $pagina);

        return response()->json($resultado);
    }

    public function detalleDirector(int $id): JsonResponse
    {
        $detalle = $this->tmdb->obtenerDetalleDirector($id);

        return response()->json($detalle);
    }
}
