<?php

namespace App\Http\Controllers\Desarrollo;

use App\Http\Controllers\Controller;
use App\Models\Desarrollo\Candidato;
use App\Models\Desarrollo\CandidatoTipo;
use App\Models\Desarrollo\Especialidad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CandidatoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $search = trim((string) ($request->input('search') ?? ''));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            $apiItems = Candidato::query()
                ->with(['especialidad', 'candidatoTipo'])
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($q) use ($search): void {
                        $q->where('Nombre', 'ilike', "%{$search}%")
                            ->orWhere('APaterno', 'ilike', "%{$search}%")
                            ->orWhere('AMaterno', 'ilike', "%{$search}%")
                            ->orWhere('CorreoElectronico', 'ilike', "%{$search}%")
                            ->orWhere('Telefono', 'ilike', "%{$search}%")
                            ->orWhere('Movil', 'ilike', "%{$search}%")
                            ->orWhereHas('especialidad', function ($eq) use ($search): void {
                                $eq->where('Nombre', 'ilike', "%{$search}%");
                            })
                            ->orWhereHas('candidatoTipo', function ($tq) use ($search): void {
                                $tq->where('Nombre', 'ilike', "%{$search}%");
                            });
                    });
                })
                ->orderBy('IOrden')
                ->orderBy('APaterno')
                ->orderBy('Nombre')
                ->get();

            return response()->json($apiItems);
        }

        $items = Candidato::query()
            ->with(['especialidad', 'candidatoTipo'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('Nombre', 'ilike', "%{$search}%")
                        ->orWhere('APaterno', 'ilike', "%{$search}%")
                        ->orWhere('AMaterno', 'ilike', "%{$search}%")
                        ->orWhere('CorreoElectronico', 'ilike', "%{$search}%")
                        ->orWhere('Telefono', 'ilike', "%{$search}%")
                        ->orWhere('Movil', 'ilike', "%{$search}%")
                        ->orWhereHas('especialidad', function ($eq) use ($search): void {
                            $eq->where('Nombre', 'ilike', "%{$search}%");
                        })
                        ->orWhereHas('candidatoTipo', function ($tq) use ($search): void {
                            $tq->where('Nombre', 'ilike', "%{$search}%");
                        });
                });
            })
            ->orderBy('IOrden')
            ->orderBy('APaterno')
            ->orderBy('Nombre')
            ->paginate($perPage)
            ->withQueryString();

        $especialidades = Especialidad::query()
            ->orderBy('Nombre')
            ->get(['IdEspecialidad', 'Nombre']);

        $tipos = CandidatoTipo::query()
            ->orderBy('Nombre')
            ->get(['IdCandidatoTipo', 'Nombre']);

        return Inertia::render('desarrollo/catalogos/candidatos/index', [
            'items' => $items,
            'especialidades' => $especialidades,
            'tipos' => $tipos,
            'searchValue' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'APaterno' => ['required', 'string', 'max:100'],
            'AMaterno' => ['nullable', 'string', 'max:100'],
            'Telefono' => ['nullable', 'string', 'max:20'],
            'Movil' => ['nullable', 'string', 'max:20'],
            'IOrden' => ['nullable', 'integer', 'min:0'],
            'CorreoElectronico' => ['nullable', 'email', 'max:150'],
            'UrlCv' => ['nullable', 'string', 'max:1000'],
            'EActivo' => ['nullable'],
            'IdEspecialidad' => ['required', 'integer', 'exists:admin_especialidad,IdEspecialidad'],
            'IdCandidatoTipo' => ['nullable', 'integer', 'exists:admin_candidato_tipo,IdCandidatoTipo'],
        ]);

        $validated['IOrden'] = (int) ($validated['IOrden'] ?? 0);
        $validated['EActivo'] = ($request->input('EActivo') === 'Si' || $request->boolean('EActivo') || ! $request->has('EActivo')) ? 'Si' : 'No';

        Candidato::create($validated);

        return back()->with('success', 'Candidato registrado correctamente.');
    }

    public function update(Request $request, Candidato $candidato): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:100'],
            'APaterno' => ['required', 'string', 'max:100'],
            'AMaterno' => ['nullable', 'string', 'max:100'],
            'Telefono' => ['nullable', 'string', 'max:20'],
            'Movil' => ['nullable', 'string', 'max:20'],
            'IOrden' => ['nullable', 'integer', 'min:0'],
            'CorreoElectronico' => ['nullable', 'email', 'max:150'],
            'UrlCv' => ['nullable', 'string', 'max:1000'],
            'EActivo' => ['nullable'],
            'IdEspecialidad' => ['required', 'integer', 'exists:admin_especialidad,IdEspecialidad'],
            'IdCandidatoTipo' => ['nullable', 'integer', 'exists:admin_candidato_tipo,IdCandidatoTipo'],
        ]);

        $validated['IOrden'] = (int) ($validated['IOrden'] ?? 0);
        $validated['EActivo'] = ($request->input('EActivo') === 'Si' || $request->boolean('EActivo')) ? 'Si' : 'No';

        $candidato->update($validated);

        return back()->with('success', 'Candidato actualizado correctamente.');
    }

    public function destroy(Candidato $candidato): RedirectResponse
    {
        $candidato->delete();

        return back()->with('success', 'Candidato eliminado correctamente.');
    }
}
