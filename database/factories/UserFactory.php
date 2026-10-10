<?php

namespace Database\Factories;

use App\Models\User;
use App\Services\PasswordAes;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Contraseña de todos los usuarios de fábrica: `password`.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'IdUsuario' => fake()->unique()->numberBetween(1, 1_000_000),
            'SIdUsuario' => fake()->unique()->userName(),
            'SPassword' => app(PasswordAes::class)->cifrar('password'),
            'SNombre' => fake()->name(),
            'SMail' => fake()->unique()->safeEmail(),
            'STelefono' => null,
            'EActivo' => 'Si',
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn () => ['EActivo' => 'No']);
    }
}
