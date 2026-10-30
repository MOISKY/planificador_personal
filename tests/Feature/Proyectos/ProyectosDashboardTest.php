<?php

namespace Tests\Feature\Proyectos;

use App\Models\Proyectos\GrupoActividadRecurso;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\ProyectoActividad;
use App\Models\Proyectos\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProyectosDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_de_proyectos_carga_correctamente_con_todas_sus_metricas(): void
    {
        $user = User::factory()->create();

        $rol = Rol::create([
            'Rol' => 'Tech Lead',
        ]);

        $persona = Persona::create([
            'Nombre' => 'Carlos',
            'ApellidoPaterno' => 'Mendoza',
            'correoElectronico' => 'carlos@example.com',
        ]);

        $proyecto = Proyecto::create([
            'Nombre' => 'ERP Cloud 2026',
            'Descripcion' => 'Sistema empresarial en la nube',
            'FechaInicio' => '2026-01-01',
            'FechaFinal' => '2026-12-31',
        ]);

        $actividad = ProyectoActividad::create([
            'IdProyecto' => $proyecto->IdProyecto,
            'Nombre' => 'Módulo de Inventarios',
            'Tipo' => 'Individual',
        ]);

        $recurso = GrupoActividadRecurso::create([
            'IdActividad' => $actividad->IdActividad,
            'Nombre' => 'Diagrama Arquitectura',
            'IdPersona' => $persona->IdPersona,
            'URLRecurso' => 'https://example.com/arch.pdf',
        ]);

        $response = $this->actingAs($user)->get(route('proyectos.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('proyectos/dashboard')
            ->has('kpis.catalogos.proyectos')
            ->has('kpis.catalogos.personas')
            ->has('kpis.catalogos.roles')
            ->has('kpis.proyectosEstatus.pendiente')
            ->has('kpis.proyectosEstatus.enEmision')
            ->has('kpis.proyectosEstatus.finalizado')
            ->has('kpis.proyectosEstatus.cancelado')
            ->has('kpis.proyectosEstatus.pausado')
            ->has('kpis.actividades.noRealizada')
            ->has('kpis.actividades.enProceso')
            ->has('kpis.actividades.realizada')
            ->has('kpis.actividadesRecursos.noRealizada')
            ->has('kpis.actividadesRecursos.enProceso')
            ->has('kpis.actividadesRecursos.realizada')
            ->has('ultimosProyectos')
            ->has('ultimasActividades')
            ->has('ultimasActividadesRecursos')
            ->has('noticias.desarrollo')
            ->has('noticias.tecnologia')
            ->has('noticias.versiones')
            ->where('kpis.catalogos.proyectos', 1)
            ->where('kpis.catalogos.personas', 1)
            ->where('kpis.catalogos.roles', 1)
            ->where('kpis.proyectosEstatus.pendiente', 1)
            ->where('kpis.actividades.noRealizada', 1)
            ->where('kpis.actividadesRecursos.noRealizada', 1)
        );
    }
}
