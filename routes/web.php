<?php

use App\Http\Controllers\Cine\CineDashboardController;
use App\Http\Controllers\Cine\DirectorController;
use App\Http\Controllers\Cine\ProduccionComentarioController;
use App\Http\Controllers\Cine\ProduccionController;
use App\Http\Controllers\Cine\ProduccionEstatusController;
use App\Http\Controllers\Cine\ProduccionRecursoController;
use App\Http\Controllers\Cine\ProduccionSeguimientoController;
use App\Http\Controllers\Cine\TipoOpinionController;
use App\Http\Controllers\Cine\TmdbController;
use App\Http\Controllers\Contabilidad\AlumnoController;
use App\Http\Controllers\Contabilidad\AsesorController;
use App\Http\Controllers\Contabilidad\CicloController;
use App\Http\Controllers\Contabilidad\ContabilidadDashboardController;
use App\Http\Controllers\Contabilidad\GrupoController;
use App\Http\Controllers\Contabilidad\ModuloController;
use App\Http\Controllers\Contabilidad\ModuloLeccionController;
use App\Http\Controllers\Contabilidad\ModuloLeccionEstatusController;
use App\Http\Controllers\Contabilidad\ModuloRetoController;
use App\Http\Controllers\Contabilidad\ModuloRetoRecursoEstatusController;
use App\Http\Controllers\Contabilidad\OportunidadController;
use App\Http\Controllers\Contabilidad\PeriodoController;
use App\Http\Controllers\EjemploController;
use App\Http\Controllers\GitHubConsultorController;
use App\Http\Controllers\GoogleDriveController;
use App\Http\Controllers\Ingles\AlumnoController as InglesAlumnoController;
use App\Http\Controllers\Ingles\AsesorController as InglesAsesorController;
use App\Http\Controllers\Ingles\GrupoActividadAdicionalController as InglesGrupoActividadAdicionalController;
use App\Http\Controllers\Ingles\GrupoActividadController as InglesGrupoActividadController;
use App\Http\Controllers\Ingles\GrupoActividadEquipoController as InglesGrupoActividadEquipoController;
use App\Http\Controllers\Ingles\GrupoActividadEstatusController as InglesGrupoActividadEstatusController;
use App\Http\Controllers\Ingles\GrupoActividadRecursoController as InglesGrupoActividadRecursoController;
use App\Http\Controllers\Ingles\GrupoActividadRecursoEstatusController as InglesGrupoActividadRecursoEstatusController;
use App\Http\Controllers\Ingles\GrupoAlumnoController as InglesGrupoAlumnoController;
use App\Http\Controllers\Ingles\GrupoController as InglesGrupoController;
use App\Http\Controllers\Ingles\MateriaController as InglesMateriaController;
use App\Http\Controllers\Ingles\MateriaRecursoController as InglesMateriaRecursoController;
use App\Http\Controllers\Ingles\PeriodoController as InglesPeriodoController;
use App\Http\Controllers\Proyectos\GrupoActividadEquipoController as ProyectosGrupoActividadEquipoController;
use App\Http\Controllers\Proyectos\GrupoActividadRecursoController as ProyectosGrupoActividadRecursoController;
use App\Http\Controllers\Proyectos\GrupoPersonaController as ProyectosGrupoPersonaController;
use App\Http\Controllers\Proyectos\PersonaController as ProyectosPersonaController;
use App\Http\Controllers\Proyectos\ProyectoActividadController as ProyectosActividadController;
use App\Http\Controllers\Proyectos\ProyectoActividadEstatusController as ProyectosActividadEstatusController;
use App\Http\Controllers\Proyectos\ProyectoActividadRecursoEstatusController as ProyectosActividadRecursoEstatusController;
use App\Http\Controllers\Proyectos\ProyectoController as ProyectosProyectoController;
use App\Http\Controllers\Proyectos\ProyectoEstatusController as ProyectosProyectoEstatusController;
use App\Http\Controllers\Proyectos\ProyectoRecursoController as ProyectosRecursoController;
use App\Http\Controllers\Proyectos\RolController as ProyectosRolController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

// The github consultor routes
Route::get('/', function () {
    return redirect()->route('github.consultor');
})->name('home');

