<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Recursos de apoyo dentro de un Reto.
 *
 * @property int $IdRetoRecurso
 * @property int $IdReto
 * @property int|null $IdModuloDetalle
 * @property string $Nombre
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloReto $reto
 * @property-read Collection<int, ModuloRetoRecursoEstatus> $estatusKardex
 * @property-read ModuloRetoRecursoEstatus|null $estatusActual
 */
class ModuloRetoRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_reto_recurso';

    protected $primaryKey = 'IdRetoRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdReto',
        'IdModuloDetalle',
        'Nombre',
        'URLRecurso',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdReto' => 'integer',
            'IdModuloDetalle' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Registro automático de estatus inicial 'No Realizado' al dar de alta un recurso de reto.
     */
    protected static function booted(): void
    {
        static::created(function (ModuloRetoRecurso $recurso): void {
            if (! $recurso->estatusKardex()->exists()) {
                $recurso->estatusKardex()->create([
                    'Estatus' => ModuloRetoRecursoEstatus::ESTATUS_NO_REALIZADO,
                ]);
            }
        });
    }

    public function reto(): BelongsTo
    {
        return $this->belongsTo(ModuloReto::class, 'IdReto', 'IdReto');
    }

    /**
     * Historial completo de estatus (kardex) del recurso de reto.
     *
     * @return HasMany<ModuloRetoRecursoEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(ModuloRetoRecursoEstatus::class, 'IdRetoRecurso', 'IdRetoRecurso')
            ->orderBy('FechaRegistro', 'desc');
    }

    /**
     * Último estatus registrado del recurso de reto.
     *
     * @return HasOne<ModuloRetoRecursoEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(ModuloRetoRecursoEstatus::class, 'IdRetoRecurso', 'IdRetoRecurso')
            ->latestOfMany('FechaRegistro');
    }
}
