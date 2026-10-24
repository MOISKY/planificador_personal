<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo de grupos escolares.
 *
 * @property int $IdGrupo
 * @property string $Grupo
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Ciclo> $ciclos
 */
class Grupo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_grupo';

    protected $primaryKey = 'IdGrupo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Grupo',
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
     * Ciclos asociados a este grupo.
     *
     * @return HasMany<Ciclo, $this>
     */
    public function ciclos(): HasMany
    {
        return $this->hasMany(Ciclo::class, 'IdGrupo', 'IdGrupo');
    }
}
