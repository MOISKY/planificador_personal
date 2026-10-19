<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo de tipos de opinión para clasificar las reseñas.
 *
 * @property int $IdTipoOpinion
 * @property string $Nombre
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, ProduccionComentario> $comentarios
 */
class TipoOpinion extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_tipo_opinion';

    protected $primaryKey = 'IdTipoOpinion';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Comentarios / reseñas asociadas a este tipo de opinión.
     *
     * @return HasMany<ProduccionComentario, $this>
     */
    public function comentarios(): HasMany
    {
        return $this->hasMany(ProduccionComentario::class, 'IdTipoOpinion', 'IdTipoOpinion');
    }
}