Route::get('/consultor', [GitHubConsultorController::class, 'index'])->name('github.consultor');
Route::get('/consultor/proyectos', [GitHubConsultorController::class, 'proyectos'])->name('github.proyectos');
Route::get('/consultor/proyectos/{owner}/{repo}', [GitHubConsultorController::class, 'proyectoDetalle'])->name('github.proyecto');
Route::get('/dashboard', [GitHubConsultorController::class, 'index'])->name('dashboard');

// Include settings routes
require __DIR__.'/settings.php';

// Routes required by the existing frontend components to satisfy Wayfinder
Route::resource('ejemplo', EjemploController::class)->only(['index', 'store', 'update', 'destroy']);
Route::get('/tenant/seleccionar', [TenantController::class, 'seleccionar'])->name('tenant.seleccionar');
Route::post('/tenant/cambiar/{idCliente}', [TenantController::class, 'cambiar'])->name('tenant.cambiar');

// ==========================================================
// Módulo: Cine (Planificación Personal)
// ==========================================================
Route::prefix('cine')->name('cine.')->group(function () {
    // Dashboard principal de Cine
    Route::get('/', [CineDashboardController::class, 'index'])->name('dashboard');
    Route::post('/quick-store', [CineDashboardController::class, 'quickStore'])->name('quick-store');
    Route::get('/explorar', [CineDashboardController::class, 'explorar'])->name('explorar');

    // API interna para puente TMDB
    Route::prefix('tmdb')->name('tmdb.')->group(function () {
        Route::get('/buscar-producciones', [TmdbController::class, 'buscarProducciones'])->name('buscar-producciones');
        Route::get('/detalle-produccion/{id}', [TmdbController::class, 'detalleProduccion'])->name('detalle-produccion');
        Route::get('/buscar-directores', [TmdbController::class, 'buscarDirectores'])->name('buscar-directores');
        Route::get('/detalle-director/{id}', [TmdbController::class, 'detalleDirector'])->name('detalle-director');
    });

    // Submenú Catálogos
    Route::resource('tipos-opinion', TipoOpinionController::class)->names('tipos-opinion');
    Route::resource('directores', DirectorController::class)->names('directores');
    Route::resource('producciones', ProduccionController::class)->names('producciones');
    Route::resource('recursos', ProduccionRecursoController::class)->names('recursos');

    // Opciones independientes
    Route::resource('comentarios', ProduccionComentarioController::class)->names('comentarios');
    Route::resource('seguimiento', ProduccionSeguimientoController::class)->names('seguimiento');
    Route::resource('estatus', ProduccionEstatusController::class)->names('estatus');
});

