<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('admin_especialidad')) {
            Schema::create('admin_especialidad', function (Blueprint $table) {
                $table->id('IdEspecialidad');
                $table->string('Nombre', 150);
                $table->text('Descripcion')->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        if (! Schema::hasTable('admin_candidato')) {
            Schema::create('admin_candidato', function (Blueprint $table) {
                $table->id('IdCandidato');
                $table->string('Nombre', 100);
                $table->string('APaterno', 100);
                $table->string('AMaterno', 100)->nullable();
                $table->string('Telefono', 20)->nullable();
                $table->string('Movil', 20)->nullable();
                $table->integer('IOrden')->default(0);
                $table->string('CorreoElectronico', 150)->nullable();
                $table->string('UrlCv', 1000)->nullable();
                $table->string('EActivo', 2)->default('Si');
                $table->foreignId('IdEspecialidad')
                    ->constrained('admin_especialidad', 'IdEspecialidad')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_candidato');
        Schema::dropIfExists('admin_especialidad');
    }
};
