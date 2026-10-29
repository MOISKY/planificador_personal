<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Rol de persona en Proyectos.
 *
 * @property int $IdRol
 * @property string $Rol
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, GrupoPersona> $gruposPersona
 */
class Rol extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_rol';

    protected $primaryKey = 'IdRol';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Rol',
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
     * @return HasMany<GrupoPersona, $this>
     */
    public function gruposPersona(): HasMany
    {
        return $this->hasMany(GrupoPersona::class, 'IdRol', 'IdRol');
    }
}

