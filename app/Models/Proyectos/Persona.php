<?php

namespace App\Models\Proyectos;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Persona del módulo de Proyectos.
 *
 * @property int $IdPersona
 * @property string $Nombre
 * @property string $ApellidoPaterno
 * @property string|null $ApellidoMaterno
 * @property string|null $correoElectronico
 * @property string|null $telefono
 * @property CarbonInterface $FechaRegistro
 * @property-read string $nombre_completo
 * @property-read Collection<int, GrupoPersona> $gruposPersona
 */
class Persona extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_persona';

    protected $primaryKey = 'IdPersona';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'ApellidoPaterno',
        'ApellidoMaterno',
        'correoElectronico',
        'telefono',
        'FechaRegistro',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'nombre_completo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaRegistro' => 'datetime',
        ];
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->Nombre} {$this->ApellidoPaterno} {$this->ApellidoMaterno}");
    }

    /**
     * @return HasMany<GrupoPersona, $this>
     */
    public function gruposPersona(): HasMany
    {
        return $this->hasMany(GrupoPersona::class, 'IdPersona', 'IdPersona');
    }
}

