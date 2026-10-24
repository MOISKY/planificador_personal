<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catálogo de alumnos.
 *
 * @property int $IdAlumno
 * @property string $Nombre
 * @property string $ApellidoPaterno
 * @property string|null $ApellidoMaterno
 * @property CarbonInterface $FechaRegistro
 * @property-read string $nombre_completo
 * @property-read Collection<int, ModuloRetoAlumno> $actividadesReto
 */
class Alumno extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_alumno';

    protected $primaryKey = 'IdAlumno';

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
     * Actividades entregadas por el alumno en retos.
     *
     * @return HasMany<ModuloRetoAlumno, $this>
     */
    public function actividadesReto(): HasMany
    {
        return $this->hasMany(ModuloRetoAlumno::class, 'IdAlumno', 'IdAlumno');
    }
}
