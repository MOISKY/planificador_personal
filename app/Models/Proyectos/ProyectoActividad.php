<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Actividad de un Proyecto.
 *
 * @property int $IdActividad
 * @property int $IdProyecto
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface|null $FechaEntrega
 * @property string $Tipo Individual|Equipo|Grupo
 * @property CarbonInterface $FechaRegistro
 * @property-read Proyecto $proyecto
 * @property-read Collection<int, ProyectoActividadAdicional> $actividadesAdicionales
 * @property-read Collection<int, GrupoActividadEquipo> $equipos
 * @property-read Collection<int, GrupoActividadRecurso> $recursos
 * @property-read Collection<int, KardexProyectoActividadEstatus> $estatusKardex
 * @property-read KardexProyectoActividadEstatus|null $estatusActual
 */
class ProyectoActividad extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const TIPO_INDIVIDUAL = 'Individual';

    public const TIPO_EQUIPO = 'Equipo';

    public const TIPO_GRUPO = 'Grupo';

    public const TIPOS = [
        self::TIPO_INDIVIDUAL,
        self::TIPO_EQUIPO,
        self::TIPO_GRUPO,
    ];

    protected $table = 'proyectos_proyecto_actividad';

    protected $primaryKey = 'IdActividad';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProyecto',
        'Nombre',
        'Descripcion',
        'FechaEntrega',
        'Tipo',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProyecto' => 'integer',
            'FechaEntrega' => 'datetime',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Al crear la actividad se genera automáticamente su estatus inicial en el Kardex.
     */
    protected static function booted(): void
    {
        static::created(function (ProyectoActividad $actividad): void {
            if (! $actividad->estatusKardex()->exists()) {
                $actividad->estatusKardex()->create([
                    'Estatus' => KardexProyectoActividadEstatus::ESTATUS_NO_REALIZADO,
                ]);
            }
        });
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'IdProyecto', 'IdProyecto');
    }

    /**
     * Drawer de actividades adicionales (Mostrar, Agregar, Eliminar).
     *
     * @return HasMany<ProyectoActividadAdicional, $this>
     */
    public function actividadesAdicionales(): HasMany
    {
        return $this->hasMany(ProyectoActividadAdicional::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Integrantes del equipo de la actividad.
     *
     * @return HasMany<GrupoActividadEquipo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(GrupoActividadEquipo::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Recursos entregados o asignados a la actividad.
     *
     * @return HasMany<GrupoActividadRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(GrupoActividadRecurso::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Historial de estatus en Kardex.
     *
     * @return HasMany<KardexProyectoActividadEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(KardexProyectoActividadEstatus::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Último estatus registrado en el Kardex.
     *
     * @return HasOne<KardexProyectoActividadEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(KardexProyectoActividadEstatus::class, 'IdActividad', 'IdActividad')
            ->latestOfMany('IdActividadEstatus');
    }
}

