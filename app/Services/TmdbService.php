<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Servicio para consultar películas, series y directores desde The Movie Database (TMDB).
 */
class TmdbService
{
    private string $token;

    private string $apiKey;

    private string $baseUrl;

    private string $imageUrl;

    public function __construct()
    {
        $this->token = (string) Config::get('services.tmdb.token', '');
        $this->apiKey = (string) Config::get('services.tmdb.key', '');
        $this->baseUrl = rtrim((string) Config::get('services.tmdb.base_url', 'https://api.themoviedb.org/3'), '/');
        $this->imageUrl = rtrim((string) Config::get('services.tmdb.image_url', 'https://image.tmdb.org/t/p'), '/');
    }

    /**
     * Cliente HTTP base configurado con token y tolerante a entornos locales sin certificados cURL.
     */
    private function cliente(): PendingRequest
    {
        $request = Http::timeout(8)
            ->baseUrl($this->baseUrl);

        if (app()->isLocal()) {
            $request = $request->withoutVerifying();
        }

        if ($this->token !== '') {
            $request = $request->withToken($this->token);
        }

        return $request;
    }

    /**
     * Busca producciones (películas y series) por título.
     *
     * @return array{
     *     total: int,
     *     page: int,
     *     results: list<array{
     *         id: int,
     *         titulo: string,
     *         tipo: string,
     *         sinopsis: string,
     *         fecha_estreno: string|null,
     *         poster_url: string|null,
     *         backdrop_url: string|null,
     *         calificacion: float
     *     }>
     * }
     */
    public function buscarProducciones(string $query, int $pagina = 1, string $idioma = 'es-MX'): array
    {
        if (trim($query) === '') {
            return ['total' => 0, 'page' => 1, 'results' => []];
        }

        try {
            $response = $this->cliente()->get('/search/multi', [
                'query' => $query,
                'page' => $pagina,
                'language' => $idioma,
                'include_adult' => false,
            ]);

            if (! $response->successful()) {
                Log::warning('Error consultando TMDB search/multi', ['status' => $response->status(), 'body' => $response->body()]);

                return ['total' => 0, 'page' => $pagina, 'results' => []];
            }

            $data = $response->json();
            $items = [];

            foreach ($data['results'] ?? [] as $item) {
                $mediaType = $item['media_type'] ?? 'movie';
                if ($mediaType !== 'movie' && $mediaType !== 'tv') {
                    continue;
                }

                $titulo = $item['title'] ?? $item['name'] ?? 'Sin título';
                $fecha = $item['release_date'] ?? $item['first_air_date'] ?? null;
                $poster = ! empty($item['poster_path']) ? $this->formatearUrlImagen($item['poster_path'], 'w500') : null;
                $backdrop = ! empty($item['backdrop_path']) ? $this->formatearUrlImagen($item['backdrop_path'], 'original') : null;

                $items[] = [
                    'id' => (int) $item['id'],
                    'titulo' => (string) $titulo,
                    'tipo' => (string) $mediaType,
                    'sinopsis' => (string) ($item['overview'] ?? ''),
                    'fecha_estreno' => $fecha ? (string) $fecha : null,
                    'poster_url' => $poster,
                    'backdrop_url' => $backdrop,
                    'calificacion' => round((float) ($item['vote_average'] ?? 0), 1),
                ];
            }

            return [
                'total' => (int) ($data['total_results'] ?? count($items)),
                'page' => (int) ($data['page'] ?? $pagina),
                'results' => $items,
            ];
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB buscarProducciones: '.$e->getMessage());

            return ['total' => 0, 'page' => $pagina, 'results' => []];
        }
    }

