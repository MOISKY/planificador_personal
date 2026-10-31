<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminPersonal;
use App\Models\Admin\AdminProyecto;
use App\Models\Admin\AdminProyectoPersonal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoPersonalController extends Controller
{
    public function index(Request $request, AdminProyecto $proyecto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));

        $proyecto->load('estatusActual');

        $miembros = AdminProyectoPersonal::query()
            ->where('IdProyecto', $proyecto->IdProyecto)
            ->with('personal')
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('personal', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('APaterno', 'ilike', "%{$search}%")
                        ->orWhere('AMaterno', 'ilike', "%{$search}%")
                        ->orWhere('CorreoElectronico', 'ilike', "%{$search}%");
                });
            })
            ->orderByDesc('IdProyectoPersonal')
            ->get();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($miembros);
        }

        $asignadosIds = AdminProyectoPersonal::where('IdProyecto', $proyecto->IdProyecto)
            ->pluck('IdPersonal');

        $personalDisponibles = AdminPersonal::query()
            ->where('EActivo', 'Si')
            ->whereNotIn('IdPersonal', $asignadosIds)
            ->orderBy('Nombre')
            ->get(['IdPersonal', 'Nombre', 'APaterno', 'AMaterno', 'CorreoElectronico', 'Telefono', 'Movil']);

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/personal/index', [
            'proyecto' => $proyecto,
            'miembros' => $miembros,
            'personalDisponibles' => $personalDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, AdminProyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'IdPersonal' => ['required', 'integer', 'exists:admin_personal,IdPersonal'],
        ]);

        $existe = AdminProyectoPersonal::where('IdProyecto', $proyecto->IdProyecto)
            ->where('IdPersonal', $validated['IdPersonal'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'El personal seleccionado ya es miembro de este proyecto.');
        }

        AdminProyectoPersonal::create([
            'IdProyecto' => $proyecto->IdProyecto,
            'IdPersonal' => $validated['IdPersonal'],
        ]);

        return back()->with('success', 'Miembro agregado al proyecto correctamente.');
    }

    public function destroy(AdminProyecto $proyecto, AdminProyectoPersonal $personal): RedirectResponse
    {
        if ($personal->IdProyecto !== $proyecto->IdProyecto) {
            abort(404);
        }

        $personal->delete();

        return back()->with('success', 'Miembro removido del proyecto correctamente.');
    }
}
