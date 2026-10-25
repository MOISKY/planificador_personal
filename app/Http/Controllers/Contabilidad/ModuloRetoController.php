<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Alumno;
use App\Models\Contabilidad\Ciclo;
use App\Models\Contabilidad\Modulo;
use App\Models\Contabilidad\ModuloReto;
use App\Models\Contabilidad\ModuloRetoAlumno;
use App\Models\Contabilidad\ModuloRetoRecurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuloRetoController extends Controller
{
    /**
     * Lista de retos (Página Inertia o JSON si es API).
     */
    public function index(Request $request): Response|JsonResponse
    {
        $idModulo = $request->integer('IdModulo');
        $idCiclo = $request->integer('IdCiclo');
        $search = trim((string) ($request->input('search') ?? $request->input('Nombre') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = ModuloReto::query()
                ->when($idModulo > 0, function ($query) use ($idModulo): void {
                    $query->where('IdModulo', $idModulo);
                })
                ->when($search !== '', function ($query) use ($search): void {
                    $query->whereLike('Nombre', "%{$search}%");
                })
                ->orderBy('IdReto', 'asc')
                ->get()
                ->map(fn (ModuloReto $item): array => [
                    'id' => (int) $item->IdReto,
                    'IdReto' => (int) $item->IdReto,
                    'IdModulo' => (int) $item->IdModulo,
                    'Nombre' => $item->Nombre,
                    'UrlReto' => $item->UrlReto,
                    'FechaRegistro' => $item->FechaRegistro,
                ]);

            return response()->json($apiItems);
        }

        $items = ModuloReto::query()
            ->with(['modulo:IdModulo,Modulo'])
            ->withCount(['recursos', 'actividadesAlumnos'])
            ->when($idModulo > 0, function ($query) use ($idModulo): void {
                $query->where('IdModulo', $idModulo);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdReto', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $modulos = Modulo::query()
            ->orderBy('Modulo')
            ->get(['IdModulo', 'Modulo']);

        $ciclos = Ciclo::query()
            ->with(['periodo', 'oportunidad', 'grupo', 'asesor'])
            ->orderBy('IdCiclo', 'desc')
            ->get();

        $moduloSeleccionado = $idModulo > 0 ? Modulo::find($idModulo) : null;

        return Inertia::render('contabilidad/retos/index', [
            'items' => $items,
            'modulos' => $modulos,
            'ciclos' => $ciclos,
            'moduloSeleccionado' => $moduloSeleccionado,
            'idModulo' => $idModulo > 0 ? $idModulo : null,
            'idCiclo' => $idCiclo > 0 ? $idCiclo : null,
            'searchValue' => $search,
        ]);
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
    public function indexRecurso(Request $request, ModuloReto $reto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? $request->input('Nombre') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = ModuloRetoRecurso::query()
                ->where('IdReto', $reto->IdReto)
                ->when($search !== '', function ($query) use ($search): void {
                    $query->whereLike('Nombre', "%{$search}%");
                })
                ->orderBy('IdRetoRecurso', 'asc')
                ->get()
                ->map(fn (ModuloRetoRecurso $recurso): array => [
                    'id' => (int) $recurso->IdRetoRecurso,
                    'IdRetoRecurso' => (int) $recurso->IdRetoRecurso,
                    'IdReto' => (int) $recurso->IdReto,
                    'IdModuloDetalle' => $recurso->IdModuloDetalle,
                    'Nombre' => $recurso->Nombre,
                    'URLRecurso' => $recurso->URLRecurso,
                    'FechaRegistro' => $recurso->FechaRegistro,
                ]);

            return response()->json($apiItems);
        }

        $items = ModuloRetoRecurso::query()
            ->where('IdReto', $reto->IdReto)
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Nombre', "%{$search}%");
            })
            ->orderBy('IdRetoRecurso', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $reto->load('modulo:IdModulo,Modulo');

        return Inertia::render('contabilidad/retos/recursos/index', [
            'reto' => $reto,
            'items' => $items,
            'searchValue' => $search,
        ]);
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
    public function indexAlumno(Request $request, ModuloReto $reto): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? $request->input('Nombre') ?? ''));
        $idAlumno = $request->integer('IdAlumno') ?: null;
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = ModuloRetoAlumno::query()
                ->with(['alumno:IdAlumno,Nombre,ApellidoPaterno,ApellidoMaterno'])
                ->where('IdReto', $reto->IdReto)
                ->when($idAlumno !== null, function ($query) use ($idAlumno): void {
                    $query->where('IdAlumno', $idAlumno);
                })
                ->when($search !== '', function ($query) use ($search): void {
                    $query->whereLike('Nombre', "%{$search}%");
                })
                ->orderBy('IdRetoAlumno', 'asc')
                ->get()
                ->map(fn (ModuloRetoAlumno $actividad): array => [
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
                ]);

            return response()->json($apiItems);
        }

        $items = ModuloRetoAlumno::query()
            ->with([
                'alumno:IdAlumno,Nombre,ApellidoPaterno,ApellidoMaterno',
                'recursoAsociado:IdRetoRecurso,Nombre',
            ])
            ->where('IdReto', $reto->IdReto)
            ->when($idAlumno !== null, function ($query) use ($idAlumno): void {
                $query->where('IdAlumno', $idAlumno);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereHas('alumno', function ($aq) use ($search): void {
                            $aq->whereLike('Nombre', "%{$search}%")
                                ->orWhereLike('ApellidoPaterno', "%{$search}%")
                                ->orWhereLike('ApellidoMaterno', "%{$search}%");
                        });
                });
            })
            ->orderBy('IdRetoAlumno', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $reto->load('modulo:IdModulo,Modulo');

        $alumnos = Alumno::query()
            ->orderBy('Nombre')
            ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        $recursos = ModuloRetoRecurso::query()
            ->where('IdReto', $reto->IdReto)
            ->orderBy('Nombre')
            ->get(['IdRetoRecurso', 'Nombre']);

        return Inertia::render('contabilidad/retos/alumnos/index', [
            'reto' => $reto,
            'items' => $items,
            'alumnos' => $alumnos,
            'recursos' => $recursos,
            'searchValue' => $search,
        ]);
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
