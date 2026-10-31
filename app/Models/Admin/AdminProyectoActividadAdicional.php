<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Actividad Adicional de una Actividad de Proyecto.
 *
 * @property int $IdActividadAdicional
 * @property int $IdActividad
 * @property string|null $Descripcion
 * @property string|null $UrlRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyectoActividad $actividad
 */
class AdminProyectoActividadAdicional extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto_actividad_adicional';

    protected $primaryKey = 'IdActividadAdicional';

    protected $fillable = [
        'IdActividad',
        'Descripcion',
        'UrlRecurso',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdActividad' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(AdminProyectoActividad::class, 'IdActividad', 'IdActividad');
    }
}
