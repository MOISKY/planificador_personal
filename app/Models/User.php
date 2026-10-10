<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Usuario de admin_tecnica. Vive siempre en la conexión maestra, no sigue al tenant.
 *
 * @property int $IdUsuario
 * @property string $SIdUsuario
 * @property string|null $SPassword cifrado con AES_ENCRYPT (ver PasswordAes)
 * @property string $SNombre
 * @property string $SMail
 * @property string|null $STelefono
 * @property string $EActivo Si|No
 * @property string|null $remember_token
 * @property string|null $FechaHora
 * @property-read string $name
 * @property-read string $email
 */
#[Fillable(['IdUsuario', 'SIdUsuario', 'SPassword', 'SNombre', 'SMail', 'STelefono', 'EActivo'])]
#[Hidden(['SPassword', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'admin_usuarios';

    protected $primaryKey = 'IdUsuario';

    public $incrementing = false;

    public $timestamps = false;

    /** @var list<string> */
    protected $appends = ['name', 'email'];

    public function getConnectionName(): ?string
    {
        return config('noil.master_connection');
    }

    public function getAuthPassword(): string
    {
        return (string) $this->SPassword;
    }

    public function estaActivo(): bool
    {
        return $this->EActivo === 'Si';
    }

    protected function name(): Attribute
    {
        return Attribute::get(fn () => $this->SNombre);
    }

    protected function email(): Attribute
    {
        return Attribute::get(fn () => $this->SMail);
    }
}
