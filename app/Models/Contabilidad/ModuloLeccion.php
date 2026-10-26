<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
 * @property-read Collection<int, ModuloLeccionEstatus> $estatusKardex
 * @property-read ModuloLeccionEstatus|null $estatusActual
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

    /**
     * Registro automático de estatus inicial 'No leido' al dar de alta una lección.
     */
    protected static function booted(): void
    {
        static::created(function (ModuloLeccion $leccion): void {
            if (! $leccion->estatusKardex()->exists()) {
                $leccion->estatusKardex()->create([
                    'Estatus' => ModuloLeccionEstatus::ESTATUS_NO_LEIDO,
                ]);
            }
        });
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

    /**
     * Historial completo de estatus (kardex) de la lección.
     *
     * @return HasMany<ModuloLeccionEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(ModuloLeccionEstatus::class, 'IdLeccion', 'IdLeccion')
            ->orderBy('FechaRegistro', 'desc');
    }

    /**
     * Último estatus registrado de la lección.
     *
     * @return HasOne<ModuloLeccionEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(ModuloLeccionEstatus::class, 'IdLeccion', 'IdLeccion')
            ->latestOfMany('FechaRegistro');
    }
}
