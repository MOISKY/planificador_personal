<?php

namespace Tests\Feature\Proyectos;

use App\Models\Proyectos\KardexProyectoEstatus;
use App\Models\Proyectos\Proyecto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProyectoEstatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_automaticamente_un_estatus_inicial_pendiente_al_crear_un_proyecto(): void
    {
        $proyecto = Proyecto::create([
            'Nombre' => 'Proyecto Alfa',
            'Descripcion' => 'Descripción del proyecto alfa',
        ]);

        $this->assertCount(1, $proyecto->estatusKardex);
        $this->assertSame(KardexProyectoEstatus::ESTATUS_PENDIENTE, $proyecto->estatusActual->Estatus);
    }

    public function test_permite_acceder_al_listado_del_kardex_de_estatus_de_proyectos(): void
    {
        $user = User::factory()->create();
        Proyecto::create([
            'Nombre' => 'Proyecto Beta',
        ]);

        $response = $this->actingAs($user)->get(route('proyectos.proyecto-estatus.index'));

        $response->assertOk();
    }

    public function test_permite_actualizar_el_estatus_de_un_proyecto_en_el_kardex(): void
    {
        $user = User::factory()->create();
        $proyecto = Proyecto::create([
            'Nombre' => 'Proyecto Gamma',
        ]);

        $estatus = $proyecto->estatusActual;

        $response = $this->actingAs($user)->put(route('proyectos.proyecto-estatus.update', $estatus->IdProyectoEstatus), [
            'Estatus' => KardexProyectoEstatus::ESTATUS_EN_EMISION,
        ]);

        $response->assertRedirect();
        $this->assertSame(KardexProyectoEstatus::ESTATUS_EN_EMISION, $estatus->fresh()->Estatus);
    }

    public function test_no_permite_eliminar_un_registro_de_estatus_del_kardex(): void
    {
        $user = User::factory()->create();
        $proyecto = Proyecto::create([
            'Nombre' => 'Proyecto Delta',
        ]);

        $estatus = $proyecto->estatusActual;

        $response = $this->actingAs($user)->delete(route('proyectos.proyecto-estatus.destroy', $estatus->IdProyectoEstatus));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertNotNull(KardexProyectoEstatus::find($estatus->IdProyectoEstatus));
    }
}
