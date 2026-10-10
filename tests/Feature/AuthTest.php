<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AdminTecnicaSync;
use App\Services\PasswordAes;
use App\Services\TenantConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function asignarCliente(User $usuario, int $idCliente, string $nombre = 'Cliente'): void
    {
        DB::table('admin_clientes')->insertOrIgnore([
            'IdCliente' => $idCliente,
            'SNombre' => $nombre,
            'DB_DATABASE' => ':memory:',
        ]);
        DB::table('admin_clientes_roles_usuarios')->insert([
            'IdRolUsuario' => random_int(1, 1_000_000),
            'IdCliente' => $idCliente,
            'IdRol' => 1,
            'IdUsuario' => $usuario->IdUsuario,
        ]);
    }

    public function test_aes_matches_mysql_aes_encrypt(): void
    {
        $aes = new PasswordAes('test');

        $this->assertSame('6bcfa40d8fac84c98bd9908e57efe78c', bin2hex($aes->cifrar('password')));
        $this->assertTrue($aes->coincide($aes->cifrar('password'), 'password'));
        $this->assertFalse($aes->coincide($aes->cifrar('password'), 'otra'));
        $this->assertFalse($aes->coincide(null, 'password'));
    }

    public function test_login_page_renders(): void
    {
        $this->get(route('login'))->assertOk();
    }

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_login_with_one_client_selects_it_and_syncs(): void
    {
        $usuario = User::factory()->create();
        $this->asignarCliente($usuario, 7);
        $this->mock(AdminTecnicaSync::class)->shouldReceive('sincronizar')->once()->with(7);

        $this->post(route('login'), ['email' => $usuario->SMail, 'password' => 'password'])
            ->assertRedirect('/dashboard');

        $this->get(route('dashboard'))->assertOk();
        $this->assertSame(7, session(TenantConnection::SESSION_KEY));
        $this->assertSame('cliente_7', config('database.default'));
    }

    public function test_login_with_several_clients_asks_which_one(): void
    {
        $usuario = User::factory()->create();
        $this->asignarCliente($usuario, 1, 'Uno');
        $this->asignarCliente($usuario, 2, 'Dos');
        $this->mock(AdminTecnicaSync::class)->shouldReceive('sincronizar')->once()->with(2);

        $this->post(route('login'), ['email' => $usuario->SMail, 'password' => 'password']);

        $this->get(route('dashboard'))->assertRedirect(route('tenant.seleccionar'));
        $this->get(route('tenant.seleccionar'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('tenant/seleccionar')->has('clientes', 2));

        $this->post(route('tenant.cambiar', ['idCliente' => 2]))->assertRedirect(route('dashboard'));
        $this->assertSame(2, session(TenantConnection::SESSION_KEY));

        $this->post(route('tenant.cambiar', ['idCliente' => 99]))->assertForbidden();
    }

    public function test_wrong_password_inactive_or_unassigned_user_fails(): void
    {
        $conCliente = User::factory()->create();
        $this->asignarCliente($conCliente, 1);
        $inactivo = User::factory()->inactivo()->create();
        $this->asignarCliente($inactivo, 1);
        $sinCliente = User::factory()->create();

        foreach ([
            [$conCliente->SMail, 'nope'],
            [$inactivo->SMail, 'password'],
            [$sinCliente->SMail, 'password'],
        ] as [$email, $password]) {
            $this->from(route('login'))
                ->post(route('login'), ['email' => $email, 'password' => $password])
                ->assertRedirect(route('login'))
                ->assertSessionHasErrors('email');
            $this->assertGuest();
        }
    }

    public function test_user_can_update_profile(): void
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)
            ->patch(route('profile.update'), ['name' => 'Nuevo Nombre', 'email' => $usuario->SMail])
            ->assertRedirect(route('profile.edit'));

        $this->assertSame('Nuevo Nombre', $usuario->fresh()->SNombre);
    }
}
