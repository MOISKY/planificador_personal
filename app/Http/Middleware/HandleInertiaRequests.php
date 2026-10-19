<?php

namespace App\Http\Middleware;

use App\Models\Produccion;
use App\Models\ProduccionEstatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'cineEstrenosProximosCount' => function (): int {
                if (! Schema::hasTable('cine_produccion')) {
                    return 0;
                }

                return Produccion::whereHas('estatusActual', function ($q): void {
                    $q->where('Estatus', ProduccionEstatus::ESTATUS_POR_VER);
                })
                    ->whereNotNull('FechaProduccion')
                    ->whereBetween('FechaProduccion', [Carbon::today(), Carbon::today()->addDays(30)])
                    ->count();
            },
        ];
    }
}
