<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Recurso de un Proyecto (Opción Hija).
 *
 * @property int $IdRecurso
 * @property int $IdProyecto
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface $FechaRegistro
 * @property-read Proyecto $proyecto
 * @property-read Collection<int, ProyectoRecursoAdicional> $recursosAdicionales
 */
class ProyectoRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_proyecto_recurso';

    protected $primaryKey = 'IdRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProyecto',
        'Nombre',
        'Descripcion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProyecto' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'IdProyecto', 'IdProyecto');
    }

    /**
     * Drawer de recursos adicionales (Mostrar, Agregar, Eliminar).
     *
     * @return HasMany<ProyectoRecursoAdicional, $this>
     */
    public function recursosAdicionales(): HasMany
    {
        return $this->hasMany(ProyectoRecursoAdicional::class, 'IdRecurso', 'IdRecurso');
    }
}

