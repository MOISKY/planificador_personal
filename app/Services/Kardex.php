<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class Kardex
{
    public const CONSULTA = 'insert_kardex_sistema';

    public function __construct(private DynamicQueryExecutor $consultas) {}

    /**
     * Registra un movimiento en la bitácora del sistema con el usuario y contrato en sesión.
     */
    public function registrar(string $descripcion, string $origen, ?string $conexion = null): void
    {
        $ahora = now();

        $this->consultas->executeQueryByName(self::CONSULTA, [
            'Contrato' => Session::get('sContrato'),
            'Usuario' => Auth::id(),
            'Fecha' => $ahora->toDateString(),
            'Hora' => $ahora->format('H:i:s'),
            'Descripcion' => $descripcion,
            'Origen' => $origen,
        ], $conexion);
    }
}
