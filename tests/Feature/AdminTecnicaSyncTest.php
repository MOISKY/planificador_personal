<?php

namespace Tests\Feature;

use App\Services\AdminTecnicaSync;
use App\Services\TenantConnection;
use Illuminate\Database\Connection;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminTecnicaSyncTest extends TestCase
{
    use RefreshDatabase;

    /** @var array<string, list<string>> catálogos maestros que la migración de la plantilla no crea */
    private const MAESTRAS = [
        'master_modulos' => ['IdModulo', 'IdProducto', 'SNombre'],
        'master_opciones' => ['IdOpcion', 'IdModulo', 'EVisible', 'SOpcion'],
        'admin_roles_modulos' => ['IdModulo', 'IdRol', 'IdOpcion'],
        'master_productos' => ['IdProducto', 'SNombreProducto'],
        'master_idioma' => ['IdIdioma', 'SCodigo'],
        'admin_clientes_roles' => ['IdRol', 'IdCliente', 'SCodigo'],
    ];

    private string $tenantDb;

    private Connection $master;

    private Connection $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantDb = tempnam(sys_get_temp_dir(), 'tenant');
        config(['noil.producto_id' => 3]);

        $this->master = DB::connection(config('noil.master_connection'));
        $this->crearTablas($this->master, self::MAESTRAS);
        $this->master->table('admin_clientes')->insert(['IdCliente' => 1, 'SNombre' => 'Uno', 'DB_DATABASE' => $this->tenantDb]);

        $this->tenant = DB::connection(app(TenantConnection::class)->usar(1));
        $this->crearTablas($this->tenant, AdminTecnicaSync::COLUMNAS);
    }

    protected function tearDown(): void
    {
        @unlink($this->tenantDb);
        parent::tearDown();
    }

    public function test_sync_mirrors_only_this_product_and_client(): void
    {
        $this->master->table('master_modulos')->insert([
            ['IdModulo' => 10, 'IdProducto' => 3, 'SNombre' => 'Nuestro'],
            ['IdModulo' => 20, 'IdProducto' => 9, 'SNombre' => 'Ajeno'],
        ]);
        $this->master->table('master_opciones')->insert([
            ['IdOpcion' => 100, 'IdModulo' => 10, 'EVisible' => 'Cliente', 'SOpcion' => 'Visible'],
            ['IdOpcion' => 101, 'IdModulo' => 10, 'EVisible' => 'Interno', 'SOpcion' => 'Oculta'],
            ['IdOpcion' => 200, 'IdModulo' => 20, 'EVisible' => 'Cliente', 'SOpcion' => 'Ajena'],
        ]);
        $this->master->table('admin_roles_modulos')->insert([
            ['IdModulo' => 10, 'IdRol' => 1, 'IdOpcion' => 100],
            ['IdModulo' => 10, 'IdRol' => 1, 'IdOpcion' => null],
            ['IdModulo' => 20, 'IdRol' => 2, 'IdOpcion' => 200],
        ]);
        $this->master->table('admin_clientes_roles_usuarios')->insert([
            ['IdRolUsuario' => 1, 'IdCliente' => 1, 'IdRol' => 1, 'IdUsuario' => 5],
            ['IdRolUsuario' => 2, 'IdCliente' => 2, 'IdRol' => 1, 'IdUsuario' => 6],
            ['IdRolUsuario' => 3, 'IdCliente' => 1, 'IdRol' => 2, 'IdUsuario' => 7],
        ]);
        $this->master->table('admin_usuarios')->insert([
            ['IdUsuario' => 5, 'SIdUsuario' => 'u5', 'SNombre' => 'Cinco', 'SMail' => 'c@x.mx'],
            ['IdUsuario' => 6, 'SIdUsuario' => 'u6', 'SNombre' => 'Seis', 'SMail' => 's@x.mx'],
            ['IdUsuario' => 7, 'SIdUsuario' => 'u7', 'SNombre' => 'Siete', 'SMail' => 'si@x.mx'],
        ]);
        $this->tenant->table('master_modulos_admin')->insert(['IdModulo' => 999, 'IdProducto' => 3, 'SNombre' => 'Viejo']);

        app(AdminTecnicaSync::class)->sincronizar(1);

        $this->assertSame(['10'], $this->tenant->table('master_modulos_admin')->pluck('IdModulo')->all());
        $this->assertSame(['100'], $this->tenant->table('master_opciones')->pluck('IdOpcion')->all());
        $this->assertSame(2, $this->tenant->table('admin_roles_modulos')->count());
        $this->assertSame(['5'], $this->tenant->table('admin_usuarios')->pluck('IdUsuario')->all());
        $this->assertSame(['1'], $this->tenant->table('admin_clientes_roles_usuarios')->pluck('IdRolUsuario')->all());
        $this->assertSame(['Uno'], $this->tenant->table('admin_clientes')->pluck('SNombre')->all());
    }

    /**
     * sqlite no tipa: todo como texto nullable.
     *
     * @param  array<string, list<string>>  $tablas
     */
    private function crearTablas(Connection $conexion, array $tablas): void
    {
        foreach ($tablas as $tabla => $columnas) {
            Schema::connection($conexion->getName())->create($tabla, function (Blueprint $t) use ($columnas) {
                foreach ($columnas as $columna) {
                    $t->string($columna)->nullable();
                }
            });
        }
    }
}
