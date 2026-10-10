<?php

namespace App\Services;

use Closure;
use Illuminate\Database\Connection;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Espejea en la base del cliente los catálogos de admin_tecnica que usa este producto.
 * Cada tabla destino se reemplaza completa (delete + insert por chunks); son catálogos de cientos de filas.
 */
class AdminTecnicaSync
{
    private const CHUNK = 500;

    private const LOCK_SEGUNDOS = 120;

    /** @var array<string, list<string>> columnas que acepta cada tabla destino */
    public const COLUMNAS = [
        'admin_clientes' => ['IdCliente', 'SCodigoCliente', 'SNombre', 'URL_logo', 'EActivo', 'FechaHora'],
        'master_idioma' => ['IdIdioma', 'SCodigo', 'SDescripcion', 'EActivo', 'FechaHora'],
        'master_productos' =>
        ['IdProducto', 'SNombreProducto', 'SDescripcion', 'URL_imagen', 'URL_Icono', 'EActivo', 'EVisible'],
        'master_modulos_admin' => ['IdModulo', 'IdModuloPadre', 'IdProducto', 'SCodigo', 'SNombre', 'SDescripcion', 'URL_Icono', 'IdTag', 'ETipoModulo', 'EActivo', 'IOrdenamiento', 'FechaHora', 'URL_Modulo'],
        'master_opciones' =>
        ['IdOpcion', 'IdModulo', 'IdIdioma', 'ETipoOpcion', 'IdOpcionPadre', 'NombreForm_Programa', 'URL_Ruta', 'URL_icono', 'IOrdenamiento', 'SOpcion', 'IdTag', 'EVisible', 'EActivo', 'FechaHora'],
        'admin_usuarios' =>
        ['IdUsuario', 'SIdUsuario', 'SPassword', 'SNombre', 'SMail',
            'STelefono', 'EActivo', 'remember_token', 'FechaHora'],
        'admin_roles_modulos' =>
        ['IdModulo', 'IdRol', 'IdOpcion', 'Acceder', 'Insertar', 'Editar', 'Eliminar',
            'Exportar', 'Importar', 'Imprimir', 'FechaHora'],
        'admin_clientes_roles' =>
        ['IdRol', 'IdCliente', 'SCodigo', 'SDescripcion', 'ETipoUsuario', 'EActivo', 'FechaHora'],
        'admin_clientes_roles_usuarios' => ['IdRolUsuario', 'IdCliente', 'IdRol', 'IdUsuario', 'FechaHora'],
    ];

    private Connection $master;

    private Connection $tenant;

    private int $idCliente;

    private int $idProducto;

    public function __construct(private readonly TenantConnection $conexiones)
    {
    }

    /**
     * Sincroniza al cliente con un lock por cliente: dos logins simultáneos no se pisan.
     */
    public function sincronizar(int $idCliente): void
    {
        Cache::lock("sync:cliente:{$idCliente}", self::LOCK_SEGUNDOS)->block(10, function () use ($idCliente): void {
            $this->master = DB::connection($this->conexiones->master());
            $this->tenant = DB::connection($this->conexiones->usar($idCliente));
            $this->idCliente = $idCliente;
            $this->idProducto = config('noil.producto_id');

            $this->ejecutar();
        });
    }

    private function ejecutar(): void
    {
        $this->foreignKeyChecks(false);

        try {
            $this->tenant->transaction(function (): void {
                $modulos = $this->modulosDelProducto();
                $opciones = $this->master->table('master_opciones')->whereIn('IdModulo', $modulos)
                    ->where('EVisible', 'Cliente')->pluck('IdOpcion');
                $roles = $this->master->table('admin_roles_modulos')->whereIn('IdModulo', $modulos)
                    ->pluck('IdRol')->unique();
                $usuarios = $this->master->table('admin_clientes_roles_usuarios')->whereIn('IdRol', $roles)
                    ->where('IdCliente', $this->idCliente)->pluck('IdUsuario');

                $this->reemplazar('admin_clientes', $this->master->table('admin_clientes')
                    ->where('IdCliente', $this->idCliente)->get());
                $this->reemplazar('master_productos', $this->master->table('master_productos')
                    ->where('IdProducto', $this->idProducto)->get());
                $this->reemplazar('master_idioma', $this->master->table('master_idioma')->get());
                $this->reemplazar('admin_clientes_roles', $this->master->table('admin_clientes_roles')
                    ->whereIn('IdRol', $roles)->where('IdCliente', $this->idCliente)->get());
                $this->reemplazar('admin_usuarios', $this->master->table('admin_usuarios')
                    ->whereIn('IdUsuario', $usuarios)->get());
                $this->reemplazar('master_modulos_admin', $this->master->table('master_modulos')
                    ->where('IdProducto', $this->idProducto)->get());
                $this->reemplazar('master_opciones', $this->master->table('master_opciones')
                    ->whereIn('IdOpcion', $opciones)->get());
                $this->reemplazar(
                    'admin_roles_modulos',
                    $this->master->table('admin_roles_modulos')->whereIn('IdModulo', $modulos)
                        ->where(fn (Builder $q) => $q->whereIn('IdOpcion', $opciones)->orWhereNull('IdOpcion'))->get(),
                    fn (Builder $q) => $q->whereIn('IdModulo', $modulos),
                );
                $this->reemplazar('admin_clientes_roles_usuarios', $this->master->table('admin_clientes_roles_usuarios')
                    ->whereIn('IdRol', $roles)->where('IdCliente', $this->idCliente)->get());
            });

            Log::info("Sincronización admin_tecnica completa para cliente {$this->idCliente}");
        } finally {
            $this->foreignKeyChecks(true);
        }
    }

    /**
     * @return Collection<int, int>
     */
    private function modulosDelProducto(): Collection
    {
        return $this->master->table('master_modulos')->where('IdProducto', $this->idProducto)->pluck('IdModulo');
    }

    /**
     * @param  Collection<int, object>  $remotos
     * @param  Closure(Builder): void|null  $alcanceBorrado
     */
    private function reemplazar(string $destino, Collection $remotos, ?Closure $alcanceBorrado = null): void
    {
        $columnas = array_flip(self::COLUMNAS[$destino]);
        $filas = $remotos->map(fn (object $fila) => array_intersect_key((array) $fila, $columnas))->all();

        $borrado = $this->tenant->table($destino);
        if ($alcanceBorrado) {
            $alcanceBorrado($borrado);
        }
        $borrado->delete();

        foreach (array_chunk($filas, self::CHUNK) as $chunk) {
            $this->tenant->table($destino)->insert($chunk);
        }
    }

    private function foreignKeyChecks(bool $activo): void
    {
        if (in_array($this->tenant->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->tenant->statement('SET FOREIGN_KEY_CHECKS=' . ($activo ? 1 : 0));
        }
    }
}
