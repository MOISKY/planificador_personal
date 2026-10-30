<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proyectos_kardex_proyecto_estatus', function (Blueprint $table) {
            $table->id('IdProyectoEstatus');
            $table->foreignId('IdProyecto')
                ->constrained('proyectos_proyecto', 'IdProyecto')
                ->cascadeOnDelete();
            $table->string('Estatus', 50)->default('Pendiente');
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // Poblar estatus inicial para proyectos existentes
        $proyectosIds = DB::table('proyectos_proyecto')->pluck('IdProyecto');
        $ahora = now();
        foreach ($proyectosIds as $idProyecto) {
            DB::table('proyectos_kardex_proyecto_estatus')->insert([
                'IdProyecto' => $idProyecto,
                'Estatus' => 'Pendiente',
                'FechaRegistro' => $ahora,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyectos_kardex_proyecto_estatus');
    }
};
