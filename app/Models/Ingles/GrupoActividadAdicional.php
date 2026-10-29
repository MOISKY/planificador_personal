<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Actividad Adicional de Reto (Drawer Mostrar, Agregar, Eliminar).
 *
 * @property int $IdActividadAdicional
 * @property int $IdActividad
 * @property string $Descripcion
 * @property string $UrlRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read GrupoActividad $actividad
 */
class GrupoActividadAdicional extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_grupo_actividad_adicional';

    protected $primaryKey = 'IdActividadAdicional';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdActividad',
        'Descripcion',
        'UrlRecurso',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdActividad' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(GrupoActividad::class, 'IdActividad', 'IdActividad');
    }
}

