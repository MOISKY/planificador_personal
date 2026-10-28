<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contabilidad_modulo') && ! Schema::hasColumn('contabilidad_modulo', 'IdModuloUveg')) {
            Schema::table('contabilidad_modulo', function (Blueprint $table): void {
                $table->string('IdModuloUveg', 50)->nullable()->after('IdModulo')->index();
            });
        }

        if (Schema::hasTable('contabilidad_modulo_leccion') && ! Schema::hasColumn('contabilidad_modulo_leccion', 'Codigo')) {
            Schema::table('contabilidad_modulo_leccion', function (Blueprint $table): void {
                $table->string('Codigo', 100)->nullable()->after('IdModulo')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contabilidad_modulo_leccion') && Schema::hasColumn('contabilidad_modulo_leccion', 'Codigo')) {
            Schema::table('contabilidad_modulo_leccion', function (Blueprint $table): void {
                $table->dropColumn('Codigo');
            });
        }

        if (Schema::hasTable('contabilidad_modulo') && Schema::hasColumn('contabilidad_modulo', 'IdModuloUveg')) {
            Schema::table('contabilidad_modulo', function (Blueprint $table): void {
                $table->dropColumn('IdModuloUveg');
            });
        }
    }
};

