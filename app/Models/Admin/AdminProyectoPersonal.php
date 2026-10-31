<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Miembros del Personal asignados a un Proyecto.
 *
 * @property int $IdProyectoPersonal
 * @property int $IdProyecto
 * @property int $IdPersonal
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyecto $proyecto
 * @property-read AdminPersonal $personal
 */
class AdminProyectoPersonal extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto_personal';

    protected $primaryKey = 'IdProyectoPersonal';

    protected $fillable = [
        'IdProyecto',
        'IdPersonal',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdProyecto' => 'integer',
        'IdPersonal' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(AdminProyecto::class, 'IdProyecto', 'IdProyecto');
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(AdminPersonal::class, 'IdPersonal', 'IdPersonal');
    }
}
