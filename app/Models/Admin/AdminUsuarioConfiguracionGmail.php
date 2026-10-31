<?php

namespace App\Models\Admin;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Configuración de Gmail / SMTP por usuario.
 *
 * @property int $IdUsuarioConfiguracionGmail
 * @property int $IdUsuario
 * @property string $MAIL_MAILER
 * @property string|null $MAIL_SCHEME
 * @property string|null $MAIL_HOST
 * @property int|null $MAIL_PORT
 * @property string|null $MAIL_USERNAME
 * @property string|null $MAIL_PASSWORD
 * @property string|null $MAIL_FROM_NAME
 * @property string|null $MAIL_FROM_ADDRESS
 * @property CarbonInterface $FechaRegistro
 * @property-read User $usuario
 */
class AdminUsuarioConfiguracionGmail extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_usuario_configuracion_gmail';

    protected $primaryKey = 'IdUsuarioConfiguracionGmail';

    protected $fillable = [
        'IdUsuario',
        'MAIL_MAILER',
        'MAIL_SCHEME',
        'MAIL_HOST',
        'MAIL_PORT',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'MAIL_FROM_NAME',
        'MAIL_FROM_ADDRESS',
        'FechaRegistro',
    ];

    protected function casts(): array
    {
        return [
            'IdUsuario' => 'integer',
            'MAIL_PORT' => 'integer',
            'MAIL_PASSWORD' => 'encrypted',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'IdUsuario', 'IdUsuario');
    }
}
