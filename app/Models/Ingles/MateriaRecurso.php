<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Recurso perteneciente a una Materia.
 *
 * @property int $IdRecurso
 * @property int $IdMateria
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface $FechaRegistro
 * @property-read Materia $materia
 * @property-read Collection<int, MateriaRecursoAdicional> $recursosAdicionales
 */
class MateriaRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_materia_recurso';

    protected $primaryKey = 'IdRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdMateria',
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
            'IdMateria' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'IdMateria', 'IdMateria');
    }

    /**
     * Recursos adicionales del drawer.
     *
     * @return HasMany<MateriaRecursoAdicional, $this>
     */
    public function recursosAdicionales(): HasMany
    {
        return $this->hasMany(MateriaRecursoAdicional::class, 'IdRecurso', 'IdRecurso');
    }
}

