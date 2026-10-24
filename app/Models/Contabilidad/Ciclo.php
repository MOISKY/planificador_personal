<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Asignación de ciclos con Periodo, Oportunidad, Grupo y Asesor.
 *
 * @property int $IdCiclo
 * @property int $IdPeriodo
 * @property int $IdOportunidad
 * @property int $IdGrupo
 * @property int $IdAsesor
 * @property CarbonInterface $FechaRegistro
 * @property-read Periodo $periodo
 * @property-read Oportunidad $oportunidad
 * @property-read Grupo $grupo
 * @property-read Asesor $asesor
 */
class Ciclo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_ciclo';

    protected $primaryKey = 'IdCiclo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdPeriodo',
        'IdOportunidad',
        'IdGrupo',
        'IdAsesor',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdPeriodo' => 'integer',
            'IdOportunidad' => 'integer',
            'IdGrupo' => 'integer',
            'IdAsesor' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'IdPeriodo', 'IdPeriodo');
    }

    public function oportunidad(): BelongsTo
    {
        return $this->belongsTo(Oportunidad::class, 'IdOportunidad', 'IdOportunidad');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'IdGrupo', 'IdGrupo');
    }

    public function asesor(): BelongsTo
    {
        return $this->belongsTo(Asesor::class, 'IdAsesor', 'IdAsesor');
    }
}
