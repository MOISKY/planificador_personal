<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lección perteneciente a un Módulo.
 *
 * @property int $IdLeccion
 * @property int $IdModulo
 * @property string $Nombre
 * @property string|null $UrlLeccion
 * @property CarbonInterface $FechaRegistro
 * @property-read Modulo $modulo
 * @property-read Collection<int, ModuloLeccionRecurso> $recursos
 */
class ModuloLeccion extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_leccion';

    protected $primaryKey = 'IdLeccion';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdModulo',
        'Nombre',
        'UrlLeccion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdModulo' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'IdModulo', 'IdModulo');
    }

    /**
     * Recursos / materiales asociados a esta lección.
     *
     * @return HasMany<ModuloLeccionRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(ModuloLeccionRecurso::class, 'IdLeccion', 'IdLeccion');
    }
}
