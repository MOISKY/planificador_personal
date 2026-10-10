<?php

namespace App\Providers;

use App\Models\User;
use App\Services\PasswordAes;
use App\Services\TenantConnection;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Las credenciales viven en admin_tecnica (admin_usuarios con SPassword en AES).
     * Aquí solo se valida al usuario; el tenant lo resuelve SetTenantConnection.
     */
    public function boot(): void
    {
        Fortify::authenticateUsing(function (Request $request): ?User {
            $usuario = User::where('SMail', $request->input('email'))->first();

            if (! $usuario || ! $usuario->estaActivo() || ! app(PasswordAes::class)->coincide($usuario->SPassword, $request->input('password'))) {
                return null;
            }

            return app(TenantConnection::class)->clientesDe($usuario->IdUsuario)->isEmpty() ? null : $usuario;
        });

        Fortify::confirmPasswordsUsing(fn (User $usuario, ?string $password) => app(PasswordAes::class)->coincide($usuario->SPassword, (string) $password));

        Fortify::loginView(fn () => Inertia::render('auth/login'));
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
