<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Alumno del módulo de Inglés.
 *
 * @property int $IdAlumno
 * @property string $Nombre
 * @property string $ApellidoPaterno
 * @property string|null $ApellidoMaterno
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, GrupoAlumno> $grupos
 */
class Alumno extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_alumno';

    protected $primaryKey = 'IdAlumno';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'ApellidoPaterno',
        'ApellidoMaterno',
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

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->Nombre} {$this->ApellidoPaterno} {$this->ApellidoMaterno}");
    }

    /**
     * @return HasMany<GrupoAlumno, $this>
     */
    public function grupos(): HasMany
    {
        return $this->hasMany(GrupoAlumno::class, 'IdAlumno', 'IdAlumno');
    }
}

