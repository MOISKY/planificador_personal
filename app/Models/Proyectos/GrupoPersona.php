<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Persona asignada al Proyecto con su Rol.
 *
 * @property int $IdGrupoPersona
 * @property int $IdProyecto
 * @property int $IdPersona
 * @property int $IdRol
 * @property CarbonInterface $FechaRegistro
 * @property-read Proyecto $proyecto
 * @property-read Persona $persona
 * @property-read Rol $rol
 */
class GrupoPersona extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_grupo_persona';

    protected $primaryKey = 'IdGrupoPersona';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdProyecto',
        'IdPersona',
        'IdRol',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdProyecto' => 'integer',
            'IdPersona' => 'integer',
            'IdRol' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'IdProyecto', 'IdProyecto');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'IdPersona', 'IdPersona');
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'IdRol', 'IdRol');
    }
}

