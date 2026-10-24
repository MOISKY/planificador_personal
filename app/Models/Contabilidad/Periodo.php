<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Periodos escolares o de evaluación.
 *
 * @property int $IdPeriodo
 * @property string $Nombre
 * @property CarbonInterface $FechaInicio
 * @property CarbonInterface $FechaFin
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Ciclo> $ciclos
 */
class Periodo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_periodo';

    protected $primaryKey = 'IdPeriodo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'FechaInicio',
        'FechaFin',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaInicio' => 'date:Y-m-d',
            'FechaFin' => 'date:Y-m-d',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Ciclos asociados a este periodo.
     *
     * @return HasMany<Ciclo, $this>
     */
    public function ciclos(): HasMany
    {
        return $this->hasMany(Ciclo::class, 'IdPeriodo', 'IdPeriodo');
    }
}
