<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Actividad de un Proyecto Administrativo.
 *
 * @property int $IdActividad
 * @property int $IdProyecto
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface|null $FechaEntrega
 * @property int|null $IdModulo
 * @property string $Tipo Individual|Equipo|Todos
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyecto $proyecto
 * @property-read AdminModulo|null $modulo
 * @property-read Collection<int, AdminProyectoActividadAdicional> $actividadesAdicionales
 * @property-read Collection<int, AdminProyectoActividadEquipo> $equipos
 * @property-read Collection<int, AdminProyectoActividadRecurso> $recursos
 * @property-read Collection<int, AdminKardexProyectoActividadEstatus> $estatusKardex
 * @property-read AdminKardexProyectoActividadEstatus|null $estatusActual
 */
class AdminProyectoActividad extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    public const TIPO_INDIVIDUAL = 'Individual';

    public const TIPO_EQUIPO = 'Equipo';

    public const TIPO_TODOS = 'Todos';

    public const TIPOS = [
        self::TIPO_INDIVIDUAL,
        self::TIPO_EQUIPO,
        self::TIPO_TODOS,
    ];

    protected $table = 'admin_proyecto_actividad';

    protected $primaryKey = 'IdActividad';

    protected $fillable = [
        'IdProyecto',
        'Nombre',
        'Descripcion',
        'FechaEntrega',
        'IdModulo',
        'Tipo',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdProyecto' => 'integer',
        'IdModulo' => 'integer',
        'FechaEntrega' => 'datetime',
        'FechaRegistro' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (AdminProyectoActividad $actividad): void {
            if (! $actividad->estatusKardex()->exists()) {
                $actividad->estatusKardex()->create([
                    'Estatus' => AdminKardexProyectoActividadEstatus::ESTATUS_NO_REALIZADA,
                ]);
            }
        });
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(AdminProyecto::class, 'IdProyecto', 'IdProyecto');
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(AdminModulo::class, 'IdModulo', 'IdModulo');
    }

    public function actividadesAdicionales(): HasMany
    {
        return $this->hasMany(AdminProyectoActividadAdicional::class, 'IdActividad', 'IdActividad');
    }

    public function equipos(): HasMany
    {
        return $this->hasMany(AdminProyectoActividadEquipo::class, 'IdActividad', 'IdActividad');
    }

    public function recursos(): HasMany
    {
        return $this->hasMany(AdminProyectoActividadRecurso::class, 'IdActividad', 'IdActividad');
    }

    public function estatusKardex(): HasMany
    {
        return $this->hasMany(AdminKardexProyectoActividadEstatus::class, 'IdActividad', 'IdActividad')
            ->orderByDesc('IdAdminActividadEstatus');
    }

    public function estatusActual(): HasOne
    {
        return $this->hasOne(AdminKardexProyectoActividadEstatus::class, 'IdActividad', 'IdActividad')
            ->latestOfMany('IdAdminActividadEstatus');
    }
}
