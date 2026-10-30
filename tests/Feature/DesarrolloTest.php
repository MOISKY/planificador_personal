<?php

namespace Tests\Feature;

use App\Models\Desarrollo\Candidato;
use App\Models\Desarrollo\CandidatoTipo;
use App\Models\Desarrollo\Especialidad;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DesarrolloTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function test_especialidades_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('desarrollo.especialidades.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('desarrollo/catalogos/especialidades/index'));
    }

    public function test_especialidades_crud(): void
    {
        $user = $this->admin();

        // Create
        $response = $this->actingAs($user)->post(route('desarrollo.especialidades.store'), [
            'Nombre' => 'Especialidad Test '.uniqid(),
            'Descripcion' => 'Descripción de prueba',
        ]);
        $response->assertSessionHas('success');

        $especialidad = Especialidad::latest('IdEspecialidad')->first();
        $this->assertNotNull($especialidad);

        // Update
        $this->actingAs($user)->put(route('desarrollo.especialidades.update', $especialidad->IdEspecialidad), [
            'Nombre' => 'Especialidad Actualizada '.uniqid(),
            'Descripcion' => 'Descripción actualizada',
        ])->assertSessionHas('success');

        // Delete
        $this->actingAs($user)->delete(route('desarrollo.especialidades.destroy', $especialidad->IdEspecialidad))
            ->assertSessionHas('success');

        $this->assertNull(Especialidad::find($especialidad->IdEspecialidad));
    }

    public function test_candidatos_tipos_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('desarrollo.candidatos-tipos.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('desarrollo/catalogos/candidatos-tipos/index'));
    }

    public function test_candidatos_tipos_crud(): void
    {
        $user = $this->admin();

        // Create
        $response = $this->actingAs($user)->post(route('desarrollo.candidatos-tipos.store'), [
            'Nombre' => 'Externo '.uniqid(),
            'Descripcion' => 'Candidato externo a la organización',
        ]);
        $response->assertSessionHas('success');

        $tipo = CandidatoTipo::latest('IdCandidatoTipo')->first();
        $this->assertNotNull($tipo);

        // Update
        $this->actingAs($user)->put(route('desarrollo.candidatos-tipos.update', $tipo->IdCandidatoTipo), [
            'Nombre' => 'Externo Modificado '.uniqid(),
            'Descripcion' => 'Descripción de tipo actualizada',
        ])->assertSessionHas('success');

        // Delete
        $this->actingAs($user)->delete(route('desarrollo.candidatos-tipos.destroy', $tipo->IdCandidatoTipo))
            ->assertSessionHas('success');

        $this->assertNull(CandidatoTipo::find($tipo->IdCandidatoTipo));
    }

    public function test_candidatos_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('desarrollo.candidatos.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('desarrollo/catalogos/candidatos/index'));
    }

    public function test_candidatos_crud(): void
    {
        $user = $this->admin();

        $especialidad = Especialidad::create([
            'Nombre' => 'Backend PHP / Laravel '.uniqid(),
            'Descripcion' => 'Especialidad para prueba de candidato',
        ]);

        $tipo = CandidatoTipo::create([
            'Nombre' => 'Freelance '.uniqid(),
            'Descripcion' => 'Contratación por proyecto',
        ]);

        // Create Candidato with Especialidad and Tipo
        $response = $this->actingAs($user)->post(route('desarrollo.candidatos.store'), [
            'Nombre' => 'Juan',
            'APaterno' => 'Pérez',
            'AMaterno' => 'López',
            'Telefono' => '5511223344',
            'Movil' => '5599887766',
            'IOrden' => 1,
            'CorreoElectronico' => 'juan.perez@ejemplo.com',
            'UrlCv' => 'https://drive.google.com/file/d/test-cv/view',
            'EActivo' => 'Si',
            'IdEspecialidad' => $especialidad->IdEspecialidad,
            'IdCandidatoTipo' => $tipo->IdCandidatoTipo,
        ]);
        $response->assertSessionHas('success');

        $candidato = Candidato::latest('IdCandidato')->first();
        $this->assertNotNull($candidato);
        $this->assertEquals('Juan', $candidato->Nombre);
        $this->assertEquals('https://drive.google.com/file/d/test-cv/view', $candidato->UrlCv);
        $this->assertEquals('Si', $candidato->EActivo);
        $this->assertEquals($tipo->IdCandidatoTipo, $candidato->IdCandidatoTipo);

        // Update Candidato
        $this->actingAs($user)->put(route('desarrollo.candidatos.update', $candidato->IdCandidato), [
            'Nombre' => 'Juan Carlos',
            'APaterno' => 'Pérez',
            'AMaterno' => 'López',
            'Telefono' => '5511223344',
            'Movil' => '5599887766',
            'IOrden' => 2,
            'CorreoElectronico' => 'juancarlos@ejemplo.com',
            'UrlCv' => 'https://drive.google.com/file/d/test-cv-updated/view',
            'EActivo' => 'No',
            'IdEspecialidad' => $especialidad->IdEspecialidad,
            'IdCandidatoTipo' => null,
        ])->assertSessionHas('success');

        $candidato->refresh();
        $this->assertEquals('Juan Carlos', $candidato->Nombre);
        $this->assertEquals('No', $candidato->EActivo);
        $this->assertNull($candidato->IdCandidatoTipo);

        // Delete Candidato
        $this->actingAs($user)->delete(route('desarrollo.candidatos.destroy', $candidato->IdCandidato))
            ->assertSessionHas('success');

        $this->assertNull(Candidato::find($candidato->IdCandidato));

        // Cleanup
        $tipo->delete();
        $especialidad->delete();
    }
}
