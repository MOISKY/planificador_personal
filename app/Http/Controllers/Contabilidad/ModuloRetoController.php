<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloReto;
use App\Models\Contabilidad\ModuloRetoAlumno;
use App\Models\Contabilidad\ModuloRetoRecurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuloRetoController extends Controller
{
    /**
     * Lista de retos (Web / Lectura).
     */
    public function index(Request $request): JsonResponse
    {
        $idModulo = $request->integer('IdModulo');
        $nombre = trim((string) ($request->input('Nombre') ?? $request->input('search') ?? ''));

        $items = ModuloReto::query()
            ->when($idModulo > 0, function ($query) use ($idModulo): void {
                $query->where('IdModulo', $idModulo);
            })
            ->when($nombre !== '', function ($query) use ($nombre): void {
                $query->whereLike('Nombre', "%{$nombre}%");
            })
            ->orderBy('IdReto', 'asc')
            ->get()
            ->map(function (ModuloReto $item): array {
                return [
                    'id' => (int) $item->IdReto,
                    'IdReto' => (int) $item->IdReto,
                    'IdModulo' => (int) $item->IdModulo,
                    'Nombre' => $item->Nombre,
                    'UrlReto' => $item->UrlReto,
                    'FechaRegistro' => $item->FechaRegistro,
                ];
            });

        return response()->json($items);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:contabilidad_modulo,IdModulo'],
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlReto' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'IdModulo' => 'módulo',
            'Nombre' => 'nombre del reto',
            'UrlReto' => 'URL del reto',
        ]);

        ModuloReto::create($validated);

        return back()->with('success', 'Reto registrado correctamente.');
    }

    public function update(Request $request, ModuloReto $reto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlReto' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre del reto',
            'UrlReto' => 'URL del reto',
        ]);

        $reto->update($validated);

        return back()->with('success', 'Reto actualizado correctamente.');
    }

    public function destroy(ModuloReto $reto): RedirectResponse
    {
        $reto->delete();

        return back()->with('success', 'Reto eliminado correctamente.');
    }

    // --- RECURSOS DENTRO DE RETOS ---

    /**
     * Lista de recursos asociados a un reto.
     */
    public function indexRecurso(Request $request, ?ModuloReto $reto = null): JsonResponse
    {
        $idReto = $reto?->IdReto ?? ($request->integer('IdReto') ?: null);

        $items = ModuloRetoRecurso::query()
            ->when($idReto !== null, function ($query) use ($idReto): void {
                $query->where('IdReto', $idReto);
            })
            ->orderBy('IdRetoRecurso', 'asc')
            ->get()
            ->map(function (ModuloRetoRecurso $recurso): array {
                return [
                    'id' => (int) $recurso->IdRetoRecurso,
                    'IdRetoRecurso' => (int) $recurso->IdRetoRecurso,
                    'IdReto' => (int) $recurso->IdReto,
                    'IdModuloDetalle' => $recurso->IdModuloDetalle,
                    'Nombre' => $recurso->Nombre,
                    'URLRecurso' => $recurso->URLRecurso,
                    'FechaRegistro' => $recurso->FechaRegistro,
                ];
            });

        return response()->json($items);
    }

    public function storeRecurso(Request $request, ModuloReto $reto): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
            'IdModuloDetalle' => ['nullable', 'integer'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
            'IdModuloDetalle' => 'módulo detalle',
        ]);

        $reto->recursos()->create($validated);

        return back()->with('success', 'Recurso de reto agregado.');
    }

    public function updateRecurso(Request $request, ModuloRetoRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
            'IdModuloDetalle' => ['nullable', 'integer'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
            'IdModuloDetalle' => 'módulo detalle',
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso de reto actualizado.');
    }

    public function destroyRecurso(ModuloRetoRecurso $recurso): RedirectResponse
    {
        $recurso->delete();

        return back()->with('success', 'Recurso de reto eliminado.');
    }

    // --- ACTIVIDADES ALUMNOS DENTRO DE RETOS ---

    /**
     * Lista de actividades de alumnos asociadas a un reto.
     */
    public function indexAlumno(Request $request, ?ModuloReto $reto = null): JsonResponse
    {
        $idReto = $reto?->IdReto ?? ($request->integer('IdReto') ?: null);
        $idAlumno = $request->integer('IdAlumno') ?: null;

        $items = ModuloRetoAlumno::query()
            ->with(['alumno:IdAlumno,Nombre,ApellidoPaterno,ApellidoMaterno'])
            ->when($idReto !== null, function ($query) use ($idReto): void {
                $query->where('IdReto', $idReto);
            })
            ->when($idAlumno !== null, function ($query) use ($idAlumno): void {
                $query->where('IdAlumno', $idAlumno);
            })
            ->orderBy('IdRetoAlumno', 'asc')
            ->get()
            ->map(function (ModuloRetoAlumno $actividad): array {
                return [
                    'id' => (int) $actividad->IdRetoAlumno,
                    'IdRetoAlumno' => (int) $actividad->IdRetoAlumno,
                    'IdReto' => (int) $actividad->IdReto,
                    'IdAlumno' => (int) $actividad->IdAlumno,
                    'IdRetoRecurso' => $actividad->IdRetoRecurso,
                    'IdModuloDetalle' => $actividad->IdModuloDetalle,
                    'Nombre' => $actividad->Nombre,
                    'URLRecurso' => $actividad->URLRecurso,
                    'FechaRegistro' => $actividad->FechaRegistro,
                    'alumno' => $actividad->alumno,
                ];
            });

        return response()->json($items);
    }

    public function storeAlumno(Request $request, ModuloReto $reto): RedirectResponse
    {
        $validated = $request->validate([
            'IdAlumno' => ['required', 'integer', 'exists:contabilidad_alumno,IdAlumno'],
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
            'IdRetoRecurso' => ['nullable', 'integer', 'exists:contabilidad_modulo_reto_recurso,IdRetoRecurso'],
            'IdModuloDetalle' => ['nullable', 'integer'],
        ], [], [
            'IdAlumno' => 'alumno',
            'Nombre' => 'nombre de la actividad',
            'URLRecurso' => 'URL del recurso entregado',
            'IdRetoRecurso' => 'recurso asociado',
            'IdModuloDetalle' => 'módulo detalle',
        ]);

        $reto->actividadesAlumnos()->create($validated);

        return back()->with('success', 'Actividad de alumno registrada.');
    }

    public function updateAlumno(Request $request, ModuloRetoAlumno $alumnoActividad): RedirectResponse
    {
        $validated = $request->validate([
            'IdAlumno' => ['required', 'integer', 'exists:contabilidad_alumno,IdAlumno'],
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
            'IdRetoRecurso' => ['nullable', 'integer', 'exists:contabilidad_modulo_reto_recurso,IdRetoRecurso'],
            'IdModuloDetalle' => ['nullable', 'integer'],
        ], [], [
            'IdAlumno' => 'alumno',
            'Nombre' => 'nombre de la actividad',
            'URLRecurso' => 'URL del recurso entregado',
            'IdRetoRecurso' => 'recurso asociado',
            'IdModuloDetalle' => 'módulo detalle',
        ]);

        $alumnoActividad->update($validated);

        return back()->with('success', 'Actividad de alumno actualizada.');
    }

    public function destroyAlumno(ModuloRetoAlumno $alumnoActividad): RedirectResponse
    {
        $alumnoActividad->delete();

        return back()->with('success', 'Actividad de alumno eliminada.');
    }
}
