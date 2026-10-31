<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Miembros del Personal asignados al Equipo de una Actividad.
 *
 * @property int $IdEquipo
 * @property int $IdActividad
 * @property int $IdPersonal
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyectoActividad $actividad
 * @property-read AdminPersonal $personal
 */
class AdminProyectoActividadEquipo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto_actividad_equipo';

    protected $primaryKey = 'IdEquipo';

    protected $fillable = [
        'IdActividad',
        'IdPersonal',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdActividad' => 'integer',
        'IdPersonal' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(AdminProyectoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(AdminPersonal::class, 'IdPersonal', 'IdPersonal');
    }
}