    /**
     * Obtiene el detalle completo de una película o serie incluyendo directores y trailers.
     *
     * @return array<string, mixed>|null
     */
    public function obtenerDetalleProduccion(int $tmdbId, string $tipo = 'movie', string $idioma = 'es-MX'): ?array
    {
        try {
            $endpoint = $tipo === 'tv' ? "/tv/{$tmdbId}" : "/movie/{$tmdbId}";

            $response = $this->cliente()->get($endpoint, [
                'append_to_response' => 'credits,videos',
                'language' => $idioma,
            ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            $titulo = $data['title'] ?? $data['name'] ?? 'Sin título';
            $fecha = $data['release_date'] ?? $data['first_air_date'] ?? null;

            // Extraer directores
            $directores = [];
            if (! empty($data['credits']['crew'])) {
                foreach ($data['credits']['crew'] as $crew) {
                    if (($crew['job'] ?? '') === 'Director') {
                        $directores[] = [
                            'id' => (int) $crew['id'],
                            'nombre' => (string) $crew['name'],
                            'foto_url' => ! empty($crew['profile_path'])
                                ? $this->formatearUrlImagen($crew['profile_path'], 'w300')
                                : null,
                        ];
                    }
                }
            }

            // Si es serie, a veces los creadores están en 'created_by'
            if (empty($directores) && ! empty($data['created_by'])) {
                foreach ($data['created_by'] as $creator) {
                    $directores[] = [
                        'id' => (int) $creator['id'],
                        'nombre' => (string) $creator['name'],
                        'foto_url' => ! empty($creator['profile_path'])
                            ? $this->formatearUrlImagen($creator['profile_path'], 'w300')
                            : null,
                    ];
                }
            }

            // Buscar tráiler de YouTube
            $trailerUrl = null;
            if (! empty($data['videos']['results'])) {
                foreach ($data['videos']['results'] as $video) {
                    if (($video['site'] ?? '') === 'YouTube' && in_array($video['type'] ?? '', ['Trailer', 'Teaser'], true)) {
                        $trailerUrl = 'https://www.youtube.com/watch?v='.$video['key'];
                        break;
                    }
                }
            }

            return [
                'id' => (int) $data['id'],
                'titulo' => (string) $titulo,
                'tipo' => $tipo,
                'sinopsis' => (string) ($data['overview'] ?? ''),
                'fecha_estreno' => $fecha ? (string) $fecha : null,
                'duracion_minutos' => $data['runtime'] ?? null,
                'poster_url' => ! empty($data['poster_path']) ? $this->formatearUrlImagen($data['poster_path'], 'w500') : null,
                'backdrop_url' => ! empty($data['backdrop_path']) ? $this->formatearUrlImagen($data['backdrop_path'], 'original') : null,
                'directores' => $directores,
                'trailer_url' => $trailerUrl,
                'sitio_web' => ! empty($data['homepage']) ? (string) $data['homepage'] : null,
            ];
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB obtenerDetalleProduccion: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Busca personas / directores por nombre.
     *
     * @return array{
     *     total: int,
     *     page: int,
     *     results: list<array{
     *         id: int,
     *         nombre: string,
     *         foto_url: string|null,
     *         obras_conocidas: string
     *     }>
     * }
     */
    public function buscarDirectores(string $query, int $pagina = 1, string $idioma = 'es-MX'): array
    {
        if (trim($query) === '') {
            return ['total' => 0, 'page' => 1, 'results' => []];
        }

        try {
            $response = $this->cliente()->get('/search/person', [
                'query' => $query,
                'page' => $pagina,
                'language' => $idioma,
                'include_adult' => false,
            ]);

            if (! $response->successful()) {
                return ['total' => 0, 'page' => $pagina, 'results' => []];
            }

            $data = $response->json();
            $items = [];

            foreach ($data['results'] ?? [] as $person) {
                $obras = [];
                foreach ($person['known_for'] ?? [] as $obra) {
                    $tituloObra = $obra['title'] ?? $obra['name'] ?? null;
                    if ($tituloObra) {
                        $obras[] = $tituloObra;
                    }
                }

                $items[] = [
                    'id' => (int) $person['id'],
                    'nombre' => (string) ($person['name'] ?? ''),
                    'foto_url' => ! empty($person['profile_path'])
                        ? $this->formatearUrlImagen($person['profile_path'], 'w300')
                        : null,
                    'obras_conocidas' => implode(', ', array_slice($obras, 0, 3)),
                ];
            }

            return [
                'total' => (int) ($data['total_results'] ?? count($items)),
                'page' => (int) ($data['page'] ?? $pagina),
                'results' => $items,
            ];
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB buscarDirectores: '.$e->getMessage());

            return ['total' => 0, 'page' => $pagina, 'results' => []];
        }
    }

    /**
     * Obtiene los datos biográficos de un director.
     *
     * @return array<string, mixed>|null
     */
    public function obtenerDetalleDirector(int $personId, string $idioma = 'es-MX'): ?array
    {
        try {
            $response = $this->cliente()->get("/person/{$personId}", [
                'language' => $idioma,
            ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();

            // Si la biografía viene vacía en español, consultamos en inglés como respaldo
            $biografia = (string) ($data['biography'] ?? '');
            if ($biografia === '' && $idioma !== 'en-US') {
                $respEn = $this->cliente()->get("/person/{$personId}", ['language' => 'en-US']);
                if ($respEn->successful()) {
                    $biografia = (string) ($respEn->json()['biography'] ?? '');
                }
            }

            return [
                'id' => (int) $data['id'],
                'nombre' => (string) ($data['name'] ?? ''),
                'fecha_nacimiento' => ! empty($data['birthday']) ? (string) $data['birthday'] : null,
                'descripcion' => $biografia,
                'foto_url' => ! empty($data['profile_path'])
                    ? $this->formatearUrlImagen($data['profile_path'], 'w500')
                    : null,
                'lugar_nacimiento' => (string) ($data['place_of_birth'] ?? ''),
            ];
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB obtenerDetalleDirector: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Obtiene producciones en tendencia semanal.
     *
     * @return list<array<string, mixed>>
     */
    public function obtenerTendencias(int $pagina = 1, string $idioma = 'es-MX'): array
    {
        try {
            $response = $this->cliente()->get('/trending/all/week', [
                'language' => $idioma,
                'page' => $pagina,
            ]);

            if (! $response->successful()) {
                return [];
            }

            return $this->mapearResultadosProducciones($response->json()['results'] ?? []);
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB obtenerTendencias: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Obtiene próximos estrenos confirmados.
     *
     * @return list<array<string, mixed>>
     */
    public function obtenerProximosEstrenos(int $pagina = 1, string $idioma = 'es-MX'): array
    {
        try {
            $response = $this->cliente()->get('/movie/upcoming', [
                'language' => $idioma,
                'page' => $pagina,
                'region' => 'MX',
            ]);

            if (! $response->successful()) {
                return [];
            }

            return $this->mapearResultadosProducciones($response->json()['results'] ?? [], 'movie');
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB obtenerProximosEstrenos: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Explora producciones por año y/o búsqueda libre con sus plataformas de streaming.
     *
     * @return list<array<string, mixed>>
     */
    public function explorarPorAno(int $ano, ?string $query = null, int $pagina = 1, string $idioma = 'es-MX'): array
    {
        try {
            if ($query && trim($query) !== '') {
                $response = $this->cliente()->get('/search/multi', [
                    'query' => trim($query),
                    'language' => $idioma,
                    'page' => $pagina,
                    'include_adult' => false,
                ]);
            } else {
                $response = $this->cliente()->get('/discover/movie', [
                    'primary_release_year' => $ano,
                    'sort_by' => 'popularity.desc',
                    'language' => $idioma,
                    'page' => $pagina,
                    'include_adult' => false,
                ]);
            }

            if (! $response->successful()) {
                return [];
            }

            $items = $this->mapearResultadosProducciones($response->json()['results'] ?? []);

            return $this->obtenerPlataformasParaItems($items);
        } catch (Throwable $e) {
            Log::error('Excepción en TMDB explorarPorAno: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Obtiene en paralelo las plataformas de streaming disponibles para una lista de producciones.
     *
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    public function obtenerPlataformasParaItems(array $items): array
    {
        if (empty($items)) {
            return $items;
        }

        try {
            $ids = array_column($items, 'id');
            $tipos = array_column($items, 'tipo', 'id');

            $responses = Http::pool(function (Pool $pool) use ($ids, $tipos) {
                return array_map(function ($id) use ($pool, $tipos) {
                    $tipo = ($tipos[$id] ?? 'movie') === 'tv' ? 'tv' : 'movie';
                    $req = $pool->as((string) $id)
                        ->timeout(4)
                        ->baseUrl($this->baseUrl);

                    if (app()->isLocal()) {
                        $req = $req->withoutVerifying();
                    }
                    if ($this->token !== '') {
                        $req = $req->withToken($this->token);
                    }

                    return $req->get("/{$tipo}/{$id}/watch/providers");
                }, $ids);
            });

            foreach ($items as &$item) {
                $idStr = (string) $item['id'];
                $item['plataformas'] = [];

                if (isset($responses[$idStr]) && $responses[$idStr]->successful()) {
                    $data = $responses[$idStr]->json()['results'] ?? [];
                    // Priorizar catálogo en México (flatrate), luego renta o compra, o US
                    $provs = $data['MX']['flatrate'] ?? $data['MX']['rent'] ?? $data['US']['flatrate'] ?? [];
                    $plataformas = [];
                    foreach (array_slice($provs, 0, 4) as $p) {
                        $plataformas[] = [
                            'nombre' => (string) ($p['provider_name'] ?? ''),
                            'logo_url' => ! empty($p['logo_path']) ? $this->formatearUrlImagen($p['logo_path'], 'w92') : null,
                        ];
                    }
                    $item['plataformas'] = $plataformas;
                }
            }
            unset($item);

            return $items;
        } catch (Throwable $e) {
            Log::warning('Error en obtenerPlataformasParaItems: '.$e->getMessage());

            return $items;
        }
    }

    /**
     * Obtiene spin-offs, secuelas o contenido complementario filtrado exclusivamente por las producciones y directores de la lista del usuario.
     * Solo incluye proyectos futuros, secuelas confirmadas de sagas o próximos estrenos.
     *
     * @param  list<string>  $nombresProducciones
     * @param  list<string>  $nombresDirectores
     * @param  list<array<string, mixed>>  $poolTendenciasYProximos
     * @return list<array<string, mixed>>
     */
    public function obtenerRelacionadosParaProducciones(
        array $nombresProducciones,
        array $nombresDirectores = [],
        array $poolTendenciasYProximos = [],
        string $idioma = 'es-MX'
    ): array {
        $relacionados = [];
        $idsProcesados = [];
        $inicioAnoActual = date('Y-01-01');

        // 1. Cruzar con Tendencias y Próximos Estrenos si coinciden con directores o sagas del usuario
        foreach ($poolTendenciasYProximos as $poolItem) {
            $poolId = (int) ($poolItem['id'] ?? 0);
            $poolTitulo = (string) ($poolItem['titulo'] ?? '');

            if ($poolId <= 0 || in_array($poolId, $idsProcesados, true)) {
                continue;
            }

            // Coincidencia con saga o spin-off por título
            foreach ($nombresProducciones as $nombreProd) {
                if (mb_stripos($poolTitulo, $nombreProd) !== false && mb_strtolower(trim($poolTitulo)) !== mb_strtolower(trim($nombreProd))) {
                    $idsProcesados[] = $poolId;
                    $poolItem['motivo_relacion'] = "Próximo spin-off / secuela en cartelera de '{$nombreProd}'";
                    $poolItem['relacionado_a'] = $nombreProd;
                    $relacionados[] = $poolItem;
                    break;
                }
            }
        }

        // 2. Franquicias y colecciones oficiales (secuelas confirmadas) de las producciones del usuario
        foreach (array_slice($nombresProducciones, 0, 8) as $nombreProd) {
            try {
                $busqueda = $this->cliente()->get('/search/multi', [
                    'query' => $nombreProd,
                    'language' => $idioma,
                    'page' => 1,
                ]);

                if (! $busqueda->successful()) {
                    continue;
                }

                $primera = $busqueda->json()['results'][0] ?? null;
                if (! $primera || empty($primera['id'])) {
                    continue;
                }

                $tmdbId = (int) $primera['id'];
                $mediaType = $primera['media_type'] ?? 'movie';

                if ($mediaType === 'movie') {
                    $detalle = $this->cliente()->get("/movie/{$tmdbId}", [
                        'language' => $idioma,
                    ])->json();

                    // Franquicia / Colección (Secuelas y Spin-offs oficiales confirmados)
                    if (! empty($detalle['belongs_to_collection']['id'])) {
                        $colId = (int) $detalle['belongs_to_collection']['id'];
                        $colNombre = (string) ($detalle['belongs_to_collection']['name'] ?? 'Colección');
                        $colResp = $this->cliente()->get("/collection/{$colId}", ['language' => $idioma]);

                        if ($colResp->successful()) {
                            foreach ($colResp->json()['parts'] ?? [] as $parte) {
                                $pId = (int) $parte['id'];
                                $pFecha = ! empty($parte['release_date']) ? (string) $parte['release_date'] : null;

                                // Solo secuelas/entregas que no sean la misma ya vista y que sean actuales o futuras
                                $esFuturoOProximo = empty($pFecha) || $pFecha >= $inicioAnoActual;

                                if ($pId !== $tmdbId && $esFuturoOProximo && ! in_array($pId, $idsProcesados, true)) {
                                    $idsProcesados[] = $pId;
                                    $relacionados[] = [
                                        'id' => $pId,
                                        'titulo' => (string) ($parte['title'] ?? 'Sin título'),
                                        'tipo' => 'movie',
                                        'sinopsis' => (string) ($parte['overview'] ?? ''),
                                        'fecha_estreno' => $pFecha,
                                        'poster_url' => ! empty($parte['poster_path']) ? $this->formatearUrlImagen($parte['poster_path'], 'w500') : null,
                                        'calificacion' => round((float) ($parte['vote_average'] ?? 0), 1),
                                        'motivo_relacion' => "Secuela confirmada de '{$nombreProd}' ({$colNombre})",
                                        'relacionado_a' => $nombreProd,
                                    ];
                                }
                            }
                        }
                    }
                }
            } catch (Throwable $e) {
                Log::warning("Error obteniendo saga para '{$nombreProd}': ".$e->getMessage());
            }
        }

        // 3. Próximos lanzamientos confirmados de los directores de la lista del usuario
        foreach (array_slice($nombresDirectores, 0, 8) as $nombreDir) {
            try {
                $dirSearch = $this->cliente()->get('/search/person', [
                    'query' => $nombreDir,
                    'language' => $idioma,
                    'page' => 1,
                ]);

                if (! $dirSearch->successful()) {
                    continue;
                }

                $person = $dirSearch->json()['results'][0] ?? null;
                if (! $person || empty($person['id'])) {
                    continue;
                }

                $credits = $this->cliente()->get("/person/{$person['id']}/movie_credits", [
                    'language' => $idioma,
                ])->json();

                foreach ($credits['crew'] ?? [] as $obra) {
                    if (($obra['job'] ?? '') === 'Director') {
                        $oId = (int) $obra['id'];
                        $fecha = ! empty($obra['release_date']) ? (string) $obra['release_date'] : null;

                        // Solo futuros o del año en curso
                        $esFuturo = empty($fecha) || $fecha >= $inicioAnoActual;

                        if ($esFuturo && ! in_array($oId, $idsProcesados, true)) {
                            $idsProcesados[] = $oId;
                            $relacionados[] = [
                                'id' => $oId,
                                'titulo' => (string) ($obra['title'] ?? 'Sin título'),
                                'tipo' => 'movie',
                                'sinopsis' => (string) ($obra['overview'] ?? ''),
                                'fecha_estreno' => $fecha,
                                'poster_url' => ! empty($obra['poster_path']) ? $this->formatearUrlImagen($obra['poster_path'], 'w500') : null,
                                'calificacion' => round((float) ($obra['vote_average'] ?? 0), 1),
                                'motivo_relacion' => "Próximo estreno del director: {$nombreDir}",
                                'relacionado_a' => $nombreDir,
                            ];

                            if (count($relacionados) >= 12) {
                                break 2;
                            }
                        }
                    }
                }
            } catch (Throwable $e) {
                Log::warning("Error obteniendo proyectos para director '{$nombreDir}': ".$e->getMessage());
            }
        }

        return array_slice($relacionados, 0, 12);
    }

    /**
     * Mapea un listado de resultados crudos de TMDB a la estructura estándar.
     *
     * @param  list<array<string, mixed>>  $results
     * @return list<array<string, mixed>>
     */
    private function mapearResultadosProducciones(array $results, ?string $tipoFijo = null): array
    {
        $items = [];

        foreach ($results as $item) {
            $tipo = $tipoFijo ?? ($item['media_type'] ?? 'movie');
            if ($tipo !== 'movie' && $tipo !== 'tv') {
                continue;
            }

            $titulo = $item['title'] ?? $item['name'] ?? 'Sin título';
            $fecha = $item['release_date'] ?? $item['first_air_date'] ?? null;
            $poster = ! empty($item['poster_path']) ? $this->formatearUrlImagen($item['poster_path'], 'w500') : null;
            $backdrop = ! empty($item['backdrop_path']) ? $this->formatearUrlImagen($item['backdrop_path'], 'original') : null;

            $items[] = [
                'id' => (int) $item['id'],
                'titulo' => (string) $titulo,
                'tipo' => (string) $tipo,
                'sinopsis' => (string) ($item['overview'] ?? ''),
                'fecha_estreno' => $fecha ? (string) $fecha : null,
                'poster_url' => $poster,
                'backdrop_url' => $backdrop,
                'calificacion' => round((float) ($item['vote_average'] ?? 0), 1),
            ];
        }

        return $items;
    }

    /**
     * Construye la URL pública de una imagen de TMDB.
     */
    public function formatearUrlImagen(string $path, string $tamano = 'w500'): string
    {
        $limpio = ltrim($path, '/');

        return "{$this->imageUrl}/{$tamano}/{$limpio}";
    }

    /**
     * Obtiene noticias recientes del mundo del cine desde fuentes de actualidad.
     *
     * @return list<array{
     *     titulo: string,
     *     fuente: string,
     *     url: string,
     *     fecha: string|null
     * }>
     */
    public function obtenerNoticiasCine(int $limite = 9): array
    {
        return Cache::remember('cine_noticias_mundo', 1800, function () use ($limite): array {
            try {
                $response = Http::timeout(6)
                    ->withoutVerifying()
                    ->get('https://news.google.com/rss/search?q=cine+estrenos+peliculas+hollywood&hl=es-419&gl=MX&ceid=MX:es-419');

                if (! $response->successful()) {
                    return [];
                }

                $xml = @simplexml_load_string($response->body());
                if (! $xml || ! isset($xml->channel->item)) {
                    return [];
                }

                $noticias = [];
                foreach ($xml->channel->item as $item) {
                    $rawTitle = (string) $item->title;
                    $link = (string) $item->link;
                    $pubDate = (string) $item->pubDate;

                    $partes = explode(' - ', $rawTitle);
                    $fuente = count($partes) > 1 ? trim((string) array_pop($partes)) : 'Cine Noticias';
                    $titulo = trim(implode(' - ', $partes));

                    $fechaFormateada = null;
                    if ($pubDate !== '') {
                        try {
                            $fechaFormateada = Carbon::parse($pubDate)->locale('es')->diffForHumans();
                        } catch (Throwable) {
                            $fechaFormateada = null;
                        }
                    }

                    $noticias[] = [
                        'titulo' => $titulo,
                        'fuente' => $fuente,
                        'url' => $link,
                        'fecha' => $fechaFormateada,
                    ];

                    if (count($noticias) >= $limite) {
                        break;
                    }
                }

                return $noticias;
            } catch (Throwable $e) {
                Log::warning('Error obteniendo noticias de cine: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Obtiene noticias recientes específicamente relacionadas con las producciones o directores del usuario.
     *
     * @param  list<string>  $terminos
     * @return list<array{
     *     titulo: string,
     *     fuente: string,
     *     url: string,
     *     fecha: string|null,
     *     relacionado_a: string|null
     * }>
     */
    public function obtenerNoticiasParaTerminos(array $terminos, int $limite = 6): array
    {
        $limpios = array_values(array_unique(array_filter(array_map('trim', $terminos))));
        if (empty($limpios)) {
            return [];
        }

        $cacheKey = 'cine_noticias_relacionadas_'.md5(implode('|', $limpios));

        return Cache::remember($cacheKey, 1800, function () use ($limpios, $limite): array {
            try {
                $muestra = array_slice($limpios, 0, 5);
                $queryStr = implode(' OR ', array_map(fn ($t) => '"'.$t.'"', $muestra));
                $url = 'https://news.google.com/rss/search?q='.urlencode($queryStr.' cine pelicula').'&hl=es-419&gl=MX&ceid=MX:es-419';

                $response = Http::timeout(6)->withoutVerifying()->get($url);
                if (! $response->successful()) {
                    return [];
                }

                $xml = @simplexml_load_string($response->body());
                if (! $xml || ! isset($xml->channel->item)) {
                    return [];
                }

                $noticias = [];
                foreach ($xml->channel->item as $item) {
                    $rawTitle = (string) $item->title;
                    $link = (string) $item->link;
                    $pubDate = (string) $item->pubDate;

                    $partes = explode(' - ', $rawTitle);
                    $fuente = count($partes) > 1 ? trim((string) array_pop($partes)) : 'Cine';
                    $titulo = trim(implode(' - ', $partes));

                    $relacionadoA = null;
                    foreach ($limpios as $term) {
                        if (mb_stripos($titulo, $term) !== false) {
                            $relacionadoA = $term;
                            break;
                        }
                    }

                    $fechaFormateada = null;
                    if ($pubDate !== '') {
                        try {
                            $fechaFormateada = Carbon::parse($pubDate)->locale('es')->diffForHumans();
                        } catch (Throwable) {
                            $fechaFormateada = null;
                        }
                    }

                    $noticias[] = [
                        'titulo' => $titulo,
                        'fuente' => $fuente,
                        'url' => $link,
                        'fecha' => $fechaFormateada,
                        'relacionado_a' => $relacionadoA ?? ($muestra[0] ?? null),
                    ];

                    if (count($noticias) >= $limite) {
                        break;
                    }
                }

                return $noticias;
            } catch (Throwable $e) {
                Log::warning('Error en obtenerNoticiasParaTerminos: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Obtiene otras obras de los directores del usuario que NO están en la lista actual.
     *
     * @param  list<string>  $nombresDirectores
     * @param  list<string>  $titulosExcluir
     * @return list<array{
     *     director: string,
     *     foto_url: string|null,
     *     producciones: list<array<string, mixed>>
     * }>
     */
    public function obtenerMasDeDirectores(array $nombresDirectores, array $titulosExcluir): array
    {
        $directoresUnicos = array_values(array_unique(array_filter(array_map('trim', $nombresDirectores))));
        if (empty($directoresUnicos)) {
            return [];
        }

        $excluirLower = array_map(fn ($t) => mb_strtolower(trim($t)), $titulosExcluir);
        $resultado = [];

        foreach (array_slice($directoresUnicos, 0, 5) as $nombreDir) {
            $cacheKey = 'cine_mas_de_dir_'.md5(mb_strtolower($nombreDir));

            $datosDir = Cache::remember($cacheKey, 3600, function () use ($nombreDir): ?array {
                $search = $this->buscarDirectores($nombreDir);
                $person = $search['results'][0] ?? null;
                if (! $person || empty($person['id'])) {
                    return null;
                }

                $pId = (int) $person['id'];
                $fotoUrl = $person['foto_url'] ?? null;

                $creditsResp = $this->cliente()->get("/person/{$pId}/movie_credits", ['language' => 'es-MX']);
                if (! $creditsResp->successful()) {
                    return null;
                }

                $obrasRaw = [];
                $idsVistos = [];

                foreach ($creditsResp->json()['crew'] ?? [] as $crew) {
                    if (($crew['job'] ?? '') === 'Director') {
                        $cId = (int) $crew['id'];
                        if (in_array($cId, $idsVistos, true)) {
                            continue;
                        }
                        $idsVistos[] = $cId;

                        $obrasRaw[] = [
                            'id' => $cId,
                            'titulo' => (string) ($crew['title'] ?? 'Sin título'),
                            'tipo' => 'movie',
                            'sinopsis' => (string) ($crew['overview'] ?? ''),
                            'fecha_estreno' => ! empty($crew['release_date']) ? (string) $crew['release_date'] : null,
                            'poster_url' => ! empty($crew['poster_path']) ? $this->formatearUrlImagen($crew['poster_path'], 'w500') : null,
                            'calificacion' => round((float) ($crew['vote_average'] ?? 0), 1),
                            'popularidad' => (float) ($crew['popularity'] ?? 0),
                        ];
                    }
                }

                usort($obrasRaw, fn ($a, $b) => ($b['popularidad'] <=> $a['popularidad']));

                return [
                    'director' => $nombreDir,
                    'foto_url' => $fotoUrl,
                    'obras' => $obrasRaw,
                ];
            });

            if ($datosDir && ! empty($datosDir['obras'])) {
                $obrasFiltradas = [];
                foreach ($datosDir['obras'] as $obra) {
                    $tituloLower = mb_strtolower(trim($obra['titulo']));
                    if (! in_array($tituloLower, $excluirLower, true)) {
                        $obrasFiltradas[] = $obra;
                        if (count($obrasFiltradas) >= 10) {
                            break;
                        }
                    }
                }

                if (! empty($obrasFiltradas)) {
                    $resultado[] = [
                        'director' => $datosDir['director'],
                        'foto_url' => $datosDir['foto_url'],
                        'producciones' => $obrasFiltradas,
                    ];
                }
            }
        }

        return $resultado;
    }
}