// ==========================================================
// Módulo: Contabilidad (Planificación Personal)
// ==========================================================
Route::prefix('contabilidad')->name('contabilidad.')->group(function () {
    // Dashboard principal de Contabilidad
    Route::get('dashboard', [ContabilidadDashboardController::class, 'index'])->name('dashboard');

    // Catálogos
    Route::resource('alumnos', AlumnoController::class)->names('alumnos');
    Route::resource('oportunidades', OportunidadController::class)->names('oportunidades');
    Route::resource('periodos', PeriodoController::class)->names('periodos');
    Route::resource('grupos', GrupoController::class)->names('grupos');
    Route::resource('asesores', AsesorController::class)->names('asesores');
    Route::resource('ciclos', CicloController::class)->names('ciclos');

    // Módulos (Eje de donde parten Retos y Lecciones)
    Route::resource('modulos', ModuloController::class)->names('modulos');

    // Retos y sus anidaciones (Recursos y Actividades Alumnos)
    Route::get('retos', [ModuloRetoController::class, 'index'])->name('retos.index');
    Route::post('retos', [ModuloRetoController::class, 'store'])->name('retos.store');
    Route::put('retos/{reto}', [ModuloRetoController::class, 'update'])->name('retos.update');
    Route::delete('retos/{reto}', [ModuloRetoController::class, 'destroy'])->name('retos.destroy');

    Route::get('retos/{reto}/recursos', [ModuloRetoController::class, 'indexRecurso'])->name('retos.recursos.index');
    Route::post('retos/{reto}/recursos', [ModuloRetoController::class, 'storeRecurso'])->name('retos.recursos.store');
    Route::put('retos-recursos/{recurso}', [ModuloRetoController::class, 'updateRecurso'])->name('retos.recursos.update');
    Route::delete('retos-recursos/{recurso}', [ModuloRetoController::class, 'destroyRecurso'])->name('retos.recursos.destroy');

    Route::get('retos/{reto}/alumnos', [ModuloRetoController::class, 'indexAlumno'])->name('retos.alumnos.index');
    Route::post('retos/{reto}/alumnos', [ModuloRetoController::class, 'storeAlumno'])->name('retos.alumnos.store');
    Route::put('retos-alumnos/{alumnoActividad}', [ModuloRetoController::class, 'updateAlumno'])->name('retos.alumnos.update');
    Route::delete('retos-alumnos/{alumnoActividad}', [ModuloRetoController::class, 'destroyAlumno'])->name('retos.alumnos.destroy');

    // Lecciones y sus anidaciones (Recursos)
    Route::get('lecciones', [ModuloLeccionController::class, 'index'])->name('lecciones.index');
    Route::post('lecciones', [ModuloLeccionController::class, 'store'])->name('lecciones.store');
    Route::put('lecciones/{leccion}', [ModuloLeccionController::class, 'update'])->name('lecciones.update');
    Route::delete('lecciones/{leccion}', [ModuloLeccionController::class, 'destroy'])->name('lecciones.destroy');

    Route::get('lecciones/{leccion}/recursos', [ModuloLeccionController::class, 'indexRecurso'])->name('lecciones.recursos.index');
    Route::post('lecciones/{leccion}/recursos', [ModuloLeccionController::class, 'storeRecurso'])->name('lecciones.recursos.store');
    Route::put('lecciones-recursos/{recurso}', [ModuloLeccionController::class, 'updateRecurso'])->name('lecciones.recursos.update');
    Route::delete('lecciones-recursos/{recurso}', [ModuloLeccionController::class, 'destroyRecurso'])->name('lecciones.recursos.destroy');

    // Kardex Estatus de Lecciones y Recursos de Retos
    Route::get('modulo-leccion-estatus', [ModuloLeccionEstatusController::class, 'index'])->name('modulo-leccion-estatus.index');
    Route::put('modulo-leccion-estatus/{estatus}', [ModuloLeccionEstatusController::class, 'update'])->name('modulo-leccion-estatus.update');
    Route::delete('modulo-leccion-estatus/{estatus}', [ModuloLeccionEstatusController::class, 'destroy'])->name('modulo-leccion-estatus.destroy');

    Route::get('modulo-reto-recurso-estatus', [ModuloRetoRecursoEstatusController::class, 'index'])->name('modulo-reto-recurso-estatus.index');
    Route::put('modulo-reto-recurso-estatus/{estatus}', [ModuloRetoRecursoEstatusController::class, 'update'])->name('modulo-reto-recurso-estatus.update');
    Route::delete('modulo-reto-recurso-estatus/{estatus}', [ModuloRetoRecursoEstatusController::class, 'destroy'])->name('modulo-reto-recurso-estatus.destroy');
});

