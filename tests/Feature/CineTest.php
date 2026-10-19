<?php

namespace Tests\Feature;

use App\Models\Produccion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CineTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalogo_tipos_opinion_carga_correctamente(): void
    {
        $response = $this->get(route('cine.tipos-opinion.index'));

        $response->assertOk();
    }

    public function test_catalogo_directores_carga_correctamente(): void
    {
        $response = $this->get(route('cine.directores.index'));

        $response->assertOk();
    }

    public function test_catalogo_producciones_carga_correctamente(): void
    {
        $response = $this->get(route('cine.producciones.index'));

        $response->assertOk();
    }

    public function test_creacion_produccion_genera_estatus_inicial_automatico(): void
    {
        $produccion = Produccion::create([
            'NombreProduccion' => 'Película Test '.uniqid(),
            'Sinopsis' => 'Sinopsis de prueba',
            'FechaProduccion' => '2026-01-01',
        ]);

        $this->assertDatabaseHas('cine_produccion', [
            'IdProduccion' => $produccion->IdProduccion,
        ]);

        // Verificar inserción automática en kardex de estatus
        $this->assertDatabaseHas('cine_kardex_produccion_estatus', [
            'IdProduccion' => $produccion->IdProduccion,
            'Estatus' => 'por ver',
        ]);

        // Limpieza
        $produccion->delete();
    }

    public function test_cine_dashboard_carga_correctamente(): void
    {
        $response = $this->get(route('cine.dashboard'));

        $response->assertOk();
    }

    public function test_cine_quick_store_agrega_produccion_con_estatus_por_ver(): void
    {
        $titulo = 'Película Rápida '.uniqid();

        $response = $this->post(route('cine.quick-store'), [
            'titulo' => $titulo,
            'sinopsis' => 'Sinopsis rápida',
            'fecha_estreno' => '2026-05-15',
            'poster_url' => 'https://image.tmdb.org/t/p/w500/test.jpg',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('cine_produccion', [
            'NombreProduccion' => $titulo,
        ]);

        $produccion = Produccion::where('NombreProduccion', $titulo)->first();
        $this->assertNotNull($produccion);

        // Validar estatus inicial automático
        $this->assertDatabaseHas('cine_kardex_produccion_estatus', [
            'IdProduccion' => $produccion->IdProduccion,
            'Estatus' => 'por ver',
        ]);

        // Validar que el recurso póster se guardó
        $this->assertDatabaseHas('cine_produccion_recurso', [
            'IdProduccion' => $produccion->IdProduccion,
            'Tipo' => 'imagen',
        ]);
    }
}
