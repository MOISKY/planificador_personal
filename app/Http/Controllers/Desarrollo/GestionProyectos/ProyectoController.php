<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminKardexProyectoEstatus;
use App\Models\Admin\AdminModulo;
use App\Models\Admin\AdminPersonal;
use App\Models\Admin\AdminProyecto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = AdminProyecto::query()
            ->with([
                'estatusActual',
                'estatusKardex',
                'miembros.personal',
                'modulos.modulo',
            ])
            ->withCount(['miembros', 'modulos', 'actividades'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('Descripcion', 'ilike', "%{$search}%")
                        ->orWhere('Duracion', 'ilike', "%{$search}%");
                });
            })
            ->orderByDesc('IdProyecto');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        // Catalogos auxiliares para asignación rápida en Drawers
        $personalDisponibles = AdminPersonal::query()
            ->where('EActivo', 'Si')
            ->orderBy('Nombre')
            ->get(['IdPersonal', 'Nombre', 'APaterno', 'AMaterno', 'CorreoElectronico']);

        $modulosDisponibles = AdminModulo::query()
            ->where('EActivo', 'Si')
            ->orderBy('Nombre')
            ->get(['IdModulo', 'Codigo', 'Nombre']);

        return Inertia::render('desarrollo/gestion-proyectos/proyectos/index', [
            'items' => $items,
            'personalDisponibles' => $personalDisponibles,
            'modulosDisponibles' => $modulosDisponibles,
            'estatusesDisponibles' => AdminKardexProyectoEstatus::ESTATUSES,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaInicio' => ['nullable', 'date'],
            'Duracion' => ['nullable', 'string', 'max:100'],
        ]);

        $proyecto = AdminProyecto::create($validated);

        return back()->with('success', "Proyecto \"{$proyecto->Nombre}\" registrado correctamente.");
    }

    public function update(Request $request, AdminProyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'Descripcion' => ['nullable', 'string'],
            'FechaInicio' => ['nullable', 'date'],
            'Duracion' => ['nullable', 'string', 'max:100'],
        ]);

        $proyecto->update($validated);

        return back()->with('success', "Proyecto \"{$proyecto->Nombre}\" actualizado correctamente.");
    }

    public function destroy(AdminProyecto $proyecto): RedirectResponse
    {
        $nombre = $proyecto->Nombre;
        $proyecto->delete();

        return back()->with('success', "Proyecto \"{$nombre}\" eliminado correctamente.");
    }

    public function cambiarEstatus(Request $request, AdminProyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'Estatus' => ['required', 'string', 'in:'.implode(',', AdminKardexProyectoEstatus::ESTATUSES)],
        ]);

        $proyecto->estatusKardex()->create([
            'Estatus' => $validated['Estatus'],
        ]);

        return back()->with('success', "Estatus de \"{$proyecto->Nombre}\" actualizado a \"{$validated['Estatus']}\".");
    }
}
