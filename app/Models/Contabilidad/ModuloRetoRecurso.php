<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recursos de apoyo dentro de un Reto.
 *
 * @property int $IdRetoRecurso
 * @property int $IdReto
 * @property int|null $IdModuloDetalle
 * @property string $Nombre
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloReto $reto
 */
class ModuloRetoRecurso extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_reto_recurso';

    protected $primaryKey = 'IdRetoRecurso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdReto',
        'IdModuloDetalle',
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
            'IdReto' => 'integer',
            'IdModuloDetalle' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function reto(): BelongsTo
    {
        return $this->belongsTo(ModuloReto::class, 'IdReto', 'IdReto');
    }
}
