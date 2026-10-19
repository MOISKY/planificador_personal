<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bitácora o kardex de seguimiento de visualización de una producción.
 *
 * @property int $IdProduccionSeguimiento
 * @property int $IdProduccion
 * @property CarbonInterface $Fecha
 * @property string $Hora
 * @property string $Descripcion
 * @property CarbonInterface $FechaRegistro
 * @property-read Produccion $produccion
 */
class ProduccionSeguimiento extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_kardex_produccion_seguimiento';

    protected $primaryKey = 'IdProduccionSeguimiento';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProduccion',
        'Fecha',
        'Hora',
        'Descripcion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProduccion' => 'integer',
            'Fecha' => 'date',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Producción asociada a este evento de seguimiento.
     *
     * @return BelongsTo<Produccion, $this>
     */
    public function produccion(): BelongsTo
    {
        return $this->belongsTo(Produccion::class, 'IdProduccion', 'IdProduccion');
    }
}
