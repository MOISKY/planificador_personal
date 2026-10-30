<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de un Proyecto.
 *
 * @property int $IdProyectoEstatus
 * @property int $IdProyecto
 * @property string $Estatus Pendiente|En Emision|Finalizado|Cancelado|Pausado
 * @property CarbonInterface $FechaRegistro
 * @property-read Proyecto $proyecto
 */
class KardexProyectoEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_PENDIENTE = 'Pendiente';

    public const ESTATUS_EN_EMISION = 'En Emision';

    public const ESTATUS_FINALIZADO = 'Finalizado';

    public const ESTATUS_CANCELADO = 'Cancelado';

    public const ESTATUS_PAUSADO = 'Pausado';

    public const TODOS_LOS_ESTATUS = [
        self::ESTATUS_PENDIENTE,
        self::ESTATUS_EN_EMISION,
        self::ESTATUS_FINALIZADO,
        self::ESTATUS_CANCELADO,
        self::ESTATUS_PAUSADO,
    ];

    protected $table = 'proyectos_kardex_proyecto_estatus';

    protected $primaryKey = 'IdProyectoEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProyecto',
        'Estatus',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProyecto' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'IdProyecto', 'IdProyecto');
    }
}
