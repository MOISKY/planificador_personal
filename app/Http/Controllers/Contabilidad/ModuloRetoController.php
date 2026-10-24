<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\ModuloReto;
use App\Models\Contabilidad\ModuloRetoAlumno;
use App\Models\Contabilidad\ModuloRetoRecurso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModuloRetoController extends Controller
{
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
