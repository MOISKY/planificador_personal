<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class EjemploController extends Controller
{
    private const SESSION_KEY = 'ejemplo.items';

    public function index(Request $request): Response
    {
        $search = mb_strtolower((string) $request->string('search'));
        $estatus = (string) $request->string('estatus');
        $perPage = max(1, (int) $request->integer('per_page', 10));
        $page = max(1, (int) $request->integer('page', 1));

        $items = $this->items($request)
            ->when($search !== '', fn (Collection $c) => $c->filter(
                fn (array $i) => str_contains(mb_strtolower($i['codigo'].' '.$i['nombre']), $search)
            ))
            ->when($estatus !== '', fn (Collection $c) => $c->where('estatus', $estatus))
            ->values();

        $paginator = new LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(),
            $items->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return Inertia::render('ejemplo/index', [
            'items' => $paginator,
            'searchValue' => (string) $request->string('search'),
            'estatus' => $estatus,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $items = $this->items($request);
        $data['id'] = ((int) $items->max('id')) + 1;
        $data['fecha'] = now()->toDateString();

        $request->session()->put(self::SESSION_KEY, $items->push($data)->all());

        return back()->with('success', "Registro {$data['codigo']} creado.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $data = $this->validated($request, $id);
        $items = $this->items($request)->map(fn (array $i) => $i['id'] === $id ? [...$i, ...$data] : $i);

        $request->session()->put(self::SESSION_KEY, $items->all());

        return back()->with('success', "Registro {$data['codigo']} actualizado.");
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $items = $this->items($request)->reject(fn (array $i) => $i['id'] === $id)->values();

        $request->session()->put(self::SESSION_KEY, $items->all());

        return back()->with('success', 'Registro eliminado.');
    }

    /**
     * @return array{codigo: string, nombre: string, estatus: string, monto: float}
     */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $codigos = $this->items($request)->reject(fn (array $i) => $i['id'] === $ignoreId)->pluck('codigo')->all();

        return $request->validate([
            'codigo' => ['required', 'string', 'max:20', 'not_in:'.implode(',', $codigos)],
            'nombre' => ['required', 'string', 'max:100'],
            'estatus' => ['required', 'in:Pendiente,En proceso,Terminado,Cancelado'],
            'monto' => ['required', 'numeric', 'min:0'],
        ], [], ['codigo' => 'código', 'nombre' => 'nombre', 'estatus' => 'estatus', 'monto' => 'monto']);
    }

    /**
     * @return Collection<int, array{id: int, codigo: string, nombre: string, estatus: string, monto: float, fecha: string}>
     */
    private function items(Request $request): Collection
    {
        if (! $request->session()->has(self::SESSION_KEY)) {
            $request->session()->put(self::SESSION_KEY, $this->semilla());
        }

        return collect($request->session()->get(self::SESSION_KEY));
    }

    /**
     * @return list<array{id: int, codigo: string, nombre: string, estatus: string, monto: float, fecha: string}>
     */
    private function semilla(): array
    {
        $estatus = ['Pendiente', 'En proceso', 'Terminado', 'Cancelado'];
        $nombres = ['Mantenimiento preventivo', 'Capacitación NOM-035', 'Auditoría interna', 'Instalación de equipo',
            'Servicio correctivo', 'Levantamiento de obra', 'Consultoría fiscal', 'Soporte técnico', 'Inspección de seguridad',
            'Calibración de sensores', 'Renovación de licencias', 'Migración de datos'];

        return collect($nombres)->map(fn (string $nombre, int $i) => [
            'id' => $i + 1,
            'codigo' => sprintf('SOL-%05d', $i + 1),
            'nombre' => $nombre,
            'estatus' => $estatus[$i % 4],
            'monto' => round(1500 + $i * 875.5, 2),
            'fecha' => now()->subDays($i * 3)->toDateString(),
        ])->all();
    }
}
