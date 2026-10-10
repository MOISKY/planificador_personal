<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EjemploTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create();
    }

    public function test_index_lists_seeded_rows_with_pagination(): void
    {
        $this->actingAs($this->admin())
            ->get(route('ejemplo.index', ['per_page' => 5, 'search' => 'sol']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('ejemplo/index')
                ->where('items.per_page', 5)
                ->where('items.total', 12)
                ->has('items.data', 5));
    }

    public function test_store_validates_and_creates(): void
    {
        $user = $this->admin();

        $this->actingAs($user)
            ->post(route('ejemplo.store'), ['codigo' => '', 'nombre' => '', 'estatus' => 'Otro', 'monto' => -1])
            ->assertSessionHasErrors(['codigo', 'nombre', 'estatus', 'monto']);

        $this->actingAs($user)
            ->post(route('ejemplo.store'), ['codigo' => 'NEW-1', 'nombre' => 'Nuevo', 'estatus' => 'Pendiente', 'monto' => 10])
            ->assertSessionHas('success');

        $this->actingAs($user)
            ->get(route('ejemplo.index', ['search' => 'NEW-1']))
            ->assertInertia(fn ($page) => $page->where('items.total', 1));
    }

    public function test_destroy_removes_row(): void
    {
        $user = $this->admin();

        $this->actingAs($user)->delete(route('ejemplo.destroy', 1))->assertSessionHas('success');

        $this->actingAs($user)
            ->get(route('ejemplo.index', ['per_page' => 100]))
            ->assertInertia(fn ($page) => $page->where('items.total', 11));
    }
}
