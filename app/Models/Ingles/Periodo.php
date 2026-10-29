<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Periodo del módulo de Inglés.
 *
 * @property int $IdPeriodo
 * @property string $Nombre
 * @property CarbonInterface $FechaInicio
 * @property CarbonInterface $FechaFin
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Grupo> $grupos
 */
class Periodo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_periodo';

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
            'FechaInicio' => 'date',
            'FechaFin' => 'date',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * @return HasMany<Grupo, $this>
     */
    public function grupos(): HasMany
    {
        return $this->hasMany(Grupo::class, 'IdPeriodo', 'IdPeriodo');
    }
}

