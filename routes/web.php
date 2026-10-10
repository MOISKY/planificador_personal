<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GitHubConsultorController;
use App\Http\Controllers\EjemploController;
use App\Http\Controllers\TenantController;

// The github consultor routes
Route::get('/', function () {
    return redirect()->route('github.consultor');
})->name('home');

Route::get('/consultor', [GitHubConsultorController::class, 'index'])->name('github.consultor');
Route::get('/consultor/proyectos', [GitHubConsultorController::class, 'proyectos'])->name('github.proyectos');
Route::get('/dashboard', [GitHubConsultorController::class, 'index'])->name('dashboard');

// Include settings routes
require __DIR__.'/settings.php';

// Routes required by the existing frontend components to satisfy Wayfinder
Route::resource('ejemplo', EjemploController::class)->only(['index', 'store', 'update', 'destroy']);
Route::get('/tenant/seleccionar', [TenantController::class, 'seleccionar'])->name('tenant.seleccionar');
Route::post('/tenant/cambiar/{idCliente}', [TenantController::class, 'cambiar'])->name('tenant.cambiar');
