<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Integrante de equipo en una actividad de proyecto.
 *
 * @property int $IdEquipo
 * @property int $IdActividad
 * @property int $IdPersona
 * @property CarbonInterface $FechaRegistro
 * @property-read ProyectoActividad $actividad
 * @property-read Persona $persona
 */
class GrupoActividadEquipo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_grupo_actividad_equipo';

    protected $primaryKey = 'IdEquipo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'IdPersona',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdActividad' => 'integer',
            'IdPersona' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ProyectoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'IdPersona', 'IdPersona');
    }
}

