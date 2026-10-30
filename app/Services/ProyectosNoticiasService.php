<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProyectosNoticiasService
{
    /**
     * Obtiene noticias agrupadas para las 3 secciones:
     * desarrollo de software, tecnología & IA, y versiones / lanzamientos.
     *
     * @return array{
     *     desarrollo: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     tecnologia: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     versiones: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     * }
     */
    public function obtenerTodasLasNoticias(int $limite = 10): array
    {
        return [
            'desarrollo' => $this->obtenerNoticiasPorCategoria('desarrollo', $limite),
            'tecnologia' => $this->obtenerNoticiasPorCategoria('tecnologia', $limite),
            'versiones' => $this->obtenerNoticiasPorCategoria('versiones', $limite),
        ];
    }

    /**
     * Obtiene y parsea el feed RSS de noticias para una categoría técnica.
     *
     * @return list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     */
    public function obtenerNoticiasPorCategoria(string $categoria, int $limite = 10): array
    {
        $cacheKey = "proyectos_noticias_{$categoria}_{$limite}";

        return Cache::remember($cacheKey, 1800, function () use ($categoria, $limite): array {
            $queries = [
                'desarrollo' => 'desarrollo de software OR ingenieria de software OR frameworks OR desarrolladores OR programacion',
                'tecnologia' => 'tecnologia OR "inteligencia artificial" OR cloud computing OR microservicios OR ciberseguridad',
                'versiones' => '"nueva version" OR "lanzamiento de version" OR "actualizacion de software" OR changelog OR release',
            ];

            $query = $queries[$categoria] ?? $queries['desarrollo'];
            $url = 'https://news.google.com/rss/search?q='.urlencode($query).'&hl=es-419&gl=MX&ceid=MX:es-419';

            try {
                $response = Http::timeout(6)
                    ->withoutVerifying()
                    ->get($url);

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
                    $fuente = count($partes) > 1 ? trim((string) array_pop($partes)) : 'Tech News';
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
                Log::warning("Error obteniendo noticias de proyectos ({$categoria}): ".$e->getMessage());

                return [];
            }
        });
    }
}
