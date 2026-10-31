<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminUsuarioConfiguracionGmail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionGmailController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminUsuarioConfiguracionGmail::query()
            ->with(['usuario:IdUsuario,NombreUsuario,SNombre,SMail'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('MAIL_HOST', 'ilike', "%{$search}%")
                        ->orWhere('MAIL_USERNAME', 'ilike', "%{$search}%")
                        ->orWhere('MAIL_FROM_NAME', 'ilike', "%{$search}%")
                        ->orWhere('MAIL_FROM_ADDRESS', 'ilike', "%{$search}%")
                        ->orWhereHas('usuario', function ($u) use ($search): void {
                            $u->where('SNombre', 'ilike', "%{$search}%")
                                ->orWhere('NombreUsuario', 'ilike', "%{$search}%")
                                ->orWhere('SMail', 'ilike', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('IdUsuarioConfiguracionGmail');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $usuarios = User::query()
            ->where('EActivo', 'Si')
            ->orderBy('SNombre')
            ->get(['IdUsuario', 'NombreUsuario', 'SNombre', 'SMail']);

        return Inertia::render('configuracion/gmail/index', [
            'items' => $items,
            'usuarios' => $usuarios,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdUsuario' => ['required', 'integer', 'exists:admin_usuarios,IdUsuario'],
            'MAIL_MAILER' => ['nullable', 'string', 'max:50'],
            'MAIL_SCHEME' => ['nullable', 'string', 'max:50'],
            'MAIL_HOST' => ['required', 'string', 'max:150'],
            'MAIL_PORT' => ['required', 'integer'],
            'MAIL_USERNAME' => ['required', 'string', 'max:150'],
            'MAIL_PASSWORD' => ['required', 'string'],
            'MAIL_FROM_NAME' => ['required', 'string', 'max:150'],
            'MAIL_FROM_ADDRESS' => ['required', 'email', 'max:150'],
        ]);

        $validated['MAIL_MAILER'] = $validated['MAIL_MAILER'] ?: 'smtp';

        AdminUsuarioConfiguracionGmail::create($validated);

        return back()->with('success', 'Configuración de Gmail guardada correctamente.');
    }

    public function update(Request $request, AdminUsuarioConfiguracionGmail $gmail): RedirectResponse
    {
        $validated = $request->validate([
            'IdUsuario' => ['required', 'integer', 'exists:admin_usuarios,IdUsuario'],
            'MAIL_MAILER' => ['nullable', 'string', 'max:50'],
            'MAIL_SCHEME' => ['nullable', 'string', 'max:50'],
            'MAIL_HOST' => ['required', 'string', 'max:150'],
            'MAIL_PORT' => ['required', 'integer'],
            'MAIL_USERNAME' => ['required', 'string', 'max:150'],
            'MAIL_PASSWORD' => ['nullable', 'string'],
            'MAIL_FROM_NAME' => ['required', 'string', 'max:150'],
            'MAIL_FROM_ADDRESS' => ['required', 'email', 'max:150'],
        ]);

        $validated['MAIL_MAILER'] = $validated['MAIL_MAILER'] ?: 'smtp';

        if (empty($validated['MAIL_PASSWORD'])) {
            unset($validated['MAIL_PASSWORD']);
        }

        $gmail->update($validated);

        return back()->with('success', 'Configuración de Gmail actualizada correctamente.');
    }

    public function destroy(AdminUsuarioConfiguracionGmail $gmail): RedirectResponse
    {
        $gmail->delete();

        return back()->with('success', 'Configuración de Gmail eliminada correctamente.');
    }
}
