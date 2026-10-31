<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de un Recurso de Actividad.
 *
 * @property int $IdAdminActividadRecursoEstatus
 * @property int $IdActividadRecurso
 * @property string $Estatus
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyectoActividadRecurso $recurso
 */
class AdminKardexProyectoActividadRecursoEstatus extends Model
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

    protected $table = 'admin_kardex_proyecto_actividad_recurso_estatus';

    protected $primaryKey = 'IdAdminActividadRecursoEstatus';

    protected $fillable = [
        'IdActividadRecurso',
        'Estatus',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdActividadRecurso' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function recurso(): BelongsTo
    {
        return $this->belongsTo(AdminProyectoActividadRecurso::class, 'IdActividadRecurso', 'IdActividadRecurso');
    }
}
