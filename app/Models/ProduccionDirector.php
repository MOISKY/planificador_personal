<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabla intermedia que asocia producciones con directores.
 *
 * @property int $IdProduccionDirector
 * @property int $IdProduccion
 * @property int $IdDirector
 * @property CarbonInterface $FechaRegistro
 * @property-read Produccion $produccion
 * @property-read Director $director
 */
class ProduccionDirector extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_produccion_directores';

    protected $primaryKey = 'IdProduccionDirector';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProduccion',
        'IdDirector',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProduccion' => 'integer',
            'IdDirector' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Produccion, $this>
     */
    public function produccion(): BelongsTo
    {
        return $this->belongsTo(Produccion::class, 'IdProduccion', 'IdProduccion');
    }

    /**
     * @return BelongsTo<Director, $this>
     */
    public function director(): BelongsTo
    {
        return $this->belongsTo(Director::class, 'IdDirector', 'IdDirector');
    }
}
