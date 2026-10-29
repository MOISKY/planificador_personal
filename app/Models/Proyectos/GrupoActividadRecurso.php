<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Recurso / Entrega de una Actividad de Proyecto.
 *
 * @property int $IdActividadRecurso
 * @property int $IdActividad
 * @property int|null $IdPersona
 * @property string $Nombre
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ProyectoActividad $actividad
 * @property-read Persona|null $persona
 * @property-read Collection<int, KardexProyectoActividadRecursoEstatus> $estatusKardex
 * @property-read KardexProyectoActividadRecursoEstatus|null $estatusActual
 */
class GrupoActividadRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_grupo_actividad_recurso';

    protected $primaryKey = 'IdActividadRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'IdPersona',
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
            'IdActividad' => 'integer',
            'IdPersona' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Al crear el recurso se genera automáticamente su estatus inicial en el Kardex.
     */
    protected static function booted(): void
    {
        static::created(function (GrupoActividadRecurso $recurso): void {
            if (! $recurso->estatusKardex()->exists()) {
                $recurso->estatusKardex()->create([
                    'Estatus' => KardexProyectoActividadRecursoEstatus::ESTATUS_NO_REALIZADO,
                ]);
            }
        });
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ProyectoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'IdPersona', 'IdPersona');
    }

    /**
     * Historial de estatus en Kardex.
     *
     * @return HasMany<KardexProyectoActividadRecursoEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(KardexProyectoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso');
    }

    /**
     * Último estatus registrado en el Kardex.
     *
     * @return HasOne<KardexProyectoActividadRecursoEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(KardexProyectoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso')
            ->latestOfMany('IdActividadRecursoEstatus');
    }
}

