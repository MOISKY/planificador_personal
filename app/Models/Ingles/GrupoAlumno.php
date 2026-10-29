<?php

namespace App\Models\Ingles;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Alumno inscrito en un Grupo (Hijo 1 de Grupo).
 *
 * @property int $IdGrupoAlumno
 * @property int $IdGrupo
 * @property int $IdAlumno
 * @property CarbonInterface $FechaRegistro
 * @property-read Grupo $grupo
 * @property-read Alumno $alumno
 */
class GrupoAlumno extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'ingles_grupo_alumno';

    protected $primaryKey = 'IdGrupoAlumno';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdGrupo',
        'IdAlumno',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdGrupo' => 'integer',
            'IdAlumno' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'IdGrupo', 'IdGrupo');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'IdAlumno', 'IdAlumno');
    }
}

