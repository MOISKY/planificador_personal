<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\GrupoActividadRecurso;
use App\Models\Proyectos\KardexProyectoActividadEstatus;
use App\Models\Proyectos\KardexProyectoActividadRecursoEstatus;
use App\Models\Proyectos\KardexProyectoEstatus;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\ProyectoActividad;
use App\Models\Proyectos\Rol;
use App\Services\ProyectosNoticiasService;
use Inertia\Inertia;
use Inertia\Response;

class ProyectosDashboardController extends Controller
{
    public function __construct(
        protected ProyectosNoticiasService $noticiasService,
    ) {}

    public function index(): Response
    {
        // 1. Catálogos Generales (Cantidades)
        $proyectosCount = Proyecto::count();
        $personasCount = Persona::count();
        $rolesCount = Rol::count();

        // 2. Proyectos por Estatus (Pendiente, En Emision, Finalizado, Cancelado, Pausado)
        $proyectosPendiente = Proyecto::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', KardexProyectoEstatus::ESTATUS_PENDIENTE))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $proyectosEnEmision = Proyecto::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoEstatus::ESTATUS_EN_EMISION);
        })->count();

        $proyectosFinalizado = Proyecto::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoEstatus::ESTATUS_FINALIZADO);
        })->count();

        $proyectosCancelado = Proyecto::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoEstatus::ESTATUS_CANCELADO);
        })->count();

        $proyectosPausado = Proyecto::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoEstatus::ESTATUS_PAUSADO);
        })->count();

        // 3. Actividades por Estatus (No Realizada, En Proceso, Realizada)
        $actividadesNoRealizada = ProyectoActividad::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', KardexProyectoActividadEstatus::ESTATUS_NO_REALIZADO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $actividadesEnProceso = ProyectoActividad::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoActividadEstatus::ESTATUS_EN_PROCESO);
        })->count();

        $actividadesRealizada = ProyectoActividad::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoActividadEstatus::ESTATUS_REALIZADO);
        })->count();

        // 4. Actividades Recursos por Estatus (No Realizada, En Proceso, Realizada)
        $recursosNoRealizada = GrupoActividadRecurso::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', KardexProyectoActividadRecursoEstatus::ESTATUS_NO_REALIZADO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $recursosEnProceso = GrupoActividadRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoActividadRecursoEstatus::ESTATUS_EN_PROCESO);
        })->count();

        $recursosRealizada = GrupoActividadRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', KardexProyectoActividadRecursoEstatus::ESTATUS_REALIZADO);
        })->count();

        // 5. Últimos proyectos en general
        $ultimosProyectos = Proyecto::query()
            ->with('estatusActual')
            ->withCount(['recursos', 'personasAsignadas', 'actividades'])
            ->orderBy('IdProyecto', 'desc')
            ->take(10)
            ->get();

        // 6. Últimas actividades
        $ultimasActividades = ProyectoActividad::query()
            ->with(['proyecto:IdProyecto,Nombre', 'estatusActual'])
            ->withCount(['recursos', 'equipos', 'actividadesAdicionales'])
            ->orderBy('IdActividad', 'desc')
            ->take(10)
            ->get();

        // 7. Últimas actividades recursos
        $ultimasActividadesRecursos = GrupoActividadRecurso::query()
            ->with(['actividad.proyecto', 'persona', 'estatusActual'])
            ->orderBy('IdActividadRecurso', 'desc')
            ->take(10)
            ->get();

        // 8. Noticias de desarrollo de software, tecnología y aumento de versiones
        $noticias = $this->noticiasService->obtenerTodasLasNoticias(9);

        return Inertia::render('proyectos/dashboard', [
            'kpis' => [
                'catalogos' => [
                    'proyectos' => $proyectosCount,
                    'personas' => $personasCount,
                    'roles' => $rolesCount,
                ],
                'proyectosEstatus' => [
                    'pendiente' => $proyectosPendiente,
                    'enEmision' => $proyectosEnEmision,
                    'finalizado' => $proyectosFinalizado,
                    'cancelado' => $proyectosCancelado,
                    'pausado' => $proyectosPausado,
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
            'ultimosProyectos' => $ultimosProyectos,
            'ultimasActividades' => $ultimasActividades,
            'ultimasActividadesRecursos' => $ultimasActividadesRecursos,
            'noticias' => $noticias,
        ]);
    }
}
