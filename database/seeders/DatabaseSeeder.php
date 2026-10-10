<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Usuario seed: admin@noil.mx / password, con un cliente que apunta a esta misma base.
     */
    public function run(): void
    {
        $usuario = User::factory()->create([
            'IdUsuario' => 1,
            'SIdUsuario' => 'admin',
            'SNombre' => 'Administrador',
            'SMail' => 'admin@noil.mx',
        ]);

        DB::table('admin_clientes')->insert([
            'IdCliente' => 1,
            'SCodigoCliente' => 'DEMO',
            'SNombre' => 'Cliente demo',
            'DB_HOST' => config('database.connections.'.config('noil.master_connection').'.host'),
            'DB_PORT' => config('database.connections.'.config('noil.master_connection').'.port'),
            'DB_DATABASE' => config('database.connections.'.config('noil.master_connection').'.database'),
            'DB_USERNAME' => config('database.connections.'.config('noil.master_connection').'.username'),
            'DB_PASSWORD' => config('database.connections.'.config('noil.master_connection').'.password'),
        ]);

        DB::table('admin_clientes_roles_usuarios')->insert([
            'IdRolUsuario' => 1,
            'IdCliente' => 1,
            'IdRol' => 1,
            'IdUsuario' => $usuario->IdUsuario,
        ]);
    }
}
