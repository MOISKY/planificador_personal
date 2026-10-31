<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de un Proyecto.
 *
 * @property int $IdAdminProyectoEstatus
 * @property int $IdProyecto
 * @property string $Estatus
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyecto $proyecto
 */
class AdminKardexProyectoEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_PENDIENTE = 'Pendiente';

    public const ESTATUS_EN_EMISION = 'En Emision';

    public const ESTATUS_FINALIZADO = 'Finalizado';

    public const ESTATUS_CANCELADO = 'Cancelado';

    public const ESTATUS_PAUSADO = 'Pausado';

    public const ESTATUSES = [
        self::ESTATUS_PENDIENTE,
        self::ESTATUS_EN_EMISION,
        self::ESTATUS_FINALIZADO,
        self::ESTATUS_CANCELADO,
        self::ESTATUS_PAUSADO,
    ];

    protected $table = 'admin_kardex_proyecto_estatus';

    protected $primaryKey = 'IdAdminProyectoEstatus';

    protected $fillable = [
        'IdProyecto',
        'Estatus',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdProyecto' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(AdminProyecto::class, 'IdProyecto', 'IdProyecto');
    }
}
