<?php

namespace Tests\Feature\Ingles;

use App\Models\Ingles\Alumno;
use App\Models\Ingles\Asesor;
use App\Models\Ingles\Grupo;
use App\Models\Ingles\GrupoActividad;
use App\Models\Ingles\GrupoActividadRecurso;
use App\Models\Ingles\Materia;
use App\Models\Ingles\MateriaRecurso;
use App\Models\Ingles\Periodo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InglesDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_de_ingles_carga_correctamente_con_sus_metricas(): void
    {
        $user = User::factory()->create();

        $periodo = Periodo::create([
            'Nombre' => 'Periodo 2026-1',
            'FechaInicio' => '2026-01-01',
            'FechaFin' => '2026-06-30',
        ]);

        $asesor = Asesor::create([
            'Nombre' => 'John',
            'ApellidoPaterno' => 'Smith',
        ]);

        $materia = Materia::create([
            'Nombre' => 'Inglés Avanzado',
        ]);

        $grupo = Grupo::create([
            'Grupo' => 'ENG-101',
            'IdPeriodo' => $periodo->IdPeriodo,
            'IdMateria' => $materia->IdMateria,
            'IdAsesor' => $asesor->IdAsesor,
        ]);

        $alumno = Alumno::create([
            'Nombre' => 'Alice',
            'ApellidoPaterno' => 'Johnson',
        ]);

        $materiaRecurso = MateriaRecurso::create([
            'IdMateria' => $materia->IdMateria,
            'Nombre' => 'Grammar Guide PDF',
            'Descripcion' => 'Guía de gramática inglesa',
        ]);

        $actividad = GrupoActividad::create([
            'IdGrupo' => $grupo->IdGrupo,
            'Nombre' => 'Unit 1 Essay',
            'Tipo' => 'Individual',
        ]);

        $actividadRecurso = GrupoActividadRecurso::create([
            'IdActividad' => $actividad->IdActividad,
            'Nombre' => 'Alice Essay Submission',
            'IdAlumno' => $alumno->IdAlumno,
            'URLRecurso' => 'https://example.com/essay.pdf',
        ]);

        $response = $this->actingAs($user)->get(route('ingles.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('ingles/dashboard')
            ->has('kpis.catalogos.grupos')
            ->has('kpis.catalogos.materias')
            ->has('kpis.catalogos.alumnos')
            ->has('kpis.actividades.noRealizada')
            ->has('kpis.actividades.enProceso')
            ->has('kpis.actividades.realizada')
            ->has('kpis.actividadesRecursos.noRealizada')
            ->has('kpis.actividadesRecursos.enProceso')
            ->has('kpis.actividadesRecursos.realizada')
            ->has('ultimasMateriasRecursos')
            ->has('ultimasActividades')
            ->has('ultimasActividadesRecursos')
            ->has('noticias.usa')
            ->has('noticias.canada')
            ->has('noticias.uk')
            ->where('kpis.catalogos.grupos', 1)
            ->where('kpis.catalogos.materias', 1)
            ->where('kpis.catalogos.alumnos', 1)
            ->where('kpis.actividades.noRealizada', 1)
            ->where('kpis.actividadesRecursos.noRealizada', 1)
        );
    }
}
