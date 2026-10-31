<?php

namespace Tests\Feature;

use App\Models\Admin\AdminKardexProyectoActividadRecursoEstatus;
use App\Models\Admin\AdminKardexProyectoEstatus;
use App\Models\Admin\AdminModulo;
use App\Models\Admin\AdminPersonal;
use App\Models\Admin\AdminProyecto;
use App\Models\Admin\AdminProyectoActividad;
use App\Models\Admin\AdminProyectoActividadRecurso;
use App\Models\Admin\AdminProyectoModulo;
use App\Models\Admin\AdminProyectoPersonal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GestionProyectosTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function test_proyectos_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('desarrollo.proyectos.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('desarrollo/gestion-proyectos/proyectos/index'));
    }

    public function test_proyectos_crud_and_status(): void
    {
        $user = $this->admin();

        // 1. Create
        $response = $this->actingAs($user)->post(route('desarrollo.proyectos.store'), [
            'Nombre' => 'Proyecto ERP Alpha',
            'Descripcion' => 'Sistema de planeación corporativa',
            'FechaInicio' => '2026-11-01',
            'Duracion' => '4 meses',
        ]);
        $response->assertSessionHas('success');

        $proyecto = AdminProyecto::latest('IdProyecto')->first();
        $this->assertNotNull($proyecto);
        $this->assertEquals('Proyecto ERP Alpha', $proyecto->Nombre);
        $this->assertEquals('4 meses', $proyecto->Duracion);

        // Auto kardex creation
        $this->assertDatabaseHas('admin_kardex_proyecto_estatus', [
            'IdProyecto' => $proyecto->IdProyecto,
            'Estatus' => AdminKardexProyectoEstatus::ESTATUS_PENDIENTE,
        ]);

        // 2. Change status
        $this->actingAs($user)->post(route('desarrollo.proyectos.estatus', $proyecto->IdProyecto), [
            'Estatus' => AdminKardexProyectoEstatus::ESTATUS_EN_EMISION,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_kardex_proyecto_estatus', [
            'IdProyecto' => $proyecto->IdProyecto,
            'Estatus' => AdminKardexProyectoEstatus::ESTATUS_EN_EMISION,
        ]);

        // 3. Update
        $this->actingAs($user)->put(route('desarrollo.proyectos.update', $proyecto->IdProyecto), [
            'Nombre' => 'Proyecto ERP Alpha 2.0',
            'Descripcion' => 'Descripción actualizada',
            'FechaInicio' => '2026-11-05',
            'Duracion' => '6 meses',
        ])->assertSessionHas('success');

        $proyecto->refresh();
        $this->assertEquals('Proyecto ERP Alpha 2.0', $proyecto->Nombre);

        // 4. Delete
        $this->actingAs($user)->delete(route('desarrollo.proyectos.destroy', $proyecto->IdProyecto))
            ->assertSessionHas('success');

        $this->assertNull(AdminProyecto::find($proyecto->IdProyecto));
    }

    public function test_proyecto_personal_and_modulos_assignment(): void
    {
        $user = $this->admin();

        $proyecto = AdminProyecto::create([
            'Nombre' => 'Proyecto Asignaciones',
        ]);

        $personal = AdminPersonal::create([
            'Codigo' => 'PERS-001',
            'Nombre' => 'Ana',
            'APaterno' => 'Gómez',
            'CorreoElectronico' => 'ana.gomez@empresa.com',
            'EActivo' => 'Si',
        ]);

        $modulo = AdminModulo::create([
            'Codigo' => 'MOD-FACT',
            'Nombre' => 'Facturación Electrónica',
            'EActivo' => 'Si',
        ]);

        // Assign Personal
        $this->actingAs($user)->post(route('desarrollo.proyectos.personal.store', $proyecto->IdProyecto), [
            'IdPersonal' => $personal->IdPersonal,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_proyecto_personal', [
            'IdProyecto' => $proyecto->IdProyecto,
            'IdPersonal' => $personal->IdPersonal,
        ]);

        // Assign Modulo
        $this->actingAs($user)->post(route('desarrollo.proyectos.modulos.store', $proyecto->IdProyecto), [
            'IdModulo' => $modulo->IdModulo,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_proyecto_modulo', [
            'IdProyecto' => $proyecto->IdProyecto,
            'IdModulo' => $modulo->IdModulo,
        ]);
    }

    public function test_actividades_with_modulo_rule_and_equipos_and_recursos(): void
    {
        $user = $this->admin();

        $proyecto = AdminProyecto::create(['Nombre' => 'Proyecto Completo']);

        $personal1 = AdminPersonal::create([
            'Codigo' => 'P-1',
            'Nombre' => 'Carlos',
            'APaterno' => 'Sánchez',
            'CorreoElectronico' => 'carlos@empresa.com',
            'EActivo' => 'Si',
        ]);

        $personal2 = AdminPersonal::create([
            'Codigo' => 'P-2',
            'Nombre' => 'David',
            'APaterno' => 'Torres',
            'CorreoElectronico' => 'david@empresa.com',
            'EActivo' => 'Si',
        ]);

        $moduloValido = AdminModulo::create([
            'Codigo' => 'MOD-1',
            'Nombre' => 'Módulo Válido',
            'EActivo' => 'Si',
        ]);

        $moduloInvalido = AdminModulo::create([
            'Codigo' => 'MOD-2',
            'Nombre' => 'Módulo Fuera de Proyecto',
            'EActivo' => 'Si',
        ]);

        // Add personal1 to project
        AdminProyectoPersonal::create([
            'IdProyecto' => $proyecto->IdProyecto,
            'IdPersonal' => $personal1->IdPersonal,
        ]);

        // Add moduloValido to project
        AdminProyectoModulo::create([
            'IdProyecto' => $proyecto->IdProyecto,
            'IdModulo' => $moduloValido->IdModulo,
        ]);

        // Activity with valid module passes
        $response = $this->actingAs($user)->post(route('desarrollo.proyectos.actividades.store', $proyecto->IdProyecto), [
            'Nombre' => 'Actividad Módulo Test',
            'Descripcion' => 'Implementación técnica',
            'IdModulo' => $moduloValido->IdModulo,
            'Tipo' => AdminProyectoActividad::TIPO_EQUIPO,
            'FechaEntrega' => '2026-11-20',
        ]);
        $response->assertSessionHas('success');

        $actividad = AdminProyectoActividad::latest('IdActividad')->first();
        $this->assertNotNull($actividad);
        $this->assertEquals($moduloValido->IdModulo, $actividad->IdModulo);

        // Activity with invalid module fails validation
        $responseFail = $this->actingAs($user)->post(route('desarrollo.proyectos.actividades.store', $proyecto->IdProyecto), [
            'Nombre' => 'Actividad Inválida',
            'IdModulo' => $moduloInvalido->IdModulo,
            'Tipo' => AdminProyectoActividad::TIPO_INDIVIDUAL,
        ]);
        $responseFail->assertSessionHasErrors('IdModulo');

        // Add personal1 (member of project) to activity team -> passes
        $this->actingAs($user)->post(route('desarrollo.actividades.equipos.store', $actividad->IdActividad), [
            'IdPersonal' => $personal1->IdPersonal,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_proyecto_actividad_equipo', [
            'IdActividad' => $actividad->IdActividad,
            'IdPersonal' => $personal1->IdPersonal,
        ]);

        // Add personal2 (NOT member of project) to activity team -> fails
        $responsePersonalFail = $this->actingAs($user)->post(route('desarrollo.actividades.equipos.store', $actividad->IdActividad), [
            'IdPersonal' => $personal2->IdPersonal,
        ]);
        $responsePersonalFail->assertSessionHasErrors('IdPersonal');

        // Create Recurso
        $this->actingAs($user)->post(route('desarrollo.actividades.recursos.store', $actividad->IdActividad), [
            'Nombre' => 'Documentación Swagger',
            'IdPersonal' => $personal1->IdPersonal,
            'URLRecurso' => 'https://drive.google.com/file/d/sample',
        ])->assertSessionHas('success');

        $recurso = AdminProyectoActividadRecurso::latest('IdActividadRecurso')->first();
        $this->assertNotNull($recurso);
        $this->assertEquals('Documentación Swagger', $recurso->Nombre);

        // Change status of recurso
        $this->actingAs($user)->post(route('desarrollo.actividades.recursos.estatus', [
            'actividad' => $actividad->IdActividad,
            'recurso' => $recurso->IdActividadRecurso,
        ]), [
            'Estatus' => AdminKardexProyectoActividadRecursoEstatus::ESTATUS_REALIZADA,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_kardex_proyecto_actividad_recurso_estatus', [
            'IdActividadRecurso' => $recurso->IdActividadRecurso,
            'Estatus' => AdminKardexProyectoActividadRecursoEstatus::ESTATUS_REALIZADA,
        ]);

        // Adicionales
        $this->actingAs($user)->post(route('desarrollo.actividades.adicionales.store', $actividad->IdActividad), [
            'Descripcion' => 'Diagrama de Arquitectura',
            'UrlRecurso' => 'https://mi-enlace.com',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admin_proyecto_actividad_adicional', [
            'IdActividad' => $actividad->IdActividad,
            'Descripcion' => 'Diagrama de Arquitectura',
        ]);
    }

    public function test_kardex_history_indexes_render(): void
    {
        $user = $this->admin();

        $this->actingAs($user)
            ->get(route('desarrollo.kardex.proyectos.index'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('desarrollo.kardex.actividades.index'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('desarrollo.kardex.recursos.index'))
            ->assertOk();
    }
}
