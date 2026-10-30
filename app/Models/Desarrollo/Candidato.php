<?php

namespace App\Models\Desarrollo;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Candidato del módulo de Desarrollo.
 *
 * @property int $IdCandidato
 * @property string $Nombre
 * @property string $APaterno
 * @property string|null $AMaterno
 * @property string|null $Telefono
 * @property string|null $Movil
 * @property int $IOrden
 * @property string|null $CorreoElectronico
 * @property string|null $UrlCv
 * @property string $EActivo
 * @property int $IdEspecialidad
 * @property int|null $IdCandidatoTipo
 * @property CarbonInterface $FechaRegistro
 * @property-read string $nombre_completo
 * @property-read Especialidad|null $especialidad
 * @property-read CandidatoTipo|null $candidatoTipo
 */
class Candidato extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_candidato';

    protected $primaryKey = 'IdCandidato';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'Nombre',
        'APaterno',
        'AMaterno',
        'Telefono',
        'Movil',
        'IOrden',
        'CorreoElectronico',
        'UrlCv',
        'EActivo',
        'IdEspecialidad',
        'IdCandidatoTipo',
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
            'IOrden' => 'integer',
            'IdEspecialidad' => 'integer',
            'IdCandidatoTipo' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->Nombre} {$this->APaterno} {$this->AMaterno}");
    }

    /**
     * @return BelongsTo<Especialidad, $this>
     */
    public function especialidad(): BelongsTo
    {
        return $this->belongsTo(Especialidad::class, 'IdEspecialidad', 'IdEspecialidad');
    }

    /**
     * @return BelongsTo<CandidatoTipo, $this>
     */
    public function candidatoTipo(): BelongsTo
    {
        return $this->belongsTo(CandidatoTipo::class, 'IdCandidatoTipo', 'IdCandidatoTipo');
    }
}