// ==========================================================
// Módulo: Inglés
// ==========================================================
Route::prefix('ingles')->name('ingles.')->group(function () {
    // Catálogos Base
    Route::resource('alumnos', InglesAlumnoController::class)->names('alumnos');
    Route::resource('asesores', InglesAsesorController::class)->names('asesores');
    Route::resource('periodos', InglesPeriodoController::class)->names('periodos');
    Route::resource('materias', InglesMateriaController::class)->names('materias');

    // Materias -> Recursos (Opción Hija como en Contabilidad)
    Route::get('materias/{materia}/recursos', [InglesMateriaRecursoController::class, 'index'])->name('materias.recursos.index');
    Route::post('materias/{materia}/recursos', [InglesMateriaRecursoController::class, 'store'])->name('materias.recursos.store');
    Route::put('materias-recursos/{recurso}', [InglesMateriaRecursoController::class, 'update'])->name('materias.recursos.update');
    Route::delete('materias-recursos/{recurso}', [InglesMateriaRecursoController::class, 'destroy'])->name('materias.recursos.destroy');

    // Materias -> Recursos -> Adicionales (Drawer Mostrar, Agregar, Eliminar)
    Route::post('materias-recursos/{recurso}/adicionales', [InglesMateriaRecursoController::class, 'storeAdicional'])->name('materias.recursos.adicionales.store');
    Route::delete('materias-recursos/adicionales/{adicional}', [InglesMateriaRecursoController::class, 'destroyAdicional'])->name('materias.recursos.adicionales.destroy');

    // Opción Independiente: Grupos
    Route::resource('grupos', InglesGrupoController::class)->names('grupos');

    // Grupos -> Hijo 1: Alumnos inscritos en el grupo
    Route::get('grupos/{grupo}/alumnos', [InglesGrupoAlumnoController::class, 'index'])->name('grupos.alumnos.index');
    Route::post('grupos/{grupo}/alumnos', [InglesGrupoAlumnoController::class, 'store'])->name('grupos.alumnos.store');
    Route::delete('grupos-alumnos/{grupoAlumno}', [InglesGrupoAlumnoController::class, 'destroy'])->name('grupos.alumnos.destroy');

    // Grupos -> Hijo 2: Retos / Actividades
    Route::get('grupos/{grupo}/actividades', [InglesGrupoActividadController::class, 'index'])->name('grupos.actividades.index');
    Route::post('grupos/{grupo}/actividades', [InglesGrupoActividadController::class, 'store'])->name('grupos.actividades.store');
    Route::put('grupos-actividades/{actividad}', [InglesGrupoActividadController::class, 'update'])->name('grupos.actividades.update');
    Route::delete('grupos-actividades/{actividad}', [InglesGrupoActividadController::class, 'destroy'])->name('grupos.actividades.destroy');

    // Grupos -> Actividades -> Drawer Adicionales (Mostrar, Agregar, Eliminar)
    Route::post('grupos-actividades/{actividad}/adicionales', [InglesGrupoActividadAdicionalController::class, 'store'])->name('grupos.actividades.adicionales.store');
    Route::delete('grupos-actividades/adicionales/{adicional}', [InglesGrupoActividadAdicionalController::class, 'destroy'])->name('grupos.actividades.adicionales.destroy');

    // Retos -> Equipos de Alumnos (filtrado por alumnos del grupo actual)
    Route::get('actividades/{actividad}/equipos', [InglesGrupoActividadEquipoController::class, 'index'])->name('actividades.equipos.index');
    Route::post('actividades/{actividad}/equipos', [InglesGrupoActividadEquipoController::class, 'store'])->name('actividades.equipos.store');
    Route::delete('actividades-equipos/{equipo}', [InglesGrupoActividadEquipoController::class, 'destroy'])->name('actividades.equipos.destroy');

    // Retos -> Recursos / Entregas de Alumnos (condicionado por Tipo: Individual NULL / bloqueado, Equipo, Grupo)
    Route::get('actividades/{actividad}/recursos', [InglesGrupoActividadRecursoController::class, 'index'])->name('actividades.recursos.index');
    Route::post('actividades/{actividad}/recursos', [InglesGrupoActividadRecursoController::class, 'store'])->name('actividades.recursos.store');
    Route::put('actividades-recursos/{recurso}', [InglesGrupoActividadRecursoController::class, 'update'])->name('actividades.recursos.update');
    Route::delete('actividades-recursos/{recurso}', [InglesGrupoActividadRecursoController::class, 'destroy'])->name('actividades.recursos.destroy');

    // Opción Independiente: Grupo Actividades Estatus (Kardex)
    Route::get('grupo-actividades-estatus', [InglesGrupoActividadEstatusController::class, 'index'])->name('grupo-actividades-estatus.index');
    Route::put('grupo-actividades-estatus/{estatus}', [InglesGrupoActividadEstatusController::class, 'update'])->name('grupo-actividades-estatus.update');
    Route::delete('grupo-actividades-estatus/{estatus}', [InglesGrupoActividadEstatusController::class, 'destroy'])->name('grupo-actividades-estatus.destroy');

    // Opción Independiente: Grupo Actividad Recurso Estatus (Kardex)
    Route::get('grupo-actividad-recursos-estatus', [InglesGrupoActividadRecursoEstatusController::class, 'index'])->name('grupo-actividad-recursos-estatus.index');
    Route::put('grupo-actividad-recursos-estatus/{estatus}', [InglesGrupoActividadRecursoEstatusController::class, 'update'])->name('grupo-actividad-recursos-estatus.update');
    Route::delete('grupo-actividad-recursos-estatus/{estatus}', [InglesGrupoActividadRecursoEstatusController::class, 'destroy'])->name('grupo-actividad-recursos-estatus.destroy');
});

