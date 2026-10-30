<?php

namespace App\Models\Desarrollo;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Especialidad del módulo de Desarrollo.
 *
 * @property int $IdEspecialidad
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Candidato> $candidatos
 */
class Especialidad extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_especialidad';

    protected $primaryKey = 'IdEspecialidad';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'Descripcion',
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
     * @return HasMany<Candidato, $this>
     */
    public function candidatos(): HasMany
    {
        return $this->hasMany(Candidato::class, 'IdEspecialidad', 'IdEspecialidad');
    }
}
