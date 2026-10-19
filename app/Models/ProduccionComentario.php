<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Reseña, crítica o comentario de una producción.
 *
 * @property int $IdProduccionComentario
 * @property int $IdProduccion
 * @property int|null $IdTipoOpinion
 * @property string $titulo
 * @property string $comentario
 * @property int|null $calificacion
 * @property CarbonInterface $FechaRegistro
 * @property-read Produccion $produccion
 * @property-read TipoOpinion|null $tipoOpinion
 */
class ProduccionComentario extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_produccion_comentario';

    protected $primaryKey = 'IdProduccionComentario';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProduccion',
        'IdTipoOpinion',
        'titulo',
        'comentario',
        'calificacion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProduccion' => 'integer',
            'IdTipoOpinion' => 'integer',
            'calificacion' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Producción comentada.
     *
     * @return BelongsTo<Produccion, $this>
     */
    public function produccion(): BelongsTo
    {
        return $this->belongsTo(Produccion::class, 'IdProduccion', 'IdProduccion');
    }

    /**
     * Clasificación o tipo de opinión asignada.
     *
     * @return BelongsTo<TipoOpinion, $this>
     */
    public function tipoOpinion(): BelongsTo
    {
        return $this->belongsTo(TipoOpinion::class, 'IdTipoOpinion', 'IdTipoOpinion');
    }
}
