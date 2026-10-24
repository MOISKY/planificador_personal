<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Actividades o entregas de alumnos dentro de un Reto.
 *
 * @property int $IdRetoAlumno
 * @property int $IdReto
 * @property int $IdAlumno
 * @property int|null $IdRetoRecurso
 * @property int|null $IdModuloDetalle
 * @property string $Nombre
 * @property string $URLRecurso
 * @property CarbonInterface $FechaRegistro
 * @property-read ModuloReto $reto
 * @property-read Alumno $alumno
 * @property-read ModuloRetoRecurso|null $recursoAsociado
 */
class ModuloRetoAlumno extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_reto_alumno';

    protected $primaryKey = 'IdRetoAlumno';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdReto',
        'IdAlumno',
        'IdRetoRecurso',
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
            'IdAlumno' => 'integer',
            'IdRetoRecurso' => 'integer',
            'IdModuloDetalle' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function reto(): BelongsTo
    {
        return $this->belongsTo(ModuloReto::class, 'IdReto', 'IdReto');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'IdAlumno', 'IdAlumno');
    }

    public function recursoAsociado(): BelongsTo
    {
        return $this->belongsTo(ModuloRetoRecurso::class, 'IdRetoRecurso', 'IdRetoRecurso');
    }
}
