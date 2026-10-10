<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AutoFolio;
use App\Services\DynamicQueryExecutor;
use App\Services\Kardex;
use App\Services\MaximoId;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ServiciosNoilTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('demo_items', function ($t) {
            $t->integer('IdItem');
            $t->string('sContrato')->nullable();
            $t->string('Folio')->nullable();
        });
        Schema::create('master_cnf_folios', function ($t) {
            $t->string('Tabla');
            $t->string('Campo');
            $t->string('Prefijo');
            $t->string('Complemento')->nullable();
            $t->integer('IniciarEn');
            $t->integer('N_Salto');
            $t->integer('NumDig');
            $t->string('TipoReinicio')->nullable();
            $t->integer('IdDepartamento')->nullable();
            $t->string('Aplicar');
        });
        Schema::create('master_consultassql', function ($t) {
            $t->string('NombreConsulta');
            $t->text('SQL');
        });
        Schema::create('kardex_sistema', function ($t) {
            $t->string('SContrato')->nullable();
            $t->integer('IdUsuario')->nullable();
            $t->string('DFecha');
            $t->string('SHora');
            $t->string('SDescripcion');
            $t->string('SOrigen');
        });
    }

    public function test_maximo_id_por_contrato(): void
    {
        DB::table('demo_items')->insert([
            ['IdItem' => 5, 'sContrato' => 'A'],
            ['IdItem' => 9, 'sContrato' => 'B'],
        ]);

        $this->assertSame(6, (new MaximoId)->getIdMaximo('A', 'demo_items', 'IdItem'));
        $this->assertSame(10, (new MaximoId)->getIdMaximo('', 'demo_items', 'IdItem'));
        $this->assertSame(1, (new MaximoId)->getIdMaximo('Z', 'demo_items', 'IdItem'));
    }

    public function test_maximo_id_rechaza_identificadores_raros(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        (new MaximoId)->getIdMaximo('', 'demo_items; DROP TABLE x', 'IdItem');
    }

    public function test_autofolio_continua_la_serie(): void
    {
        DB::table('master_cnf_folios')->insert([
            'Tabla' => 'demo_items', 'Campo' => 'Folio', 'Prefijo' => 'SOL-', 'Complemento' => null,
            'IniciarEn' => 1, 'N_Salto' => 1, 'NumDig' => 5, 'TipoReinicio' => null, 'Aplicar' => 'Si',
        ]);

        $this->assertSame('SOL-00001', (new AutoFolio)->generar('demo_items'));

        DB::table('demo_items')->insert(['IdItem' => 1, 'Folio' => 'SOL-00007']);

        $this->assertSame('SOL-00008', (new AutoFolio)->generar('demo_items'));
    }

    public function test_dynamic_query_sustituye_parametros(): void
    {
        DB::table('demo_items')->insert([
            ['IdItem' => 1, 'sContrato' => "O'Hara"],
            ['IdItem' => 2, 'sContrato' => 'B'],
        ]);
        DB::table('master_consultassql')->insert([
            'NombreConsulta' => 'por_contrato',
            'SQL' => 'SELECT IdItem FROM demo_items WHERE sContrato = :contrato ORDER BY IdItem;',
        ]);

        $rows = (new DynamicQueryExecutor)->executeQueryByName('por_contrato', ['contrato' => "O'Hara"]);
        $this->assertSame(1, $rows[0]->IdItem);

        $pag = (new DynamicQueryExecutor)->executeQueryByNamePaginated('por_contrato', ['contrato' => 'B'], 1, 10);
        $this->assertSame(1, $pag['total']);
    }

    public function test_kardex_escribe_con_la_consulta_nombrada(): void
    {
        DB::table('master_consultassql')->insert([
            'NombreConsulta' => Kardex::CONSULTA,
            'SQL' => 'INSERT INTO kardex_sistema (SContrato, IdUsuario, DFecha, SHora, SDescripcion, SOrigen) VALUES (:Contrato, :Usuario, :Fecha, :Hora, :Descripcion, :Origen)',
        ]);
        session(['sContrato' => 'CT-1']);
        $this->actingAs(User::factory()->create());

        app(Kardex::class)->registrar('Puesto 7 [Gerente] registrado', 'Catálogo de Puestos');

        $this->assertDatabaseHas('kardex_sistema', ['SContrato' => 'CT-1', 'SOrigen' => 'Catálogo de Puestos']);
    }
}
