<?php

namespace App\Models\Admin;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Relación entre personal y usuario del sistema.
 *
 * @property int $IdPersonalUsuario
 * @property int $IdPersonal
 * @property int $IdUsuario
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminPersonal $personal
 * @property-read User $usuario
 */
class AdminPersonalUsuario extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_personal_usuario';

    protected $primaryKey = 'IdPersonalUsuario';

    protected $fillable = [
        'IdPersonal',
        'IdUsuario',
        'FechaRegistro',
    ];

    protected function casts(): array
    {
        return [
            'IdPersonal' => 'integer',
            'IdUsuario' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(AdminPersonal::class, 'IdPersonal', 'IdPersonal');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'IdUsuario', 'IdUsuario');
    }
}
