<?php

namespace App\Http\Controllers\Contabilidad;

use App\Http\Controllers\Controller;
use App\Models\Contabilidad\Alumno;
use App\Models\Contabilidad\Modulo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuloController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $perPage = max(1, (int) $request->integer('per_page', 10));

        $items = Modulo::query()
            ->withCount(['retos', 'lecciones'])
            ->with([
                'retos.recursos',
                'retos.actividadesAlumnos.alumno',
                'lecciones.recursos',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereLike('Modulo', "%{$search}%");
            })
            ->orderBy('IdModulo', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $alumnos = Alumno::query()
            ->orderBy('Nombre')
            ->get(['IdAlumno', 'Nombre', 'ApellidoPaterno', 'ApellidoMaterno']);

        return Inertia::render('contabilidad/modulos/index', [
            'items' => $items,
            'searchValue' => $search,
            'alumnos' => $alumnos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'Modulo' => 'nombre del módulo',
        ]);

        Modulo::create($validated);

        return back()->with('success', 'Módulo registrado correctamente.');
    }

    public function update(Request $request, Modulo $modulo): RedirectResponse
    {
        $validated = $request->validate([
            'Modulo' => ['required', 'string', 'max:150'],
        ], [], [
            'Modulo' => 'nombre del módulo',
        ]);

        $modulo->update($validated);

        return back()->with('success', 'Módulo actualizado correctamente.');
    }

    public function destroy(Modulo $modulo): RedirectResponse
    {
        $modulo->delete();

        return back()->with('success', 'Módulo eliminado correctamente.');
    }
}
