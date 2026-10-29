<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('contabilidad_modulo_leccion') || ! Schema::hasColumn('contabilidad_modulo_leccion', 'Codigo')) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::transaction(function (): void {
                DB::statement('
                    ALTER TABLE contabilidad_modulo_leccion
                        ADD COLUMN "Codigo_tmp" varchar(100),
                        ADD COLUMN "UrlLeccion_tmp" text,
                        ADD COLUMN "FechaRegistro_tmp" timestamp(0) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
                ');

                DB::statement('
                    UPDATE contabilidad_modulo_leccion
                    SET "Codigo_tmp" = "Codigo",
                        "UrlLeccion_tmp" = "UrlLeccion",
                        "FechaRegistro_tmp" = "FechaRegistro"
                ');

                DB::statement('
                    ALTER TABLE contabilidad_modulo_leccion
                        DROP COLUMN "Codigo",
                        DROP COLUMN "UrlLeccion",
                        DROP COLUMN "FechaRegistro"
                ');

                DB::statement('ALTER TABLE contabilidad_modulo_leccion RENAME COLUMN "Codigo_tmp" TO "Codigo"');
                DB::statement('ALTER TABLE contabilidad_modulo_leccion RENAME COLUMN "UrlLeccion_tmp" TO "UrlLeccion"');
                DB::statement('ALTER TABLE contabilidad_modulo_leccion RENAME COLUMN "FechaRegistro_tmp" TO "FechaRegistro"');

                DB::statement('
                    CREATE INDEX IF NOT EXISTS contabilidad_modulo_leccion_codigo_index
                        ON contabilidad_modulo_leccion ("Codigo")
                ');
            });
        }
    }

    public function down(): void
    {
        // El orden físico de las columnas no requiere reversión destructiva.
    }
};
