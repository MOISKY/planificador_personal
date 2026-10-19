<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Director de producciones cinematográficas.
 *
 * @property int $IdDirector
 * @property string $NombreDirector
 * @property CarbonInterface|null $Fecha_Nacimiento
 * @property string|null $Descripcion
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Produccion> $producciones
 */
class Director extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_directores';

    protected $primaryKey = 'IdDirector';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'NombreDirector',
        'Fecha_Nacimiento',
        'Descripcion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'Fecha_Nacimiento' => 'date',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Producciones dirigidas por este director.
     *
     * @return BelongsToMany<Produccion, $this>
     */
    public function producciones(): BelongsToMany
    {
        return $this->belongsToMany(
            Produccion::class,
            'cine_produccion_directores',
            'IdDirector',
            'IdProduccion',
            'IdDirector',
            'IdProduccion'
        )->withPivot('IdProduccionDirector', 'FechaRegistro');
    }
}
