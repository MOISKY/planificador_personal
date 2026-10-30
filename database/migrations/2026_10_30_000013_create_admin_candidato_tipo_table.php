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
        if (! Schema::hasTable('admin_candidato_tipo')) {
            Schema::create('admin_candidato_tipo', function (Blueprint $table) {
                $table->id('IdCandidatoTipo');
                $table->string('Nombre', 150);
                $table->text('Descripcion')->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        if (Schema::hasTable('admin_candidato') && ! Schema::hasColumn('admin_candidato', 'IdCandidatoTipo')) {
            Schema::table('admin_candidato', function (Blueprint $table) {
                $table->foreignId('IdCandidatoTipo')
                    ->nullable()
                    ->after('IdEspecialidad')
                    ->constrained('admin_candidato_tipo', 'IdCandidatoTipo')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('admin_candidato') && Schema::hasColumn('admin_candidato', 'IdCandidatoTipo')) {
            Schema::table('admin_candidato', function (Blueprint $table) {
                $table->dropConstrainedForeignId('IdCandidatoTipo');
            });
        }

        Schema::dropIfExists('admin_candidato_tipo');
    }
};

