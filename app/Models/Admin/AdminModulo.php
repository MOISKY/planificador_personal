<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * Módulo del sistema.
 *
 * @property int $IdModulo
 * @property string $Codigo
 * @property string $Nombre
 * @property string $EActivo
 * @property CarbonInterface $FechaRegistro
 */
class AdminModulo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_modulos';

    protected $primaryKey = 'IdModulo';

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
}
