<?php

namespace App\Http\Middleware;

use App\Services\TenantConnection;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restaura la conexión del cliente en cada petición. Si el usuario entró y aún no
 * tiene cliente: con uno solo lo elige y sincroniza; con varios lo manda a escoger.
 */
class SetTenantConnection
{
    public function __construct(private readonly TenantConnection $tenant) {}

    public function handle(Request $request, Closure $next): Response
    {
        $idCliente = $this->tenant->actual();

        if ($idCliente !== null) {
            $this->tenant->usar($idCliente);

            return $next($request);
        }

        $usuario = $request->user();

        if ($usuario === null || $request->routeIs('tenant.*', 'logout')) {
            return $next($request);
        }

        $clientes = $this->tenant->clientesDe($usuario->IdUsuario);

        if ($clientes->count() > 1) {
            return redirect()->route('tenant.seleccionar');
        }

        if ($clientes->count() === 1) {
            $this->tenant->seleccionar($clientes->first()->IdCliente);
        }

        return $next($request);
    }
}
