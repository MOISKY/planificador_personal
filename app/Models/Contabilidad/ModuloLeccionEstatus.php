<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de una lección (No leido, Leyendo, Leido).
 *
 * @property int $IdLeccionEstatus
 * @property int $IdLeccion
 * @property string $Estatus No leido|Leyendo|Leido
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloLeccion $leccion
 */
class ModuloLeccionEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_NO_LEIDO = 'No leido';

    public const ESTATUS_LEYENDO = 'Leyendo';

    public const ESTATUS_LEIDO = 'Leido';

    public const TODOS_LOS_ESTATUS = [
        self::ESTATUS_NO_LEIDO,
        self::ESTATUS_LEYENDO,
        self::ESTATUS_LEIDO,
    ];

    protected $table = 'contabilidad_kardex_modulo_leccion_estatus';

    protected $primaryKey = 'IdLeccionEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdLeccion',
        'Estatus',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdLeccion' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Lección asociada a este registro de estatus.
     *
     * @return BelongsTo<ModuloLeccion, $this>
     */
    public function leccion(): BelongsTo
    {
        return $this->belongsTo(ModuloLeccion::class, 'IdLeccion', 'IdLeccion');
    }
}
