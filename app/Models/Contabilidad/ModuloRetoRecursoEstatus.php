<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de un recurso de reto (No Realizado, En Proceso, Realizado).
 *
 * @property int $IdRetoRecursoEstatus
 * @property int $IdRetoRecurso
 * @property string $Estatus No Realizado|En Proceso|Realizado
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloRetoRecurso $recurso
 */
class ModuloRetoRecursoEstatus extends Model
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

    protected $table = 'contabilidad_kardex_modulo_reto_recurso_estatus';

    protected $primaryKey = 'IdRetoRecursoEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdRetoRecurso',
        'Estatus',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdRetoRecurso' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Recurso de reto asociado a este registro de estatus.
     *
     * @return BelongsTo<ModuloRetoRecurso, $this>
     */
    public function recurso(): BelongsTo
    {
        return $this->belongsTo(ModuloRetoRecurso::class, 'IdRetoRecurso', 'IdRetoRecurso');
    }
}
