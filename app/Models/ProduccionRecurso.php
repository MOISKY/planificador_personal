<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recurso o enlace multimedia de una producción.
 *
 * @property int $IdProduccionRecurso
 * @property int $IdProduccion
 * @property string $Tipo ver|video|sitio|imagen|documento
 * @property string $URL_produccion_recurso
 * @property CarbonInterface $FechaRegistro
 * @property-read Produccion $produccion
 */
class ProduccionRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const TIPOS = [
        'ver',
        'video',
        'sitio',
        'imagen',
        'documento',
    ];

    protected $table = 'cine_produccion_recurso';

    protected $primaryKey = 'IdProduccionRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProduccion',
        'Tipo',
        'URL_produccion_recurso',
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
     * Producción propietaria de este recurso.
     *
     * @return BelongsTo<Produccion, $this>
     */
    public function produccion(): BelongsTo
    {
        return $this->belongsTo(Produccion::class, 'IdProduccion', 'IdProduccion');
    }
}
