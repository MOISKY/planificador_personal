<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Alumno;
use App\Models\Ingles\Grupo;
use App\Models\Ingles\GrupoActividad;
use App\Models\Ingles\GrupoActividadRecurso;
use App\Models\Ingles\KardexGrupoActividadEstatus;
use App\Models\Ingles\KardexGrupoActividadRecursoEstatus;
use App\Models\Ingles\Materia;
use App\Models\Ingles\MateriaRecurso;
use App\Services\InglesNoticiasService;
use Inertia\Inertia;
use Inertia\Response;

class InglesDashboardController extends Controller
{
    public function __construct(
        protected InglesNoticiasService $noticiasService,
    ) {}

    public function index(): Response
    {
        // 1. Catálogos Principales (Cantidades)
        $gruposCount = Grupo::count();
        $materiasCount = Materia::count();
        $alumnosCount = Alumno::count();

        // 2. Actividades por Estatus (No Realizada, En Proceso, Realizada)
        $actividadesNoRealizada = GrupoActividad::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', KardexGrupoActividadEstatus::ESTATUS_NO_REALIZADO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $actividadesEnProceso = GrupoActividad::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexGrupoActividadEstatus::ESTATUS_EN_PROCESO);
        })->count();

        $actividadesRealizada = GrupoActividad::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexGrupoActividadEstatus::ESTATUS_REALIZADO);
        })->count();

        // 3. Actividades Recursos por Estatus (No Realizada, En Proceso, Realizada)
        $recursosNoRealizada = GrupoActividadRecurso::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', KardexGrupoActividadRecursoEstatus::ESTATUS_NO_REALIZADO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $recursosEnProceso = GrupoActividadRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexGrupoActividadRecursoEstatus::ESTATUS_EN_PROCESO);
        })->count();

        $recursosRealizada = GrupoActividadRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexGrupoActividadRecursoEstatus::ESTATUS_REALIZADO);
        })->count();

        // 4. Últimos recursos de materias en general
        $ultimasMateriasRecursos = MateriaRecurso::query()
            ->with(['materia:IdMateria,Nombre'])
            ->withCount('recursosAdicionales')
            ->orderBy('IdRecurso', 'desc')
            ->take(10)
            ->get();

        // 5. Últimas actividades
        $ultimasActividades = GrupoActividad::query()
            ->with(['grupo:IdGrupo,Grupo', 'estatusActual'])
            ->withCount(['recursos', 'equipos', 'actividadesAdicionales'])
            ->orderBy('IdActividad', 'desc')
            ->take(10)
            ->get();

        // 6. Últimos recursos de actividades
        $ultimasActividadesRecursos = GrupoActividadRecurso::query()
            ->with(['actividad.grupo', 'alumno', 'estatusActual'])
            ->orderBy('IdActividadRecurso', 'desc')
            ->take(10)
            ->get();

        // 7. Noticias internacionales (USA, Canadá, Reino Unido)
        $noticias = $this->noticiasService->obtenerTodasLasNoticias(9);

        return Inertia::render('ingles/dashboard', [
            'kpis' => [
                'catalogos' => [
                    'grupos' => $gruposCount,
                    'materias' => $materiasCount,
                    'alumnos' => $alumnosCount,
                ],
                'actividades' => [
                    'noRealizada' => $actividadesNoRealizada,
                    'enProceso' => $actividadesEnProceso,
                    'realizada' => $actividadesRealizada,
                ],
                'actividadesRecursos' => [
                    'noRealizada' => $recursosNoRealizada,
                    'enProceso' => $recursosEnProceso,
                    'realizada' => $recursosRealizada,
                ],
            ],
            'ultimasMateriasRecursos' => $ultimasMateriasRecursos,
            'ultimasActividades' => $ultimasActividades,
            'ultimasActividadesRecursos' => $ultimasActividadesRecursos,
            'noticias' => $noticias,
        ]);
    }
}
