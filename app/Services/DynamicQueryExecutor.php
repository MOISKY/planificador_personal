<?php

namespace App\Services;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class DynamicQueryExecutor
{
    protected string $table = 'master_consultassql';

    /**
     * Ejecuta la consulta guardada en `master_consultassql` con ese `NombreConsulta`,
     * sustituyendo los `:param` por los valores dados.
     *
     * @param  array<string, mixed>  $parameters
     * @return array<int, object>
     */
    public function executeQueryByName(string $queryName, array $parameters = [], ?string $conexion = null): array
    {
        $db = $this->conexion($conexion);
        $sql = $this->prepararSql($db, $queryName, $parameters);

        try {
            return $db->select($sql);
        } catch (Throwable $e) {
            throw new RuntimeException("Error al ejecutar la consulta {$queryName}: ".$e->getMessage(), 0, $e);
        }
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array{data: array<int, object>, total: int, per_page: int, current_page: int, last_page: int}
     */
    public function executeQueryByNamePaginated(string $queryName, array $parameters = [], int $page = 1, int $perPage = 10, ?string $conexion = null): array
    {
        $db = $this->conexion($conexion);
        $sql = $this->prepararSql($db, $queryName, $parameters);
        $perPage = max($perPage, 1);
        $page = max($page, 1);

        try {
            $total = (int) ($db->select("SELECT COUNT(*) AS total FROM ({$sql}) AS count_query")[0]->total ?? 0);
            $offset = ($page - 1) * $perPage;
            $data = $db->select("{$sql} LIMIT {$perPage} OFFSET {$offset}");
        } catch (Throwable $e) {
            throw new RuntimeException("Error al ejecutar la consulta paginada {$queryName}: ".$e->getMessage(), 0, $e);
        }

        return [
            'data' => $data,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => (int) ceil($total / $perPage),
        ];
    }

    private function conexion(?string $nombre): Connection
    {
        $db = DB::connection($nombre ?? DB::getDefaultConnection());

        if ($db->getDriverName() === 'mysql') {
            $db->statement("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");
        }

        return $db;
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    private function prepararSql(Connection $db, string $queryName, array $parameters): string
    {
        $registro = $db->table($this->table)->where('NombreConsulta', $queryName)->first();

        if (! $registro) {
            throw new RuntimeException("Consulta no encontrada: {$queryName}");
        }

        $sql = rtrim(trim($registro->SQL), ';');

        foreach ($parameters as $key => $value) {
            $escapado = match (true) {
                $value === null => 'NULL',
                is_int($value), is_float($value) => (string) $value,
                is_bool($value) => $value ? '1' : '0',
                default => $db->getPdo()->quote((string) $value),
            };
            $sql = preg_replace('/:'.preg_quote((string) $key, '/').'\b/', $escapado, $sql);
        }

        return $sql;
    }
}
