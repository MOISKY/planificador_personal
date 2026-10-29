<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\Asesor;
use App\Models\Ingles\Grupo;
use App\Models\Ingles\Materia;
use App\Models\Ingles\Periodo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrupoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $idPeriodo = $request->integer('IdPeriodo') ?: null;
        $idMateria = $request->integer('IdMateria') ?: null;
        $idAsesor = $request->integer('IdAsesor') ?: null;
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $query = Grupo::query()
            ->with(['periodo', 'materia', 'asesor'])
            ->withCount(['alumnos', 'actividades'])
            ->when($idPeriodo !== null, fn ($q) => $q->where('IdPeriodo', $idPeriodo))
            ->when($idMateria !== null, fn ($q) => $q->where('IdMateria', $idMateria))
            ->when($idAsesor !== null, fn ($q) => $q->where('IdAsesor', $idAsesor))
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('Grupo', 'ilike', "%{$search}%")
                        ->orWhereHas('materia', fn ($m) => $m->where('Nombre', 'ilike', "%{$search}%"))
                        ->orWhereHas('asesor', fn ($a) => $a->where('Nombre', 'ilike', "%{$search}%")->orWhere('ApellidoPaterno', 'ilike', "%{$search}%"));
                });
            })
            ->orderBy('Grupo');

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($query->get());
        }

        $items = $query->paginate($perPage)->withQueryString();

        $periodos = Periodo::query()->orderBy('FechaInicio', 'desc')->get(['IdPeriodo', 'Nombre']);
        $materias = Materia::query()->orderBy('Nombre')->get(['IdMateria', 'Nombre']);
        $asesores = Asesor::query()->orderBy('ApellidoPaterno')->get(['IdAsesor', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        return Inertia::render('ingles/grupos/index', [
            'items' => $items,
            'periodos' => $periodos,
            'materias' => $materias,
            'asesores' => $asesores,
            'searchValue' => $search,
            'idPeriodo' => $idPeriodo,
            'idMateria' => $idMateria,
            'idAsesor' => $idAsesor,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Grupo' => ['required', 'string', 'max:50'],
            'IdPeriodo' => ['required', 'integer', 'exists:ingles_periodo,IdPeriodo'],
            'IdMateria' => ['required', 'integer', 'exists:ingles_materia,IdMateria'],
            'IdAsesor' => ['required', 'integer', 'exists:ingles_asesor,IdAsesor'],
        ]);

        Grupo::create($validated);

        return back()->with('success', 'Grupo registrado correctamente.');
    }

    public function update(Request $request, Grupo $grupo): RedirectResponse
    {
        $validated = $request->validate([
            'Grupo' => ['required', 'string', 'max:50'],
            'IdPeriodo' => ['required', 'integer', 'exists:ingles_periodo,IdPeriodo'],
            'IdMateria' => ['required', 'integer', 'exists:ingles_materia,IdMateria'],
            'IdAsesor' => ['required', 'integer', 'exists:ingles_asesor,IdAsesor'],
        ]);

        $grupo->update($validated);

        return back()->with('success', 'Grupo actualizado correctamente.');
    }

    public function destroy(Grupo $grupo): RedirectResponse
    {
        $grupo->alumnos()->delete();
        $grupo->actividades()->delete();
        $grupo->delete();

        return back()->with('success', 'Grupo eliminado correctamente.');
    }
}

