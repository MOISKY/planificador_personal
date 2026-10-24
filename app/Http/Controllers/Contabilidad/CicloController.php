<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Asesor;
use App\Models\Contabilidad\Ciclo;
use App\Models\Contabilidad\Grupo;
use App\Models\Contabilidad\Oportunidad;
use App\Models\Contabilidad\Periodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CicloController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Ciclo::query()
            ->with(['periodo', 'oportunidad', 'grupo', 'asesor'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('periodo', function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%");
                })->orWhereHas('oportunidad', function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%");
                })->orWhereHas('grupo', function ($q) use ($search): void {
                    $q->whereLike('Grupo', "%{$search}%");
                })->orWhereHas('asesor', function ($q) use ($search): void {
                    $q->whereLike('Nombre', "%{$search}%")
                        ->orWhereLike('ApellidoPaterno', "%{$search}%");
                });
            })
            ->orderBy('IdCiclo', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $periodos = Periodo::query()->orderBy('Nombre')->get(['IdPeriodo', 'Nombre']);
        $oportunidades = Oportunidad::query()->orderBy('Nombre')->get(['IdOportunidad', 'Nombre']);
        $grupos = Grupo::query()->orderBy('Grupo')->get(['IdGrupo', 'Grupo']);
        $asesores = Asesor::query()->orderBy('Nombre')->get(['IdAsesor', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        return Inertia::render('contabilidad/catalogos/ciclos/index', [
            'items' => $items,
            'searchValue' => $search,
            'periodos' => $periodos,
            'oportunidades' => $oportunidades,
            'grupos' => $grupos,
            'asesores' => $asesores,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdPeriodo' => ['required', 'integer', 'exists:contabilidad_periodo,IdPeriodo'],
            'IdOportunidad' => ['required', 'integer', 'exists:contabilidad_oportunidades,IdOportunidad'],
            'IdGrupo' => ['required', 'integer', 'exists:contabilidad_grupo,IdGrupo'],
            'IdAsesor' => ['required', 'integer', 'exists:contabilidad_asesor,IdAsesor'],
        ], [], [
            'IdPeriodo' => 'periodo',
            'IdOportunidad' => 'oportunidad',
            'IdGrupo' => 'grupo',
            'IdAsesor' => 'asesor',
        ]);

        Ciclo::create($validated);

        return back()->with('success', 'Ciclo registrado correctamente.');
    }

    public function update(Request $request, Ciclo $ciclo): RedirectResponse
    {
        $validated = $request->validate([
            'IdPeriodo' => ['required', 'integer', 'exists:contabilidad_periodo,IdPeriodo'],
            'IdOportunidad' => ['required', 'integer', 'exists:contabilidad_oportunidades,IdOportunidad'],
            'IdGrupo' => ['required', 'integer', 'exists:contabilidad_grupo,IdGrupo'],
            'IdAsesor' => ['required', 'integer', 'exists:contabilidad_asesor,IdAsesor'],
        ], [], [
            'IdPeriodo' => 'periodo',
            'IdOportunidad' => 'oportunidad',
            'IdGrupo' => 'grupo',
            'IdAsesor' => 'asesor',
        ]);

        $ciclo->update($validated);

        return back()->with('success', 'Ciclo actualizado correctamente.');
    }

    public function destroy(Ciclo $ciclo): RedirectResponse
    {
        $ciclo->delete();

        return back()->with('success', 'Ciclo eliminado correctamente.');
    }
}
