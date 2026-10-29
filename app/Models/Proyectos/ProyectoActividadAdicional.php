<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Actividad Adicional para el Drawer de una Actividad de Proyecto.
 *
 * @property int $IdActividadAdicional
 * @property int $IdActividad
 * @property string $Descripcion
 * @property string $UrlRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ProyectoActividad $actividad
 */
class ProyectoActividadAdicional extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_proyecto_actividad_adicional';

    protected $primaryKey = 'IdActividadAdicional';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'Descripcion',
        'UrlRecurso',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdActividad' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ProyectoActividad::class, 'IdActividad', 'IdActividad');
    }
}

