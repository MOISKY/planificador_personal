<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo de asesores / docentes.
 *
 * @property int $IdAsesor
 * @property string $Nombre
 * @property string $ApellidoPaterno
 * @property string|null $ApellidoMaterno
 * @property CarbonInterface $FechaRegistro
 * @property-read string $nombre_completo
 * @property-read Collection<int, Ciclo> $ciclos
 */
class Asesor extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_asesor';

    protected $primaryKey = 'IdAsesor';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'ApellidoPaterno',
        'ApellidoMaterno',
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
     * Ciclos asignados a este asesor.
     *
     * @return HasMany<Ciclo, $this>
     */
    public function ciclos(): HasMany
    {
        return $this->hasMany(Ciclo::class, 'IdAsesor', 'IdAsesor');
    }
}
