<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Proyecto administrativo.
 *
 * @property int $IdProyecto
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface|null $FechaInicio
 * @property string|null $Duracion
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, AdminProyectoPersonal> $miembros
 * @property-read Collection<int, AdminProyectoModulo> $modulos
 * @property-read Collection<int, AdminProyectoActividad> $actividades
 * @property-read Collection<int, AdminKardexProyectoEstatus> $estatusKardex
 * @property-read AdminKardexProyectoEstatus|null $estatusActual
 */
class AdminProyecto extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto';

    protected $primaryKey = 'IdProyecto';

    protected $fillable = [
        'Nombre',
        'Descripcion',
        'FechaInicio',
        'Duracion',
        'FechaRegistro',
    ];

    protected $casts = [
        'FechaInicio' => 'date:Y-m-d',
        'FechaRegistro' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (AdminProyecto $proyecto): void {
            if (! $proyecto->estatusKardex()->exists()) {
                $proyecto->estatusKardex()->create([
                    'Estatus' => AdminKardexProyectoEstatus::ESTATUS_PENDIENTE,
                ]);
            }
        });
    }

    public function estatusKardex(): HasMany
    {
        return $this->hasMany(AdminKardexProyectoEstatus::class, 'IdProyecto', 'IdProyecto')
            ->orderByDesc('IdAdminProyectoEstatus');
    }

    public function estatusActual(): HasOne
    {
        return $this->hasOne(AdminKardexProyectoEstatus::class, 'IdProyecto', 'IdProyecto')
            ->latestOfMany('IdAdminProyectoEstatus');
    }

    public function miembros(): HasMany
    {
        return $this->hasMany(AdminProyectoPersonal::class, 'IdProyecto', 'IdProyecto');
    }

    public function modulos(): HasMany
    {
        return $this->hasMany(AdminProyectoModulo::class, 'IdProyecto', 'IdProyecto');
    }

    public function actividades(): HasMany
    {
        return $this->hasMany(AdminProyectoActividad::class, 'IdProyecto', 'IdProyecto');
    }
}
