<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminModulo;
use App\Models\Admin\AdminProyecto;
use App\Models\Admin\AdminProyectoModulo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoModuloController extends Controller
{
    public function index(Request $request, AdminProyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));

        $proyecto->load('estatusActual');

        $modulos = AdminProyectoModulo::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with('modulo')
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('modulo', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Codigo', 'ilike', "%{$search}%");
                });
            })
            ->orderByDesc('IdProyectoModulo')
            ->get();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($modulos);
        }

        $asignadosIds = AdminProyectoModulo::where('IdProyecto', $proyecto->IdProyecto)
            ->pluck('IdModulo');

        $modulosDisponibles = AdminModulo::query()
            ->where('EActivo', 'Si')
            ->whereNotIn('IdModulo', $asignadosIds)
            ->orderBy('Nombre')
            ->get(['IdModulo', 'Codigo', 'Nombre']);

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/modulos/index', [
            'proyecto' => $proyecto,
            'modulos' => $modulos,
            'modulosDisponibles' => $modulosDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, AdminProyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:admin_modulos,IdModulo'],
        ]);

        $existe = AdminProyectoModulo::where('IdProyecto', $proyecto->IdProyecto)
            ->where('IdModulo', $validated['IdModulo'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'El módulo seleccionado ya está asignado a este proyecto.');
        }

        AdminProyectoModulo::create([
            'IdProyecto' => $proyecto->IdProyecto,
            'IdModulo' => $validated['IdModulo'],
        ]);

        return back()->with('success', 'Módulo vinculado al proyecto correctamente.');
    }

    public function destroy(AdminProyecto $proyecto, AdminProyectoModulo $modulo): RedirectResponse
    {
        if ($modulo->IdProyecto !== $proyecto->IdProyecto) {
            abort(404);
        }

        $modulo->delete();

        return back()->with('success', 'Módulo desvinculado del proyecto correctamente.');
    }
}
