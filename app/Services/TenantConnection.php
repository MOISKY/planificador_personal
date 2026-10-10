<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

/**
 * Único lugar que conoce las credenciales de la base de cada cliente.
 * La sesión guarda solo el IdCliente (clave `tenant_id`); todo lo demás sale de admin_clientes.
 */
class TenantConnection
{
    public const SESSION_KEY = 'tenant_id';

    private const CACHE_TTL = 600;

    public function master(): string
    {
        return config('noil.master_connection');
    }

    /**
     * Configura la conexión del cliente, la deja como default y devuelve su nombre.
     */
    public function usar(int $idCliente): string
    {
        $cliente = $this->cliente($idCliente);
        $nombre = "cliente_{$idCliente}";

        if (Config::get('database.default') === $nombre) {
            return $nombre;
        }

        if (! Config::has("database.connections.{$nombre}")) {
            Config::set("database.connections.{$nombre}", [
                ...Config::get("database.connections.{$this->master()}"),
                ...array_filter([
                    'host' => $cliente->DB_HOST,
                    'port' => $cliente->DB_PORT,
                    'database' => $cliente->DB_DATABASE,
                    'username' => $cliente->DB_USERNAME,
                    'password' => $cliente->DB_PASSWORD,
                ], fn ($valor) => $valor !== null && $valor !== ''),
            ]);
            DB::purge($nombre);
        }

        Config::set('database.default', $nombre);

        return $nombre;
    }

    public function cliente(int $idCliente): object
    {
        $cliente = Cache::remember(
            "tenant:cliente:{$idCliente}",
            self::CACHE_TTL,
            fn () => (array) DB::connection($this->master())
            ->table('admin_clientes')
            ->where('IdCliente', $idCliente)
                ->first()
        );

        abort_if($cliente === [], 404, 'El cliente seleccionado no existe.');

        return (object) $cliente;
    }

    /**
     * Clientes a los que el usuario tiene acceso según admin_clientes_roles_usuarios.
     *
     * @return Collection<int, object{IdCliente: int, SNombre: string, SCodigoCliente: ?string, URL_logo: ?string}>
     */
    public function clientesDe(int $idUsuario): Collection
    {
        return DB::connection($this->master())
            ->table('admin_clientes as c')
            ->join('admin_clientes_roles_usuarios as r', 'r.IdCliente', '=', 'c.IdCliente')
            ->where('r.IdUsuario', $idUsuario)
            ->select('c.IdCliente', 'c.SNombre', 'c.SCodigoCliente', 'c.URL_logo')
            ->distinct()
            ->orderBy('c.SNombre')
            ->get();
    }

    public function actual(): ?int
    {
        return session(self::SESSION_KEY);
    }

    public function seleccionar(int $idCliente): void
    {
        $this->usar($idCliente);
        session([self::SESSION_KEY => $idCliente]);
        if (config('noil.sincronizar')) {
            app(AdminTecnicaSync::class)->sincronizar($idCliente);
        }
    }
}
