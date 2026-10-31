<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Módulos incluidos en un Proyecto.
 *
 * @property int $IdProyectoModulo
 * @property int $IdProyecto
 * @property int $IdModulo
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminProyecto $proyecto
 * @property-read AdminModulo $modulo
 */
class AdminProyectoModulo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_proyecto_modulo';

    protected $primaryKey = 'IdProyectoModulo';

    protected $fillable = [
        'IdProyecto',
        'IdModulo',
        'FechaRegistro',
    ];

    protected $casts = [
        'IdProyecto' => 'integer',
        'IdModulo' => 'integer',
        'FechaRegistro' => 'datetime',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(AdminProyecto::class, 'IdProyecto', 'IdProyecto');
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(AdminModulo::class, 'IdModulo', 'IdModulo');
    }
}
