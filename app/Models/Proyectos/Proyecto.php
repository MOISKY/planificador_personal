<?php

namespace App\Models\Proyectos;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Proyecto (Entidad Principal Independiente).
 *
 * @property int $IdProyecto
 * @property string $Nombre
 * @property string|null $Descripcion
 * @property CarbonInterface|null $FechaInicio
 * @property CarbonInterface|null $FechaFinal
 * @property CarbonInterface $FechaRegistro
 * @property-read string|null $duracion
 * @property-read bool $en_curso
 * @property-read Collection<int, ProyectoRecurso> $recursos
 * @property-read Collection<int, GrupoPersona> $personasAsignadas
 * @property-read Collection<int, ProyectoActividad> $actividades
 */
class Proyecto extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'proyectos_proyecto';

    protected $primaryKey = 'IdProyecto';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'Descripcion',
        'FechaInicio',
        'FechaFinal',
        'FechaRegistro',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'duracion',
        'en_curso',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'FechaInicio' => 'date:Y-m-d',
            'FechaFinal' => 'date:Y-m-d',
            'FechaRegistro' => 'datetime',
        ];
    }

    /**
     * Duración calculada entre FechaInicio y FechaFinal.
     * Si no tiene FechaFinal, el reloj sigue corriendo calculando hasta la fecha actual.
     */
    public function getDuracionAttribute(): ?string
    {
        if (! $this->FechaInicio) {
            return null;
        }

        $inicio = Carbon::parse($this->FechaInicio)->startOfDay();
        $fin = $this->FechaFinal
            ? Carbon::parse($this->FechaFinal)->endOfDay()
            : Carbon::now();

        if ($fin->lessThan($inicio)) {
            return '0 días';
        }

        $diasTotales = $inicio->diffInDays($fin);

        if ($diasTotales < 7) {
            $dias = (int) $diasTotales;

            return $dias === 1 ? '1 día' : "{$dias} días";
        }

        if ($diasTotales < 30) {
            $semanas = (int) floor($diasTotales / 7);
            $restoDias = (int) ($diasTotales % 7);
            $texto = $semanas === 1 ? '1 semana' : "{$semanas} semanas";
            if ($restoDias > 0) {
                $texto .= $restoDias === 1 ? ' y 1 día' : " y {$restoDias} días";
            }

            return $texto;
        }

        if ($diasTotales < 365) {
            $meses = (int) floor($diasTotales / 30.4375);
            $restoDias = (int) round($diasTotales - ($meses * 30.4375));
            $texto = $meses === 1 ? '1 mes' : "{$meses} meses";
            if ($restoDias >= 7) {
                $semanas = (int) floor($restoDias / 7);
                $texto .= $semanas === 1 ? ' y 1 sem.' : " y {$semanas} sem.";
            }

            return $texto;
        }

        $anios = (int) floor($diasTotales / 365.25);
        $restoMeses = (int) floor(($diasTotales - ($anios * 365.25)) / 30.4375);
        $texto = $anios === 1 ? '1 año' : "{$anios} años";
        if ($restoMeses > 0) {
            $texto .= $restoMeses === 1 ? ' y 1 mes' : " y {$restoMeses} meses";
        }

        return $texto;
    }

    /**
     * Determina si el proyecto sigue corriendo activamente.
     */
    public function getEnCursoAttribute(): bool
    {
        return is_null($this->FechaFinal);
    }

    /**
     * @return HasMany<ProyectoRecurso, $this>
     */
    public function recursos(): HasMany
    {
        return $this->hasMany(ProyectoRecurso::class, 'IdProyecto', 'IdProyecto');
    }

    /**
     * Personas asignadas con su rol.
     *
     * @return HasMany<GrupoPersona, $this>
     */
    public function personasAsignadas(): HasMany
    {
        return $this->hasMany(GrupoPersona::class, 'IdProyecto', 'IdProyecto');
    }

    /**
     * Actividades del proyecto.
     *
     * @return HasMany<ProyectoActividad, $this>
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(ProyectoActividad::class, 'IdProyecto', 'IdProyecto');
    }
}

