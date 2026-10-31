<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de una Actividad de Proyecto.
 *
 * @property int $IdAdminActividadEstatus
 * @property int $IdActividad
 * @property string $Estatus
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyectoActividad $actividad
 */
class AdminKardexProyectoActividadEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_NO_REALIZADA = 'No Realizada';

    public const ESTATUS_EN_PROCESO = 'En Proceso';

    public const ESTATUS_REALIZADA = 'Realizada';

    public const ESTATUSES = [
        self::ESTATUS_NO_REALIZADA,
        self::ESTATUS_EN_PROCESO,
        self::ESTATUS_REALIZADA,
    ];

    protected $table = 'admin_kardex_proyecto_actividad_estatus';

    protected $primaryKey = 'IdAdminActividadEstatus';

    protected $fillable = [
        'IdActividad',
        'Estatus',
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
