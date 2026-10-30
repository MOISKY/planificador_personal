<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class InglesNoticiasService
{
    /**
     * Obtiene noticias agrupadas para las 3 regiones: Estados Unidos, Canadá y Reino Unido.
     *
     * @return array{
     *     usa: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     canada: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     uk: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     * }
     */
    public function obtenerTodasLasNoticias(int $limite = 10): array
    {
        return [
            'usa' => $this->obtenerNoticiasPorRegion('usa', $limite),
            'canada' => $this->obtenerNoticiasPorRegion('canada', $limite),
            'uk' => $this->obtenerNoticiasPorRegion('uk', $limite),
        ];
    }

    /**
     * Obtiene y parsea el feed RSS de noticias para una región angloparlante.
     *
     * @return list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     */
    public function obtenerNoticiasPorRegion(string $region, int $limite = 10): array
    {
        $cacheKey = "ingles_noticias_{$region}_{$limite}";

        return Cache::remember($cacheKey, 1800, function () use ($region, $limite): array {
            $urls = [
                'usa' => 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
                'canada' => 'https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en',
                'uk' => 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en',
            ];

            $url = $urls[$region] ?? $urls['usa'];

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
                    $fuente = count($partes) > 1 ? trim((string) array_pop($partes)) : 'News';
                    $titulo = trim(implode(' - ', $partes));

                    $fechaFormateada = null;
                    if ($pubDate !== '') {
                        try {
                            $fechaFormateada = Carbon::parse($pubDate)->diffForHumans();
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
                Log::warning("Error obteniendo noticias de {$region}: ".$e->getMessage());

                return [];
            }
        });
    }
}
