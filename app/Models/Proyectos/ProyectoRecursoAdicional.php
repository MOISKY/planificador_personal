<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recurso Adicional para el Drawer de un Recurso de Proyecto.
 *
 * @property int $IdRecursoAdicional
 * @property int $IdRecurso
 * @property string $Descripcion
 * @property string $UrlRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ProyectoRecurso $recurso
 */
class ProyectoRecursoAdicional extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_proyecto_recurso_adicional';

    protected $primaryKey = 'IdRecursoAdicional';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdRecurso',
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
            'IdRecurso' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function recurso(): BelongsTo
    {
        return $this->belongsTo(ProyectoRecurso::class, 'IdRecurso', 'IdRecurso');
    }
}

