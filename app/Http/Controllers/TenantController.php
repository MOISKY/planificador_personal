<?php

namespace App\Http\Controllers;

use App\Services\TenantConnection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function __construct(private readonly TenantConnection $tenant)
    {
        // boot
    }

    public function seleccionar(Request $request): Response
    {
        return Inertia::render('tenant/seleccionar', [
            'clientes' => $this->tenant->clientesDe($request->user()->IdUsuario),
            'actual' => $this->tenant->actual(),
        ]);
    }

    public function cambiar(Request $request, int $idCliente): RedirectResponse
    {
        abort_unless($this->tenant->clientesDe($request->user()->IdUsuario)->contains('IdCliente', $idCliente), 403);

        $this->tenant->seleccionar($idCliente);

        return redirect()->route('dashboard')->with('success', 'Cliente seleccionado.');
    }
}