// ==========================================================
// Módulo: Proyectos (Planificación Personal)
// ==========================================================
Route::prefix('proyectos')->name('proyectos.')->group(function () {
    // Catálogos
    Route::resource('personas', ProyectosPersonaController::class)->names('personas');
    Route::resource('roles', ProyectosRolController::class)->names('roles');

    // Opción Independiente: Proyectos
    Route::resource('proyectos', ProyectosProyectoController::class)->names('proyectos');

    // Proyectos -> Recursos (Opción Hija)
    Route::get('proyectos/{proyecto}/recursos', [ProyectosRecursoController::class, 'index'])->name('proyectos.recursos.index');
    Route::post('proyectos/{proyecto}/recursos', [ProyectosRecursoController::class, 'store'])->name('proyectos.recursos.store');
    Route::put('proyectos-recursos/{recurso}', [ProyectosRecursoController::class, 'update'])->name('proyectos.recursos.update');
    Route::delete('proyectos-recursos/{recurso}', [ProyectosRecursoController::class, 'destroy'])->name('proyectos.recursos.destroy');

    // Proyectos -> Recursos -> Adicionales (Drawer Mostrar, Agregar, Eliminar)
    Route::post('proyectos-recursos/{recurso}/adicionales', [ProyectosRecursoController::class, 'storeAdicional'])->name('proyectos.recursos.adicionales.store');
    Route::delete('proyectos-recursos/adicionales/{adicional}', [ProyectosRecursoController::class, 'destroyAdicional'])->name('proyectos.recursos.adicionales.destroy');

    // Proyectos -> Hijo 1: Personas asignadas con su rol
    Route::get('proyectos/{proyecto}/personas', [ProyectosGrupoPersonaController::class, 'index'])->name('proyectos.personas.index');
    Route::post('proyectos/{proyecto}/personas', [ProyectosGrupoPersonaController::class, 'store'])->name('proyectos.personas.store');
    Route::put('proyectos-personas/{grupoPersona}', [ProyectosGrupoPersonaController::class, 'update'])->name('proyectos.personas.update');
    Route::delete('proyectos-personas/{grupoPersona}', [ProyectosGrupoPersonaController::class, 'destroy'])->name('proyectos.personas.destroy');

    // Proyectos -> Hijo 2: Actividades
    Route::get('proyectos/{proyecto}/actividades', [ProyectosActividadController::class, 'index'])->name('proyectos.actividades.index');
    Route::post('proyectos/{proyecto}/actividades', [ProyectosActividadController::class, 'store'])->name('proyectos.actividades.store');
    Route::put('proyectos-actividades/{actividad}', [ProyectosActividadController::class, 'update'])->name('proyectos.actividades.update');
    Route::delete('proyectos-actividades/{actividad}', [ProyectosActividadController::class, 'destroy'])->name('proyectos.actividades.destroy');

    // Proyectos -> Actividades -> Drawer Adicionales (Mostrar, Agregar, Eliminar)
    Route::post('proyectos-actividades/{actividad}/adicionales', [ProyectosActividadController::class, 'storeAdicional'])->name('proyectos.actividades.adicionales.store');
    Route::delete('proyectos-actividades/adicionales/{adicional}', [ProyectosActividadController::class, 'destroyAdicional'])->name('proyectos.actividades.adicionales.destroy');

    // Actividades -> Equipos (filtrado por personas asignadas al proyecto actual)
    Route::get('actividades/{actividad}/equipos', [ProyectosGrupoActividadEquipoController::class, 'index'])->name('actividades.equipos.index');
    Route::post('actividades/{actividad}/equipos', [ProyectosGrupoActividadEquipoController::class, 'store'])->name('actividades.equipos.store');
    Route::delete('actividades-equipos/{equipo}', [ProyectosGrupoActividadEquipoController::class, 'destroy'])->name('actividades.equipos.destroy');

    // Actividades -> Recursos (condicionado por Tipo: Individual NULL / bloqueado, Equipo, Grupo)
    Route::get('actividades/{actividad}/recursos', [ProyectosGrupoActividadRecursoController::class, 'index'])->name('actividades.recursos.index');
    Route::post('actividades/{actividad}/recursos', [ProyectosGrupoActividadRecursoController::class, 'store'])->name('actividades.recursos.store');
    Route::post('actividades/{actividad}/enviar-recursos', [ProyectosGrupoActividadRecursoController::class, 'enviarRecursos'])->name('actividades.recursos.enviar');
    Route::put('actividades-recursos/{recurso}', [ProyectosGrupoActividadRecursoController::class, 'update'])->name('actividades.recursos.update');
    Route::delete('actividades-recursos/{recurso}', [ProyectosGrupoActividadRecursoController::class, 'destroy'])->name('actividades.recursos.destroy');

    // Opción Independiente: Kardex de Proyecto Estatus
    Route::get('proyecto-estatus', [ProyectosProyectoEstatusController::class, 'index'])->name('proyecto-estatus.index');
    Route::put('proyecto-estatus/{estatus}', [ProyectosProyectoEstatusController::class, 'update'])->name('proyecto-estatus.update');
    Route::delete('proyecto-estatus/{estatus}', [ProyectosProyectoEstatusController::class, 'destroy'])->name('proyecto-estatus.destroy');

    // Opción Independiente: Kardex de Actividades Estatus
    Route::get('proyecto-actividades-estatus', [ProyectosActividadEstatusController::class, 'index'])->name('proyecto-actividades-estatus.index');
    Route::put('proyecto-actividades-estatus/{estatus}', [ProyectosActividadEstatusController::class, 'update'])->name('proyecto-actividades-estatus.update');
    Route::delete('proyecto-actividades-estatus/{estatus}', [ProyectosActividadEstatusController::class, 'destroy'])->name('proyecto-actividades-estatus.destroy');

    // Opción Independiente: Kardex de Recurso Estatus
    Route::get('proyecto-actividad-recursos-estatus', [ProyectosActividadRecursoEstatusController::class, 'index'])->name('proyecto-actividad-recursos-estatus.index');
    Route::put('proyecto-actividad-recursos-estatus/{estatus}', [ProyectosActividadRecursoEstatusController::class, 'update'])->name('proyecto-actividad-recursos-estatus.update');
    Route::delete('proyecto-actividad-recursos-estatus/{estatus}', [ProyectosActividadRecursoEstatusController::class, 'destroy'])->name('proyecto-actividad-recursos-estatus.destroy');
});

