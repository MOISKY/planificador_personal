<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Modulo;
use App\Models\Contabilidad\ModuloLeccion;
use App\Models\Contabilidad\ModuloLeccionEstatus;
use App\Models\Contabilidad\ModuloReto;
use App\Models\Contabilidad\ModuloRetoRecurso;
use App\Models\Contabilidad\ModuloRetoRecursoEstatus;
use Inertia\Inertia;
use Inertia\Response;

class ContabilidadDashboardController extends Controller
{
    public function index(): Response
    {
        // 1. Métricas de Lecciones por Estatus
        $leccionNoLeidoCount = ModuloLeccion::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', ModuloLeccionEstatus::ESTATUS_NO_LEIDO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $leccionLeyendoCount = ModuloLeccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ModuloLeccionEstatus::ESTATUS_LEYENDO);
        })->count();

        $leccionLeidoCount = ModuloLeccion::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ModuloLeccionEstatus::ESTATUS_LEIDO);
        })->count();

        // 2. Métricas de Retos / Recursos por Estatus
        $retoNoRealizadoCount = ModuloRetoRecurso::where(function ($query): void {
            $query->whereHas('estatusActual', fn ($q) => $q->where('Estatus', ModuloRetoRecursoEstatus::ESTATUS_NO_REALIZADO))
                ->orWhereDoesntHave('estatusActual');
        })->count();

        $retoEnProcesoCount = ModuloRetoRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ModuloRetoRecursoEstatus::ESTATUS_EN_PROCESO);
        })->count();

        $retoRealizadoCount = ModuloRetoRecurso::whereHas('estatusActual', function ($q): void {
            $q->where('Estatus', ModuloRetoRecursoEstatus::ESTATUS_REALIZADO);
        })->count();

        // 3. Los últimos 6 módulos agregados
        $ultimosModulos = Modulo::query()
            ->withCount(['retos', 'lecciones'])
            ->orderBy('IdModulo', 'desc')
            ->take(6)
            ->get();

        // 4. Los últimos 12 retos agregados
        $ultimosRetos = ModuloReto::query()
            ->with(['modulo:IdModulo,Modulo'])
            ->withCount(['recursos', 'actividades_alumnos'])
            ->orderBy('IdReto', 'desc')
            ->take(12)
            ->get();

        // 5. Las últimas 12 lecciones agregadas
        $ultimasLecciones = ModuloLeccion::query()
            ->with(['modulo:IdModulo,Modulo', 'estatusActual'])
            ->withCount(['recursos'])
            ->orderBy('IdLeccion', 'desc')
            ->take(12)
            ->get();

        return Inertia::render('contabilidad/dashboard', [
            'kpis' => [
                'lecciones' => [
                    'noLeido' => $leccionNoLeidoCount,
                    'leyendo' => $leccionLeyendoCount,
                    'leido' => $leccionLeidoCount,
                ],
                'retos' => [
                    'noRealizado' => $retoNoRealizadoCount,
                    'enProceso' => $retoEnProcesoCount,
                    'realizado' => $retoRealizadoCount,
                ],
            ],
            'ultimosModulos' => $ultimosModulos,
            'ultimosRetos' => $ultimosRetos,
            'ultimasLecciones' => $ultimasLecciones,
        ]);
    }
}
