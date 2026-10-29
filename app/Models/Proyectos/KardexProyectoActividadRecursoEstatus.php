<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de un recurso de actividad de proyecto.
 *
 * @property int $IdActividadRecursoEstatus
 * @property int $IdActividadRecurso
 * @property string $Estatus No Realizado|En Proceso|Realizado
 * @property CarbonInterface $FechaRegistro
 * @property-read GrupoActividadRecurso $recurso
 */
class KardexProyectoActividadRecursoEstatus extends Model
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

    protected $table = 'proyectos_kardex_proyecto_actividad_recurso_estatus';

    protected $primaryKey = 'IdActividadRecursoEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividadRecurso',
        'Estatus',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdActividadRecurso' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function recurso(): BelongsTo
    {
        return $this->belongsTo(GrupoActividadRecurso::class, 'IdActividadRecurso', 'IdActividadRecurso');
    }
}

