<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Alumno;
use App\Models\Ingles\Grupo;
use App\Models\Ingles\GrupoAlumno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoAlumnoController extends Controller
{
    public function index(Request $request, Grupo $grupo): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = GrupoAlumno::query()
            ->where('IdGrupo', $grupo->IdGrupo)
            ->with(['alumno'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('alumno', function ($sub) use ($search): void {
                    $sub->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoPaterno', 'ilike', "%{$search}%")
                        ->orWhere('ApellidoMaterno', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('IdGrupoAlumno', 'desc');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $alumnosDisponibles = Alumno::query()
            ->whereNotIn('IdAlumno', function ($sub) use ($grupo): void {
                $sub->select('IdAlumno')
                    ->from('ingles_grupo_alumno')
                    ->where('IdGrupo', $grupo->IdGrupo);
            })
            ->orderBy('ApellidoPaterno')
            ->orderBy('Nombre')
            ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        $grupo->load(['periodo', 'materia', 'asesor']);

        return Inertia::render('ingles/grupos/alumnos/index', [
            'grupo' => $grupo,
            'items' => $items,
            'alumnosDisponibles' => $alumnosDisponibles,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request, Grupo $grupo): RedirectResponse
    {
        $validated = $request->validate([
            'IdAlumno' => ['required', 'integer', 'exists:ingles_alumno,IdAlumno'],
        ]);

        $validated['IdGrupo'] = $grupo->IdGrupo;

        $existe = GrupoAlumno::where('IdGrupo', $grupo->IdGrupo)
            ->where('IdAlumno', $validated['IdAlumno'])
            ->exists();

        if ($existe) {
            return back()->with('error', 'El alumno ya se encuentra asignado a este grupo.');
        }

        GrupoAlumno::create($validated);

        return back()->with('success', 'Alumno inscrito al grupo correctamente.');
    }

    public function destroy(GrupoAlumno $grupoAlumno): RedirectResponse
    {
        $grupoAlumno->delete();

        return back()->with('success', 'Alumno dado de baja del grupo.');
    }
}

