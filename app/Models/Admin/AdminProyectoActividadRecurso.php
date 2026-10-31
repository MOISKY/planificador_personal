<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Recursos / Entregables del personal asignados a una Actividad.
 *
 * @property int $IdActividadRecurso
 * @property int $IdActividad
 * @property int|null $IdPersonal
 * @property string $Nombre
 * @property string|null $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyectoActividad $actividad
 * @property-read AdminPersonal|null $personal
 * @property-read Collection<int, AdminKardexProyectoActividadRecursoEstatus> $estatusKardex
 * @property-read AdminKardexProyectoActividadRecursoEstatus|null $estatusActual
 */
class AdminProyectoActividadRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto_actividad_recurso';

    protected $primaryKey = 'IdActividadRecurso';

    protected $fillable = [
        'IdActividad',
        'IdPersonal',
        'Nombre',
        'URLRecurso',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdActividad' => 'integer',
        'IdPersonal' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (AdminProyectoActividadRecurso $recurso): void {
            if (! $recurso->estatusKardex()->exists()) {
                $recurso->estatusKardex()->create([
                    'Estatus' => AdminKardexProyectoActividadRecursoEstatus::ESTATUS_NO_REALIZADA,
                ]);
            }
        });
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(AdminProyectoActividad::class, 'IdActividad', 'IdActividad');
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(AdminPersonal::class, 'IdPersonal', 'IdPersonal');
    }

    public function estatusKardex(): HasMany
    {
        return $this->hasMany(AdminKardexProyectoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso')
            ->orderByDesc('IdAdminActividadRecursoEstatus');
    }

    public function estatusActual(): HasOne
    {
        return $this->hasOne(AdminKardexProyectoActividadRecursoEstatus::class, 'IdActividadRecurso', 'IdActividadRecurso')
            ->latestOfMany('IdAdminActividadRecursoEstatus');
    }
}
