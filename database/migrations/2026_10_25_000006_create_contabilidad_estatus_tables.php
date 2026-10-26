<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('contabilidad_kardex_modulo_leccion_estatus')) {
            Schema::create('contabilidad_kardex_modulo_leccion_estatus', function (Blueprint $table) {
                $table->increments('IdLeccionEstatus');
                $table->unsignedInteger('IdLeccion');
                $table->string('Estatus', 50)->default('No leido'); // 'No leido', 'Leyendo', 'Leido'
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdLeccion')
                    ->references('IdLeccion')
                    ->on('contabilidad_modulo_leccion')
                    ->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('contabilidad_kardex_modulo_reto_recurso_estatus')) {
            Schema::create('contabilidad_kardex_modulo_reto_recurso_estatus', function (Blueprint $table) {
                $table->increments('IdRetoRecursoEstatus');
                $table->unsignedInteger('IdRetoRecurso');
                $table->string('Estatus', 50)->default('No Realizado'); // 'No Realizado', 'En Proceso', 'Realizado'
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdRetoRecurso')
                    ->references('IdRetoRecurso')
                    ->on('contabilidad_modulo_reto_recurso')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contabilidad_kardex_modulo_reto_recurso_estatus');
        Schema::dropIfExists('contabilidad_kardex_modulo_leccion_estatus');
    }
};
