<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloLeccion;
use App\Models\Contabilidad\ModuloLeccionRecurso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuloLeccionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'IdModulo' => ['required', 'integer', 'exists:contabilidad_modulo,IdModulo'],
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'IdModulo' => 'módulo',
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        ModuloLeccion::create($validated);

        return back()->with('success', 'Lección registrada correctamente.');
    }

    public function update(Request $request, ModuloLeccion $leccion): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'UrlLeccion' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre de la lección',
            'UrlLeccion' => 'URL de la lección',
        ]);

        $leccion->update($validated);

        return back()->with('success', 'Lección actualizada correctamente.');
    }

    public function destroy(ModuloLeccion $leccion): RedirectResponse
    {
        $leccion->delete();

        return back()->with('success', 'Lección eliminada correctamente.');
    }

    // --- RECURSOS DENTRO DE LECCIONES ---

    public function storeRecurso(Request $request, ModuloLeccion $leccion): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
        ]);

        $leccion->recursos()->create($validated);

        return back()->with('success', 'Recurso de lección agregado.');
    }

    public function updateRecurso(Request $request, ModuloLeccionRecurso $recurso): RedirectResponse
    {
        $validated = $request->validate([
            'Nombre' => ['required', 'string', 'max:200'],
            'URLRecurso' => ['required', 'string', 'max:1000'],
        ], [], [
            'Nombre' => 'nombre del recurso',
            'URLRecurso' => 'URL del recurso',
        ]);

        $recurso->update($validated);

        return back()->with('success', 'Recurso de lección actualizado.');
    }

    public function destroyRecurso(ModuloLeccionRecurso $recurso): RedirectResponse
    {
        $recurso->delete();

        return back()->with('success', 'Recurso de lección eliminado.');
    }
}
