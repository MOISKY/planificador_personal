<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Personal de la organización.
 *
 * @property int $IdPersonal
 * @property string $Codigo
 * @property string $Nombre
 * @property string $APaterno
 * @property string|null $AMaterno
 * @property string|null $Telefono
 * @property string|null $Movil
 * @property string|null $CorreoElectronico
 * @property string $EActivo
 * @property CarbonInterface $FechaRegistro
 * @property-read string $nombre_completo
 * @property-read Collection<int, AdminPersonalCargo> $cargos
 * @property-read Collection<int, AdminPersonalUsuario> $usuarios
 */
class AdminPersonal extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_personal';

    protected $primaryKey = 'IdPersonal';

    protected $fillable = [
        'Codigo',
        'Nombre',
        'APaterno',
        'AMaterno',
        'Telefono',
        'Movil',
        'CorreoElectronico',
        'EActivo',
        'FechaRegistro',
    ];

    protected $appends = [
        'nombre_completo',
    ];

    protected function casts(): array
    {
        return [
            'FechaRegistro' => 'datetime',
        ];
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->Nombre} {$this->APaterno} {$this->AMaterno}");
    }

    public function cargos(): HasMany
    {
        return $this->hasMany(AdminPersonalCargo::class, 'IdPersonal', 'IdPersonal');
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(AdminPersonalUsuario::class, 'IdPersonal', 'IdPersonal');
    }
}
