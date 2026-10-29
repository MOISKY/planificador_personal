<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Reto / Actividad de un Grupo (Hijo 2 de Grupo).
 *
 * @property int $IdActividad
 * @property int $IdGrupo
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface|null $FechaEntrega
 * @property string $Tipo Individual|Equipo|Grupo
 * @property CarbonInterface $FechaRegistro
 * @property-read Grupo $grupo
 * @property-read Collection<int, GrupoActividadAdicional> $actividadesAdicionales
 * @property-read Collection<int, GrupoActividadEquipo> $equipos
 * @property-read Collection<int, GrupoActividadRecurso> $recursos
 * @property-read Collection<int, KardexGrupoActividadEstatus> $estatusKardex
 * @property-read KardexGrupoActividadEstatus|null $estatusActual
 */
class GrupoActividad extends Model
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

    protected $table = 'ingles_grupo_actividad';

    protected $primaryKey = 'IdActividad';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdGrupo',
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
            'IdGrupo' => 'integer',
            'FechaEntrega' => 'datetime',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Al crear la actividad se genera automáticamente su estatus inicial en el Kardex.
     */
    protected static function booted(): void
    {
        static::created(function (GrupoActividad $actividad): void {
            if (! $actividad->estatusKardex()->exists()) {
                $actividad->estatusKardex()->create([
                    'Estatus' => KardexGrupoActividadEstatus::ESTATUS_NO_REALIZADO,
                ]);
            }
        });
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'IdGrupo', 'IdGrupo');
    }

    /**
     * Drawer de actividades adicionales (Mostrar, Agregar, Eliminar).
     *
     * @return HasMany<GrupoActividadAdicional, $this>
     */
    public function actividadesAdicionales(): HasMany
    {
        return $this->hasMany(GrupoActividadAdicional::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Equipos de alumnos para este reto.
     *
     * @return HasMany<GrupoActividadEquipo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(GrupoActividadEquipo::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Actividades o recursos de alumnos para este reto.
     *
     * @return HasMany<GrupoActividadRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(GrupoActividadRecurso::class, 'IdActividad', 'IdActividad');
    }

    /**
     * Kardex de estatus de la actividad.
     *
     * @return HasMany<KardexGrupoActividadEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(KardexGrupoActividadEstatus::class, 'IdActividad', 'IdActividad')
            ->orderBy('FechaRegistro', 'desc');
    }

    /**
     * Estatus actual (último registro en kardex).
     *
     * @return HasOne<KardexGrupoActividadEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(KardexGrupoActividadEstatus::class, 'IdActividad', 'IdActividad')
            ->latestOfMany('FechaRegistro');
    }
}

