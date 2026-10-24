<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Módulos o asignaturas. Eje de donde parten Retos y Lecciones.
 *
 * @property int $IdModulo
 * @property string $Modulo
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, ModuloReto> $retos
 * @property-read Collection<int, ModuloLeccion> $lecciones
 */
class Modulo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo';

    protected $primaryKey = 'IdModulo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Modulo',
        'FechaRegistro',
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

    /**
     * Retos pertenecientes a este módulo.
     *
     * @return HasMany<ModuloReto, $this>
     */
    public function retos(): HasMany
    {
        return $this->hasMany(ModuloReto::class, 'IdModulo', 'IdModulo');
    }

    /**
     * Lecciones pertenecientes a este módulo.
     *
     * @return HasMany<ModuloLeccion, $this>
     */
    public function lecciones(): HasMany
    {
        return $this->hasMany(ModuloLeccion::class, 'IdModulo', 'IdModulo');
    }
}
