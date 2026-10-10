<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class MaximoId
{
    /**
     * Siguiente ID (MAX+1) de una tabla, acotado por `sContrato` cuando se indica.
     */
    public function getIdMaximo(string $contrato, string $nombreTabla, string $campoId, int $minimo = 1, ?string $conexion = null): int
    {
        $tabla = $this->identificador($nombreTabla, 'nombre de tabla');
        $campo = $this->identificador($campoId, 'nombre de campo');
        $db = DB::connection($conexion ?? DB::getDefaultConnection());

        $max = $contrato === ''
            ? $db->select("SELECT MAX({$campo}) AS IdMax FROM {$tabla}")
            : $db->select("SELECT MAX({$campo}) AS IdMax FROM {$tabla} WHERE sContrato = ?", [$contrato]);

        $ultimoId = $max[0]->IdMax ?? null;

        if ($ultimoId === null) {
            return $minimo;
        }

        return max((int) $ultimoId + 1, $minimo);
    }

    private function identificador(string $valor, string $tipo): string
    {
        if (! preg_match('/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/', $valor)) {
            throw new InvalidArgumentException("El {$tipo} contiene caracteres no permitidos: {$valor}");
        }

        return "`{$valor}`";
    }
}
