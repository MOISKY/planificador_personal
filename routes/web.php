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
use App\Http\Controllers\EjemploController;
use App\Http\Controllers\GitHubConsultorController;
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
