<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo de oportunidades (1ra, 2da, Extraordinario).
 *
 * @property int $IdOportunidad
 * @property string $Nombre
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Ciclo> $ciclos
 */
class Oportunidad extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_oportunidades';

    protected $primaryKey = 'IdOportunidad';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Ciclos en los que se utiliza esta oportunidad.
     *
     * @return HasMany<Ciclo, $this>
     */
    public function ciclos(): HasMany
    {
        return $this->hasMany(Ciclo::class, 'IdOportunidad', 'IdOportunidad');
    }
}
