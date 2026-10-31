<?php

namespace App\Http\Controllers\Desarrollo\GestionProyectos;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminProyectoActividad;
use App\Models\Admin\AdminProyectoActividadAdicional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProyectoActividadAdicionalController extends Controller
{
    public function store(Request $request, AdminProyectoActividad $actividad): RedirectResponse
    {
        $validated = $request->validate([
            'Descripcion' => ['nullable', 'string'],
            'UrlRecurso' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['IdActividad'] = $actividad->IdActividad;

        AdminProyectoActividadAdicional::create($validated);

        return back()->with('success', 'Recurso adicional agregado a la actividad.');
    }

    public function destroy(AdminProyectoActividadAdicional $adicional): RedirectResponse
    {
        $adicional->delete();

        return back()->with('success', 'Recurso adicional eliminado.');
    }
}
