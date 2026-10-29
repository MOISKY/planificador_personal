<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Recursos o entregas de Alumnos en una Actividad (Retos CRUD).
 *
 * @property int $IdActividadRecurso
 * @property int $IdActividad
 * @property string $Nombre
 * @property int|null $IdAlumno
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read GrupoActividad $actividad
 * @property-read Alumno|null $alumno
 * @property-read Collection<int, KardexGrupoActividadRecursoEstatus> $estatusKardex
 * @property-read KardexGrupoActividadRecursoEstatus|null $estatusActual
 */
class GrupoActividadRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_grupo_actividad_recurso';

    protected $primaryKey = 'IdActividadRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'Nombre',
        'IdAlumno',
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
            'IdAlumno' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Al dar de alta el recurso se genera automáticamente el estatus inicial en su Kardex.
     */
    protected static function booted(): void
    {
        static::created(function (GrupoActividadRecurso $recurso): void {
            if (! $recurso->estatusKardex()->exists()) {
                $recurso->estatusKardex()->create([
                    'Estatus' => KardexGrupoActividadRecursoEstatus::ESTATUS_NO_REALIZADO,
                ]);
            }
        });
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(GrupoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'IdAlumno', 'IdAlumno');
    }

    /**
     * Kardex de estatus del recurso de actividad.
     *
     * @return HasMany<KardexGrupoActividadRecursoEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(KardexGrupoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso')
            ->orderBy('FechaRegistro', 'desc');
    }

    /**
     * Estatus actual (último registro en kardex).
     *
     * @return HasOne<KardexGrupoActividadRecursoEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(KardexGrupoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso')
            ->latestOfMany('FechaRegistro');
    }
}

