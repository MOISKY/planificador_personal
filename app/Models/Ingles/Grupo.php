<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Grupo de Inglés (Opción Independiente).
 *
 * @property int $IdGrupo
 * @property string $Grupo
 * @property int $IdPeriodo
 * @property int $IdMateria
 * @property int $IdAsesor
 * @property CarbonInterface $FechaRegistro
 * @property-read Periodo $periodo
 * @property-read Materia $materia
 * @property-read Asesor $asesor
 * @property-read Collection<int, GrupoAlumno> $alumnos
 * @property-read Collection<int, GrupoActividad> $actividades
 */
class Grupo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_grupo';

    protected $primaryKey = 'IdGrupo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Grupo',
        'IdPeriodo',
        'IdMateria',
        'IdAsesor',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdPeriodo' => 'integer',
            'IdMateria' => 'integer',
            'IdAsesor' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'IdPeriodo', 'IdPeriodo');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'IdMateria', 'IdMateria');
    }

    public function asesor(): BelongsTo
    {
        return $this->belongsTo(Asesor::class, 'IdAsesor', 'IdAsesor');
    }

    /**
     * Alumnos inscritos en el grupo (Hijo 1).
     *
     * @return HasMany<GrupoAlumno, $this>
     */
    public function alumnos(): HasMany
    {
        return $this->hasMany(GrupoAlumno::class, 'IdGrupo', 'IdGrupo');
    }

    /**
     * Retos / Actividades del grupo (Hijo 2).
     *
     * @return HasMany<GrupoActividad, $this>
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(GrupoActividad::class, 'IdGrupo', 'IdGrupo');
    }
}

