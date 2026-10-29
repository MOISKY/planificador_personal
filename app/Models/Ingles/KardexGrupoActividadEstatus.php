<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de una actividad de grupo.
 *
 * @property int $IdActividadEstatus
 * @property int $IdActividad
 * @property string $Estatus No Realizado|En Proceso|Realizado
 * @property CarbonInterface $FechaRegistro
 * @property-read GrupoActividad $actividad
 */
class KardexGrupoActividadEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_NO_REALIZADO = 'No Realizado';

    public const ESTATUS_EN_PROCESO = 'En Proceso';

    public const ESTATUS_REALIZADO = 'Realizado';

    public const TODOS_LOS_ESTATUS = [
        self::ESTATUS_NO_REALIZADO,
        self::ESTATUS_EN_PROCESO,
        self::ESTATUS_REALIZADO,
    ];

    protected $table = 'ingles_kardex_grupo_actividad_estatus';

    protected $primaryKey = 'IdActividadEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'Estatus',
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
        return $this->belongsTo(GrupoActividad::class, 'IdActividad', 'IdActividad');
    }
}

