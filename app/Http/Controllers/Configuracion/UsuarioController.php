<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordAes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $passwordAes = app(PasswordAes::class);

        $query = User::query()
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('SNombre', 'ilike', "%{$search}%")
                        ->orWhere('SMail', 'ilike', "%{$search}%")
                        ->orWhere('SIdUsuario', 'ilike', "%{$search}%")
                        ->orWhere('NombreUsuario', 'ilike', "%{$search}%")
                        ->orWhere('STelefono', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('SNombre');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = $query->get()->map(function (User $user) use ($passwordAes) {
                $user->password_plano = $passwordAes->descifrar((string) $user->SPassword) ?? '';

                return $user;
            });

            return response()->json($apiItems);
        }

        $items = $query->paginate($perPage)->withQueryString();

        $items->getCollection()->transform(function (User $user) use ($passwordAes) {
            $user->password_plano = $passwordAes->descifrar((string) $user->SPassword) ?? '';

            return $user;
        });

        return Inertia::render('configuracion/usuarios/index', [
            'items' => $items,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'NombreUsuario' => ['required', 'string', 'max:50'],
            'SNombre' => ['required', 'string', 'max:100'],
            'SMail' => ['required', 'email', 'max:150'],
            'STelefono' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:4'],
            'EActivo' => ['nullable'],
        ]);

        $nextId = (int) (User::max('IdUsuario') ?? 0) + 1;

        $user = new User;
        $user->IdUsuario = $nextId;
        $user->SIdUsuario = $validated['NombreUsuario'];
        $user->NombreUsuario = $validated['NombreUsuario'];
        $user->SNombre = $validated['SNombre'];
        $user->SMail = $validated['SMail'];
        $user->STelefono = $validated['STelefono'] ?? null;
        $user->SPassword = app(PasswordAes::class)->cifrar($validated['password']);
        $user->EActivo = ($request->input('EActivo') === 'Si' || $request->boolean('EActivo') || ! $request->has('EActivo')) ? 'Si' : 'No';
        $user->FechaRegistro = now();
        $user->FechaHora = now();
        $user->save();

        return back()->with('success', 'Usuario registrado correctamente.');
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $validated = $request->validate([
            'NombreUsuario' => ['required', 'string', 'max:50'],
            'SNombre' => ['required', 'string', 'max:100'],
            'SMail' => ['required', 'email', 'max:150'],
            'STelefono' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:4'],
            'EActivo' => ['nullable'],
        ]);

        $usuario->SIdUsuario = $validated['NombreUsuario'];
        $usuario->NombreUsuario = $validated['NombreUsuario'];
        $usuario->SNombre = $validated['SNombre'];
        $usuario->SMail = $validated['SMail'];
        $usuario->STelefono = $validated['STelefono'] ?? null;
        $usuario->EActivo = ($request->input('EActivo') === 'Si' || $request->boolean('EActivo')) ? 'Si' : 'No';

        if (! empty($validated['password'])) {
            $usuario->SPassword = app(PasswordAes::class)->cifrar($validated['password']);
        }

        $usuario->save();

        return back()->with('success', 'Usuario actualizado correctamente.');
    }
}
