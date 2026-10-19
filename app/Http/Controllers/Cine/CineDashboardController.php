<?php

namespace App\Http\Controllers\Cine;

use App\Http\Controllers\Controller;
use App\Models\Director;
use App\Models\Produccion;
use App\Models\ProduccionEstatus;
use App\Services\TmdbService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CineDashboardController extends Controller
{
    public function __construct(
        protected TmdbService $tmdb,
    ) {}

    public function index(): Response
    {
        // 1. Métricas de conteo por estatus
        $porVerCount = Produccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ProduccionEstatus::ESTATUS_POR_VER);
        })->count();

        $viendoCount = Produccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ProduccionEstatus::ESTATUS_VIENDO);
        })->count();

        $terminadoCount = Produccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ProduccionEstatus::ESTATUS_VISTO);
        })->count();

        // 2. Últimos 10 vistos
        $ultimosVistos = Produccion::query()
            ->whereHas('estatusActual', function ($q): void {
                $q->where('Estatus', ProduccionEstatus::ESTATUS_VISTO);
            })
            ->with(['recursos', 'estatusActual', 'comentarios'])
            ->latest('IdProduccion')
            ->take(10)
            ->get()
            ->map(function (Produccion $p): array {
                $poster = $p->recursos->firstWhere('Tipo', 'imagen')?->URL_produccion_recurso;
                $calificacion = $p->comentarios->avg('calificacion');

                return [
                    'IdProduccion' => $p->IdProduccion,
                    'NombreProduccion' => $p->NombreProduccion,
                    'Sinopsis' => $p->Sinopsis,
                    'FechaProduccion' => $p->FechaProduccion?->toDateString(),
                    'FechaVisto' => $p->estatusActual?->FechaRegistro?->toDateString(),
                    'poster_url' => $poster,
                    'calificacion' => $calificacion ? round((float) $calificacion, 1) : null,
                ];
            });

        // 3. Títulos existentes del usuario para cotejo rápido
        $titulosUsuario = Produccion::pluck('NombreProduccion')
            ->map(fn ($n) => mb_strtolower(trim((string) $n)))
            ->all();

        // 4. Tendencias del mes desde TMDB (sin filtros, ordenadas de más reciente a más antiguo)
        $tendenciasRaw = $this->tmdb->obtenerTendencias();
        usort($tendenciasRaw, function (array $a, array $b): int {
            $fa = $a['fecha_estreno'] ?? '';
            $fb = $b['fecha_estreno'] ?? '';

            return strcmp($fb, $fa);
        });

        $tendencias = array_map(function (array $item) use ($titulosUsuario): array {
            $item['en_lista'] = in_array(mb_strtolower(trim($item['titulo'])), $titulosUsuario, true);

            return $item;
        }, $tendenciasRaw);

        // 5. Próximos estrenos desde TMDB (sin filtros, ordenados del más próximo en adelante)
        $proximosRaw = $this->tmdb->obtenerProximosEstrenos();
        usort($proximosRaw, function (array $a, array $b): int {
            $fa = $a['fecha_estreno'] ?? '9999-99-99';
            $fb = $b['fecha_estreno'] ?? '9999-99-99';

            return strcmp($fa, $fb);
        });

        $proximos = array_map(function (array $item) use ($titulosUsuario): array {
            $item['en_lista'] = in_array(mb_strtolower(trim($item['titulo'])), $titulosUsuario, true);

            return $item;
        }, $proximosRaw);

        // 6. Contenido relacionado / spin-offs / secuelas filtrado estrictamente por producciones y directores del usuario
        $todasProducciones = Produccion::pluck('NombreProduccion')->all();
        $todosDirectores = Director::pluck('NombreDirector')->all();
        $poolTendenciasYProximos = array_merge($tendenciasRaw, $proximosRaw);

        $relacionadosRaw = $this->tmdb->obtenerRelacionadosParaProducciones(
            $todasProducciones,
            $todosDirectores,
            $poolTendenciasYProximos
        );

        $relacionados = array_map(function (array $item) use ($titulosUsuario): array {
            $item['en_lista'] = in_array(mb_strtolower(trim($item['titulo'])), $titulosUsuario, true);

            return $item;
        }, $relacionadosRaw);

        // 7. Noticias específicas relacionadas con las producciones o directores del usuario
        $noticiasRelacionadas = $this->tmdb->obtenerNoticiasParaTerminos(
            array_merge($todasProducciones, $todosDirectores)
        );

        // 8. "¿Quieres más de...?" Otras películas de los directores del usuario que no están en su lista
        $masDeDirectores = $this->tmdb->obtenerMasDeDirectores($todosDirectores, $todasProducciones);

        // 9. Noticias generales recientes del mundo del cine sin distinción
        $noticias = $this->tmdb->obtenerNoticiasCine();

        // 10. Notificación / Conteo de producciones a punto de estrenarse en los próximos 30 días
        $hoy = Carbon::today();
        $limite = Carbon::today()->addDays(30);
        $estrenosProximosCount = Produccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ProduccionEstatus::ESTATUS_POR_VER);
        })
            ->whereNotNull('FechaProduccion')
            ->whereBetween('FechaProduccion', [$hoy, $limite])
            ->count();

        return Inertia::render('cine/dashboard', [
            'kpis' => [
                'porVer' => $porVerCount,
                'viendo' => $viendoCount,
                'terminado' => $terminadoCount,
            ],
            'ultimosVistos' => $ultimosVistos,
            'tendencias' => $tendencias,
            'proximos' => $proximos,
            'relacionados' => $relacionados,
            'noticiasRelacionadas' => $noticiasRelacionadas,
            'masDeDirectores' => $masDeDirectores,
            'noticias' => $noticias,
            'estrenosProximosCount' => $estrenosProximosCount,
        ]);
    }

    /**
     * Registro rápido de una producción desde TMDB con 1 solo clic.
     */
    public function quickStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'sinopsis' => ['nullable', 'string'],
            'fecha_estreno' => ['nullable', 'date'],
            'poster_url' => ['nullable', 'string'],
            'tmdb_id' => ['nullable', 'integer'],
            'tipo' => ['nullable', 'string', 'in:movie,tv'],
        ]);

        $nombre = trim($validated['titulo']);

        // Evitar duplicados
        $existente = Produccion::buscarPorNombre($nombre);
        if ($existente) {
            return back()->with('info', "La producción '{$nombre}' ya está en tu lista.");
        }

        $produccion = Produccion::create([
            'NombreProduccion' => $nombre,
            'Sinopsis' => $validated['sinopsis'] ?? null,
            'FechaProduccion' => $validated['fecha_estreno'] ?? null,
        ]);

        // Si tenemos tmdb_id, consultamos detalles para directores y trailer
        if (! empty($validated['tmdb_id'])) {
            $tipo = $validated['tipo'] ?? 'movie';
            $detalle = $this->tmdb->obtenerDetalleProduccion((int) $validated['tmdb_id'], $tipo);

            if ($detalle) {
                // Directores automáticos
                $directoresIds = [];
                foreach ($detalle['directores'] ?? [] as $dirTmdb) {
                    $nombreDir = trim((string) ($dirTmdb['nombre'] ?? ''));
                    if ($nombreDir === '') {
                        continue;
                    }

                    $director = Director::buscarPorNombre($nombreDir);
                    if (! $director) {
                        $director = Director::create([
                            'NombreDirector' => $nombreDir,
                            'Descripcion' => null,
                        ]);
                    }
                    $directoresIds[] = $director->IdDirector;
                }

                if (! empty($directoresIds)) {
                    $produccion->directores()->sync(array_unique($directoresIds));
                }

                // Tráiler automático
                if (! empty($detalle['trailer_url'])) {
                    $produccion->recursos()->create([
                        'Tipo' => 'video',
                        'URL_produccion_recurso' => $detalle['trailer_url'],
                    ]);
                }
            }
        }

        // Póster oficial
        if (! empty($validated['poster_url'])) {
            $produccion->recursos()->create([
                'Tipo' => 'imagen',
                'URL_produccion_recurso' => $validated['poster_url'],
            ]);
        }

        return back()->with('success', "'{$produccion->NombreProduccion}' agregada a tu lista 'Por ver'.");
    }

    /**
     * Endpoint API para el buscador del modal Explorar por año.
     */
    public function explorar(Request $request): JsonResponse
    {
        $ano = (int) $request->integer('ano', (int) date('Y'));
        $query = trim((string) $request->string('query'));

        $titulosUsuario = Produccion::pluck('NombreProduccion')
            ->map(fn ($n) => mb_strtolower(trim((string) $n)))
            ->all();

        $resultados = $this->tmdb->explorarPorAno($ano, $query !== '' ? $query : null);

        $enriquecidos = array_map(function (array $item) use ($titulosUsuario): array {
            $item['en_lista'] = in_array(mb_strtolower(trim($item['titulo'])), $titulosUsuario, true);

            return $item;
        }, $resultados);

        return response()->json(['results' => $enriquecidos]);
    }
}
