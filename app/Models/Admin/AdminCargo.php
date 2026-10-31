<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cargo / Puesto laboral.
 *
 * @property int $IdCargo
 * @property string $Codigo
 * @property string $Nombre
 * @property string $EActivo
 * @property CarbonInterface $FechaRegistro
 * @property-read Collection<int, AdminPersonalCargo> $personalCargos
 */
class AdminCargo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_cargo';

    protected $primaryKey = 'IdCargo';

    protected $fillable = [
        'Codigo',
        'Nombre',
        'EActivo',
        'FechaRegistro',
    ];

    protected function casts(): array
    {
        return [
            'FechaRegistro' => 'datetime',
        ];
    }

    public function personalCargos(): HasMany
    {
        return $this->hasMany(AdminPersonalCargo::class, 'IdCargo', 'IdCargo');
    }
}
