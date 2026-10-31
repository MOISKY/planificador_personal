<?php

namespace App\Models\Admin;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Configuración de GitHub por usuario.
 *
 * @property int $IdUsuarioConfiguracionGithub
 * @property int $IdUsuario
 * @property string|null $GITHUB_TOKEN
 * @property string|null $GITHUB_USERNAME
 * @property CarbonInterface $FechaRegistro
 * @property-read User $usuario
 */
class AdminUsuarioConfiguracionGithub extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_usuario_configuracion_github';

    protected $primaryKey = 'IdUsuarioConfiguracionGithub';

    protected $fillable = [
        'IdUsuario',
        'GITHUB_TOKEN',
        'GITHUB_USERNAME',
        'FechaRegistro',
    ];

    protected function casts(): array
    {
        return [
            'IdUsuario' => 'integer',
            'GITHUB_TOKEN' => 'encrypted',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'IdUsuario', 'IdUsuario');
    }
}
