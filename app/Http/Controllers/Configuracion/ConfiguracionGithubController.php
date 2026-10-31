<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminUsuarioConfiguracionGithub;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionGithubController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminUsuarioConfiguracionGithub::query()
            ->with(['usuario:IdUsuario,NombreUsuario,SNombre,SMail'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where('GITHUB_USERNAME', 'ilike', "%{$search}%")
                    ->orWhereHas('usuario', function ($u) use ($search): void {
                        $u->where('SNombre', 'ilike', "%{$search}%")
                            ->orWhere('NombreUsuario', 'ilike', "%{$search}%")
                            ->orWhere('SMail', 'ilike', "%{$search}%");
                    });
            })
            ->orderByDesc('IdUsuarioConfiguracionGithub');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $usuarios = User::query()
            ->where('EActivo', 'Si')
            ->orderBy('SNombre')
            ->get(['IdUsuario', 'NombreUsuario', 'SNombre', 'SMail']);

        return Inertia::render('configuracion/github/index', [
            'items' => $items,
            'usuarios' => $usuarios,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdUsuario' => ['required', 'integer', 'exists:admin_usuarios,IdUsuario'],
            'GITHUB_USERNAME' => ['required', 'string', 'max:100'],
            'GITHUB_TOKEN' => ['required', 'string'],
        ]);

        AdminUsuarioConfiguracionGithub::create($validated);

        return back()->with('success', 'Configuración de GitHub guardada correctamente.');
    }

    public function update(Request $request, AdminUsuarioConfiguracionGithub $github): RedirectResponse
    {
        $validated = $request->validate([
            'IdUsuario' => ['required', 'integer', 'exists:admin_usuarios,IdUsuario'],
            'GITHUB_USERNAME' => ['required', 'string', 'max:100'],
            'GITHUB_TOKEN' => ['nullable', 'string'],
        ]);

        if (empty($validated['GITHUB_TOKEN'])) {
            unset($validated['GITHUB_TOKEN']);
        }

        $github->update($validated);

        return back()->with('success', 'Configuración de GitHub actualizada correctamente.');
    }

    public function destroy(AdminUsuarioConfiguracionGithub $github): RedirectResponse
    {
        $github->delete();

        return back()->with('success', 'Configuración de GitHub eliminada correctamente.');
    }
}
