<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ContabilidadNoticiasService
{
    /**
     * Obtiene noticias agrupadas para las 3 secciones: contabilidad, derecho mexicano y administración.
     *
     * @return array{
     *     contabilidad: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     derecho: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>,
     *     administracion: list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     * }
     */
    public function obtenerTodasLasNoticias(int $limite = 10): array
    {
        return [
            'contabilidad' => $this->obtenerNoticiasPorCategoria('contabilidad', $limite),
            'derecho' => $this->obtenerNoticiasPorCategoria('derecho', $limite),
            'administracion' => $this->obtenerNoticiasPorCategoria('administracion', $limite),
        ];
    }

    /**
     * Obtiene y parsea el feed RSS de noticias para una categoría específica de México.
     *
     * @return list<array{titulo: string, fuente: string, url: string, fecha: string|null}>
     */
    public function obtenerNoticiasPorCategoria(string $categoria, int $limite = 10): array
    {
        $cacheKey = "contabilidad_noticias_{$categoria}_{$limite}";

        return Cache::remember($cacheKey, 1800, function () use ($categoria, $limite): array {
            $queries = [
                'contabilidad' => 'contabilidad fiscal SAT impuestos CFDI NIF mexico',
                'derecho' => 'derecho mexicano reformas leyes decreto "diario oficial" SCJN',
                'administracion' => 'administracion empresas gestion negocios pymes liderazgo mexico',
            ];

            $query = $queries[$categoria] ?? $queries['contabilidad'];
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
                    $fuente = count($partes) > 1 ? trim((string) array_pop($partes)) : 'Actualidad';
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
                Log::warning("Error obteniendo noticias de {$categoria}: ".$e->getMessage());

                return [];
            }
        });
    }
}
