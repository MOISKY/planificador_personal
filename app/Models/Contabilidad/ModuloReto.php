<?php

namespace App\Models\Contabilidad;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Reto perteneciente a un Módulo.
 *
 * @property int $IdReto
 * @property int $IdModulo
 * @property string $Nombre
 * @property string|null $UrlReto
 * @property CarbonInterface $FechaRegistro
 * @property-read Modulo $modulo
 * @property-read Collection<int, ModuloRetoRecurso> $recursos
 * @property-read Collection<int, ModuloRetoAlumno> $actividadesAlumnos
 */
class ModuloReto extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'contabilidad_modulo_reto';

    protected $primaryKey = 'IdReto';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'IdModulo',
        'Nombre',
        'UrlReto',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'IdModulo' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'IdModulo', 'IdModulo');
    }

    /**
     * Recursos / materiales del reto.
     *
     * @return HasMany<ModuloRetoRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(ModuloRetoRecurso::class, 'IdReto', 'IdReto');
    }

    /**
     * Actividades o entregas de alumnos para este reto.
     *
     * @return HasMany<ModuloRetoAlumno, $this>
     */
    public function actividadesAlumnos(): HasMany
    {
        return $this->hasMany(ModuloRetoAlumno::class, 'IdReto', 'IdReto');
    }
}
