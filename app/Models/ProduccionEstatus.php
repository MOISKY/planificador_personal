<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kardex de estatus de una producción (viendo, por ver, visto).
 *
 * @property int $IdProduccionEstatus
 * @property int $IdProduccion
 * @property string $Estatus viendo|por ver|visto
 * @property CarbonInterface $FechaRegistro
 * @property-read Produccion $produccion
 */
class ProduccionEstatus extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const ESTATUS_POR_VER = 'por ver';

    public const ESTATUS_VIENDO = 'viendo';

    public const ESTATUS_VISTO = 'visto';

    public const TODOS_LOS_ESTATUS = [
        self::ESTATUS_POR_VER,
        self::ESTATUS_VIENDO,
        self::ESTATUS_VISTO,
    ];

    protected $table = 'cine_kardex_produccion_estatus';

    protected $primaryKey = 'IdProduccionEstatus';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProduccion',
        'Estatus',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProduccion' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Producción asociada a este registro de estatus.
     *
     * @return BelongsTo<Produccion, $this>
     */
    public function produccion(): BelongsTo
    {
        return $this->belongsTo(Produccion::class, 'IdProduccion', 'IdProduccion');
    }
}
