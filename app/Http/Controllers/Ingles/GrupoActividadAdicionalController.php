<?php

namespace App\Http\Controllers\Ingles;

use App\Http\Controllers\Controller;
use App\Models\Ingles\GrupoActividad;
use App\Models\Ingles\GrupoActividadAdicional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GrupoActividadAdicionalController extends Controller
{
    public function store(Request $request, GrupoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Descripcion' => ['required', 'string'],
            'UrlRecurso' => ['required', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        GrupoActividadAdicional::create($validated);

        return back()->with('success', 'Actividad adicional agregada correctamente.');
    }

    public function destroy(GrupoActividadAdicional $adicional): RedirectResponse
    {
        $adicional->delete();

        return back()->with('success', 'Actividad adicional eliminada correctamente.');
    }
}

