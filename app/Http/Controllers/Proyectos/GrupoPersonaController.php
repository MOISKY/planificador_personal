<?php

namespace App\Http\Controllers\Proyectos;

use App\Http\Controllers\Controller;
use App\Models\Proyectos\GrupoPersona;
use App\Models\Proyectos\Persona;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoPersonaController extends Controller
{
    public function index(Request $request, Proyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoPersona::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with(['persona', 'rol'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('persona', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%")
                        ->orWhere('correoElectronico', 'ilike', "%{$search}%");
                })->orWhereHas('rol', function ($sub) use ($search): void {
                    $sub->where('Rol', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('IdGrupoPersona', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $personasDisponibles = Persona::query()
            ->whereNotIn('IdPersona', function ($sub) use ($proyecto): void {
                $sub->select('IdPersona')
                    ->from('proyectos_grupo_persona')
                    ->where('IdProyecto', $proyecto->IdProyecto);
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->get();

        $rolesDisponibles = Rol::query()
            ->orderBy('Rol')
            ->get();

        return Inertia::render('proyectos/proyectos/personas/index', [
            'proyecto' => $proyecto,
            'items' => $items,
            'personasDisponibles' => $personasDisponibles,
            'rolesDisponibles' => $rolesDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'IdPersona' => ['required', 'integer', 'exists:proyectos_persona,IdPersona'],
            'IdRol' => ['required', 'integer', 'exists:proyectos_rol,IdRol'],
        ]);

        $validated['IdProyecto'] = $proyecto->IdProyecto;

        $existe = GrupoPersona::where('IdProyecto', $proyecto->IdProyecto)
            ->where('IdPersona', $validated['IdPersona'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'La persona ya se encuentra asignada a este proyecto.');
        }

        GrupoPersona::create($validated);

        return back()->with('success', 'Persona asignada al proyecto correctamente.');
    }

    public function update(Request $request, GrupoPersona $grupoPersona): RedirectResponse
    {
        $validated = $request->validate([
            'IdRol' => ['required', 'integer', 'exists:proyectos_rol,IdRol'],
        ]);

        $grupoPersona->update($validated);

        return back()->with('success', 'Rol de la persona actualizado correctamente.');
    }

    public function destroy(GrupoPersona $grupoPersona): RedirectResponse
    {
        $grupoPersona->delete();

        return back()->with('success', 'Persona removida del proyecto.');
    }
}

