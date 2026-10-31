<?php

namespace Tests\Feature;

use App\Models\Admin\AdminUsuarioConfiguracionGithub;
use App\Models\Admin\AdminUsuarioConfiguracionGmail;
use App\Models\User;
use App\Services\PasswordAes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ConfiguracionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::first() ?? User::factory()->create();
    }

    public function test_usuarios_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('configuracion.usuarios.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('configuracion/usuarios/index'));
    }

    public function test_usuarios_create_and_update(): void
    {
        $admin = $this->admin();
        $unique = uniqid();

        // Create
        $response = $this->actingAs($admin)->post(route('configuracion.usuarios.store'), [
            'NombreUsuario' => 'user_'.$unique,
            'SNombre' => 'Usuario Test '.$unique,
            'SMail' => 'user_'.$unique.'@ejemplo.com',
            'STelefono' => '5512345678',
            'password' => 'secreto123',
            'EActivo' => 'Si',
        ]);
        $response->assertSessionHas('success');

        $user = User::where('NombreUsuario', 'user_'.$unique)->first();
        $this->assertNotNull($user);
        $this->assertEquals('Usuario Test '.$unique, $user->SNombre);

        // Verify password encryption
        $passwordAes = app(PasswordAes::class);
        $this->assertEquals('secreto123', $passwordAes->descifrar((string) $user->SPassword));

        // Update
        $this->actingAs($admin)->put(route('configuracion.usuarios.update', $user->IdUsuario), [
            'NombreUsuario' => 'user_mod_'.$unique,
            'SNombre' => 'Usuario Modificado '.$unique,
            'SMail' => 'user_mod_'.$unique.'@ejemplo.com',
            'STelefono' => '5587654321',
            'password' => 'nuevopass456',
            'EActivo' => 'Si',
        ])->assertSessionHas('success');

        $user->refresh();
        $this->assertEquals('user_mod_'.$unique, $user->NombreUsuario);
        $this->assertEquals('nuevopass456', $passwordAes->descifrar((string) $user->SPassword));
    }

    public function test_usuarios_cannot_be_deleted(): void
    {
        // Assert no destroy route is registered for usuarios
        $this->assertFalse(Route::has('configuracion.usuarios.destroy'));
    }

    public function test_configuracion_github_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('configuracion.github.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('configuracion/github/index'));
    }

    public function test_configuracion_github_crud(): void
    {
        $admin = $this->admin();

        // Create
        $response = $this->actingAs($admin)->post(route('configuracion.github.store'), [
            'IdUsuario' => $admin->IdUsuario,
            'GITHUB_USERNAME' => 'octocat_'.uniqid(),
            'GITHUB_TOKEN' => 'ghp_'.str_repeat('x', 36),
        ]);
        $response->assertSessionHas('success');

        $config = AdminUsuarioConfiguracionGithub::latest('IdUsuarioConfiguracionGithub')->first();
        $this->assertNotNull($config);
        $this->assertEquals($admin->IdUsuario, $config->IdUsuario);
        $this->assertEquals('ghp_'.str_repeat('x', 36), $config->GITHUB_TOKEN);

        // Update
        $this->actingAs($admin)->put(route('configuracion.github.update', $config->IdUsuarioConfiguracionGithub), [
            'IdUsuario' => $admin->IdUsuario,
            'GITHUB_USERNAME' => 'octocat_updated',
            'GITHUB_TOKEN' => 'ghp_updated_token',
        ])->assertSessionHas('success');

        $config->refresh();
        $this->assertEquals('octocat_updated', $config->GITHUB_USERNAME);
        $this->assertEquals('ghp_updated_token', $config->GITHUB_TOKEN);

        // Delete
        $this->actingAs($admin)->delete(route('configuracion.github.destroy', $config->IdUsuarioConfiguracionGithub))
            ->assertSessionHas('success');

        $this->assertNull(AdminUsuarioConfiguracionGithub::find($config->IdUsuarioConfiguracionGithub));
    }

    public function test_configuracion_gmail_index_renders(): void
    {
        $this->actingAs($this->admin())
            ->get(route('configuracion.gmail.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('configuracion/gmail/index'));
    }

    public function test_configuracion_gmail_crud(): void
    {
        $admin = $this->admin();

        // Create
        $response = $this->actingAs($admin)->post(route('configuracion.gmail.store'), [
            'IdUsuario' => $admin->IdUsuario,
            'MAIL_MAILER' => 'smtp',
            'MAIL_SCHEME' => 'tls',
            'MAIL_HOST' => 'smtp.gmail.com',
            'MAIL_PORT' => 587,
            'MAIL_USERNAME' => 'notificaciones@ejemplo.com',
            'MAIL_PASSWORD' => 'app_password_secret',
            'MAIL_FROM_NAME' => 'ERP Notificaciones',
            'MAIL_FROM_ADDRESS' => 'notificaciones@ejemplo.com',
        ]);
        $response->assertSessionHas('success');

        $config = AdminUsuarioConfiguracionGmail::latest('IdUsuarioConfiguracionGmail')->first();
        $this->assertNotNull($config);
        $this->assertEquals('smtp.gmail.com', $config->MAIL_HOST);
        $this->assertEquals('app_password_secret', $config->MAIL_PASSWORD);

        // Update
        $this->actingAs($admin)->put(route('configuracion.gmail.update', $config->IdUsuarioConfiguracionGmail), [
            'IdUsuario' => $admin->IdUsuario,
            'MAIL_MAILER' => 'smtp',
            'MAIL_SCHEME' => 'ssl',
            'MAIL_HOST' => 'smtp.gmail.com',
            'MAIL_PORT' => 465,
            'MAIL_USERNAME' => 'modificado@ejemplo.com',
            'MAIL_PASSWORD' => 'new_secret_pwd',
            'MAIL_FROM_NAME' => 'ERP Modificado',
            'MAIL_FROM_ADDRESS' => 'modificado@ejemplo.com',
        ])->assertSessionHas('success');

        $config->refresh();
        $this->assertEquals(465, $config->MAIL_PORT);
        $this->assertEquals('new_secret_pwd', $config->MAIL_PASSWORD);

        // Delete
        $this->actingAs($admin)->delete(route('configuracion.gmail.destroy', $config->IdUsuarioConfiguracionGmail))
            ->assertSessionHas('success');

        $this->assertNull(AdminUsuarioConfiguracionGmail::find($config->IdUsuarioConfiguracionGmail));
    }
}

