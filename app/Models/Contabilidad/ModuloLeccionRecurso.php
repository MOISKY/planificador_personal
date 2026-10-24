<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recursos de apoyo dentro de una Lección.
 *
 * @property int $IdLeccionRecurso
 * @property int $IdLeccion
 * @property string $Nombre
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloLeccion $leccion
 */
class ModuloLeccionRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_leccion_recurso';

    protected $primaryKey = 'IdLeccionRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdLeccion',
        'Nombre',
        'URLRecurso',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdLeccion' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function leccion(): BelongsTo
    {
        return $this->belongsTo(ModuloLeccion::class, 'IdLeccion', 'IdLeccion');
    }
}
