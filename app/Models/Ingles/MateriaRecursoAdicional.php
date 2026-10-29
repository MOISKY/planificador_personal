<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recurso Adicional (Drawer Mostrar, Agregar, Eliminar en Recurso de Materia).
 *
 * @property int $IdRecursoAdicional
 * @property int $IdRecurso
 * @property string $Descripcion
 * @property string $UrlRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read MateriaRecurso $recurso
 */
class MateriaRecursoAdicional extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_materia_recurso_adicional';

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
        return $this->belongsTo(MateriaRecurso::class, 'IdRecurso', 'IdRecurso');
    }
}

