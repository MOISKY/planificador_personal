<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Producción cinematográfica o televisiva (película, serie, etc.).
 *
 * @property int $IdProduccion
 * @property string $NombreProduccion
 * @property string|null $Sinopsis
 * @property CarbonInterface|null $FechaProduccion
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, Director> $directores
 * @property-read Collection<int, ProduccionRecurso> $recursos
 * @property-read Collection<int, ProduccionComentario> $comentarios
 * @property-read Collection<int, ProduccionSeguimiento> $seguimientos
 * @property-read Collection<int, ProduccionEstatus> $estatusKardex
 * @property-read ProduccionEstatus|null $estatusActual
 */
class Produccion extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'cine_produccion';

    protected $primaryKey = 'IdProduccion';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'NombreProduccion',
        'Sinopsis',
        'FechaProduccion',
        'FechaRegistro',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaProduccion' => 'date',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Registro automático de estatus inicial 'por ver' al dar de alta una producción.
     */
    protected static function booted(): void
    {
        static::created(function (Produccion $produccion): void {
            // Si la base de datos o el trigger no insertó aún el estatus inicial, lo asegura Eloquent
            if (! $produccion->estatusKardex()->exists()) {
                $produccion->estatusKardex()->create([
                    'Estatus' => ProduccionEstatus::ESTATUS_POR_VER,
                ]);
            }
        });
    }

    /**
     * Directores asociados a esta producción.
     *
     * @return BelongsToMany<Director, $this>
     */
    public function directores(): BelongsToMany
    {
        return $this->belongsToMany(
            Director::class,
            'cine_produccion_directores',
            'IdProduccion',
            'IdDirector',
            'IdProduccion',
            'IdDirector'
        )->withPivot('IdProduccionDirector', 'FechaRegistro');
    }

    /**
     * Recursos y enlaces multimedia (ver, video, sitio, imagen, documento).
     *
     * @return HasMany<ProduccionRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(ProduccionRecurso::class, 'IdProduccion', 'IdProduccion');
    }

    /**
     * Reseñas y opiniones asociadas.
     *
     * @return HasMany<ProduccionComentario, $this>
     */
    public function comentarios(): HasMany
    {
        return $this->hasMany(ProduccionComentario::class, 'IdProduccion', 'IdProduccion');
    }

    /**
     * Bitácora o historial de visualizaciones.
     *
     * @return HasMany<ProduccionSeguimiento, $this>
     */
    public function seguimientos(): HasMany
    {
        return $this->hasMany(ProduccionSeguimiento::class, 'IdProduccion', 'IdProduccion')
            ->orderBy('Fecha', 'desc')
            ->orderBy('Hora', 'desc');
    }

    /**
     * Historial completo de estatus (kardex).
     *
     * @return HasMany<ProduccionEstatus, $this>
     */
    public function estatusKardex(): HasMany
    {
        return $this->hasMany(ProduccionEstatus::class, 'IdProduccion', 'IdProduccion')
            ->orderBy('FechaRegistro', 'desc');
    }

    /**
     * Último estatus registrado de la producción.
     *
     * @return HasOne<ProduccionEstatus, $this>
     */
    public function estatusActual(): HasOne
    {
        return $this->hasOne(ProduccionEstatus::class, 'IdProduccion', 'IdProduccion')
            ->latestOfMany('FechaRegistro');
    }

    /**
     * Busca una producción por nombre de forma insensible a mayúsculas/minúsculas compatible con MySQL y PostgreSQL.
     */
    public static function buscarPorNombre(string $nombre): ?self
    {
        $nombreLimpio = trim($nombre);
        if ($nombreLimpio === '') {
            return null;
        }

        $col = (new static)->getConnection()->getQueryGrammar()->wrap('NombreProduccion');

        return static::whereRaw("LOWER({$col}) = ?", [mb_strtolower($nombreLimpio)])->first();
    }
}
