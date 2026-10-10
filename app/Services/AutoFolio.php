<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class AutoFolio
{
    /**
     * Siguiente folio según la configuración de `master_cnf_folios` para la tabla dada.
     * Con `$idDepartamento` usa la configuración del departamento y respeta `TipoReinicio` mensual.
     */
    public function generar(string $nombreTabla, ?int $idDepartamento = null, string $campoFolio = '', ?string $conexion = null): string
    {
        $db = DB::connection($conexion ?? DB::getDefaultConnection());
        $clave = $idDepartamento === null ? $nombreTabla : "{$nombreTabla}:{$idDepartamento}";

        $cnf = Cache::remember("folio_cnf:{$db->getName()}:{$clave}", 600, fn () => $db->table('master_cnf_folios')
            ->where('Tabla', $nombreTabla)
            ->when($idDepartamento !== null, fn ($q) => $q->where('IdDepartamento', $idDepartamento))
            ->where('Aplicar', 'Si')
            ->first());

        if (! $cnf) {
            throw new RuntimeException("No hay configuración de folio para {$nombreTabla}.");
        }

        $tabla = $this->identificador($cnf->Tabla);
        $campo = $this->identificador($campoFolio !== '' ? $campoFolio : $cnf->Campo);
        $complemento = (string) ($cnf->Complemento ?? '');
        $prefijo = ($cnf->TipoReinicio ?? null) === 'Mensual'
            ? $cnf->Prefijo.date('Ym')
            : (string) $cnf->Prefijo;

        $ultimo = $db->select(
            "SELECT MAX({$campo}) AS ultimo_folio FROM {$tabla} WHERE {$campo} LIKE ?",
            [$prefijo.'%'.$complemento],
        )[0]->ultimo_folio ?? null;

        if ($ultimo === null || $ultimo === '') {
            $siguiente = (int) $cnf->IniciarEn;
        } else {
            $numero = substr((string) $ultimo, strlen($prefijo));
            if ($complemento !== '') {
                $numero = str_replace($complemento, '', $numero);
            }
            $siguiente = (int) preg_replace('/\D/', '', $numero) + (int) $cnf->N_Salto;
        }

        return $prefijo.sprintf("%0{$cnf->NumDig}d", $siguiente).$complemento;
    }

    private function identificador(string $valor): string
    {
        if (! preg_match('/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/', $valor)) {
            throw new InvalidArgumentException("Identificador no permitido: {$valor}");
        }

        return "`{$valor}`";
    }
}