// ==========================================================
// API Contabilidad (Endpoints Dedicados JSON)
// ==========================================================
Route::prefix('api/contabilidad')->name('api.contabilidad.')->group(function () {
    // API Módulos
    Route::get('modulos', [ModuloController::class, 'apiIndex'])->name('modulos.index');
    Route::post('modulos', [ModuloController::class, 'apiStore'])->name('modulos.store');
    Route::put('modulos/{modulo}', [ModuloController::class, 'apiUpdate'])->name('modulos.update');
    Route::delete('modulos/{modulo}', [ModuloController::class, 'apiDestroy'])->name('modulos.destroy');

    // API Lecciones
    Route::get('lecciones', [ModuloLeccionController::class, 'apiIndex'])->name('lecciones.index');
    Route::post('lecciones', [ModuloLeccionController::class, 'apiStore'])->name('lecciones.store');
    Route::post('lecciones/preservar', [ModuloLeccionController::class, 'apiPreservar'])->name('lecciones.preservar');
    Route::put('lecciones/{leccion}', [ModuloLeccionController::class, 'apiUpdate'])->name('lecciones.update');
    Route::delete('lecciones/{leccion}', [ModuloLeccionController::class, 'apiDestroy'])->name('lecciones.destroy');

    // API Recursos de Lección (Solo lectura)
    Route::get('lecciones/{leccion}/recursos', [ModuloLeccionController::class, 'indexRecurso'])->name('lecciones.recursos.index');
});

// ==========================================================
// Integración: Google Drive OAuth & Subida de Archivos
// ==========================================================
Route::get('google/connect', [GoogleDriveController::class, 'connect'])->name('google.connect');
Route::get('google/callback', [GoogleDriveController::class, 'callback'])->name('google.callback');
Route::get('api/google/status', [GoogleDriveController::class, 'status'])->name('api.google.status');
Route::post('api/google/upload', [GoogleDriveController::class, 'upload'])->name('api.google.upload');
