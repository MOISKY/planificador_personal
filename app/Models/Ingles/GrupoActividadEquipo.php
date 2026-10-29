<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Alumno asignado a equipo dentro de una Actividad.
 *
 * @property int $IdEquipo
 * @property int $IdActividad
 * @property int $IdAlumno
 * @property CarbonInterface $FechaRegistro
 * @property-read GrupoActividad $actividad
 * @property-read Alumno $alumno
 */
class GrupoActividadEquipo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_grupo_actividad_equipo';

    protected $primaryKey = 'IdEquipo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'IdAlumno',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdActividad' => 'integer',
            'IdAlumno' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(GrupoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'IdAlumno', 'IdAlumno');
    }
}

