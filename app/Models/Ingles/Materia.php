<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Materia del módulo de Inglés.
 *
 * @property int $IdMateria
 * @property string $Nombre
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, MateriaRecurso> $recursos
 * @property-read Collection<int, Grupo> $grupos
 */
class Materia extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_materia';

    protected $primaryKey = 'IdMateria';

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
     * Recursos asignados a la materia (opción hija).
     *
     * @return HasMany<MateriaRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(MateriaRecurso::class, 'IdMateria', 'IdMateria');
    }

    /**
     * @return HasMany<Grupo, $this>
     */
    public function grupos(): HasMany
    {
        return $this->hasMany(Grupo::class, 'IdMateria', 'IdMateria');
    }
}

