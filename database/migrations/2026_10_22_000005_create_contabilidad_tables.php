<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Alumnos
        if (! Schema::hasTable('contabilidad_alumno')) {
            Schema::create('contabilidad_alumno', function (Blueprint $table) {
                $table->increments('IdAlumno');
                $table->string('Nombre', 100);
                $table->string('ApellidoPaterno', 100);
                $table->string('ApellidoMaterno', 100)->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 2. Oportunidades
        if (! Schema::hasTable('contabilidad_oportunidades')) {
            Schema::create('contabilidad_oportunidades', function (Blueprint $table) {
                $table->increments('IdOportunidad');
                $table->string('Nombre', 100);
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 3. Periodos
        if (! Schema::hasTable('contabilidad_periodo')) {
            Schema::create('contabilidad_periodo', function (Blueprint $table) {
                $table->increments('IdPeriodo');
                $table->string('Nombre', 100);
                $table->date('FechaInicio');
                $table->date('FechaFin');
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 4. Grupos
        if (! Schema::hasTable('contabilidad_grupo')) {
            Schema::create('contabilidad_grupo', function (Blueprint $table) {
                $table->increments('IdGrupo');
                $table->string('Grupo', 100);
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 5. Módulos
        if (! Schema::hasTable('contabilidad_modulo')) {
            Schema::create('contabilidad_modulo', function (Blueprint $table) {
                $table->increments('IdModulo');
                $table->string('IdModuloUveg', 50)->nullable()->index();
                $table->string('Modulo', 150);
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 6. Asesores
        if (! Schema::hasTable('contabilidad_asesor')) {
            Schema::create('contabilidad_asesor', function (Blueprint $table) {
                $table->increments('IdAsesor');
                $table->string('Nombre', 100);
                $table->string('ApellidoPaterno', 100);
                $table->string('ApellidoMaterno', 100)->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 7. Ciclo (Relación Periodo, Oportunidad, Grupo, Asesor)
        if (! Schema::hasTable('contabilidad_ciclo')) {
            Schema::create('contabilidad_ciclo', function (Blueprint $table) {
                $table->increments('IdCiclo');
                $table->unsignedInteger('IdPeriodo');
                $table->unsignedInteger('IdOportunidad');
                $table->unsignedInteger('IdGrupo');
                $table->unsignedInteger('IdAsesor');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdPeriodo')->references('IdPeriodo')->on('contabilidad_periodo')->cascadeOnDelete();
                $table->foreign('IdOportunidad')->references('IdOportunidad')->on('contabilidad_oportunidades')->cascadeOnDelete();
                $table->foreign('IdGrupo')->references('IdGrupo')->on('contabilidad_grupo')->cascadeOnDelete();
                $table->foreign('IdAsesor')->references('IdAsesor')->on('contabilidad_asesor')->cascadeOnDelete();
            });
        }

        // 8. Retos del Módulo
        if (! Schema::hasTable('contabilidad_modulo_reto')) {
            Schema::create('contabilidad_modulo_reto', function (Blueprint $table) {
                $table->increments('IdReto');
                $table->unsignedInteger('IdModulo');
                $table->string('Nombre', 200);
                $table->text('UrlReto')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdModulo')->references('IdModulo')->on('contabilidad_modulo')->cascadeOnDelete();
            });
        }

        // 9. Recursos dentro de Retos
        if (! Schema::hasTable('contabilidad_modulo_reto_recurso')) {
            Schema::create('contabilidad_modulo_reto_recurso', function (Blueprint $table) {
                $table->increments('IdRetoRecurso');
                $table->unsignedInteger('IdReto');
                $table->unsignedInteger('IdModuloDetalle')->nullable();
                $table->string('Nombre', 200);
                $table->text('URLRecurso');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdReto')->references('IdReto')->on('contabilidad_modulo_reto')->cascadeOnDelete();
            });
        }

        // 10. Actividades de Alumnos dentro de Retos
        if (! Schema::hasTable('contabilidad_modulo_reto_alumno')) {
            Schema::create('contabilidad_modulo_reto_alumno', function (Blueprint $table) {
                $table->increments('IdRetoAlumno');
                $table->unsignedInteger('IdReto');
                $table->unsignedInteger('IdAlumno');
                $table->unsignedInteger('IdRetoRecurso')->nullable();
                $table->unsignedInteger('IdModuloDetalle')->nullable();
                $table->string('Nombre', 200);
                $table->text('URLRecurso');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdReto')->references('IdReto')->on('contabilidad_modulo_reto')->cascadeOnDelete();
                $table->foreign('IdAlumno')->references('IdAlumno')->on('contabilidad_alumno')->cascadeOnDelete();
                $table->foreign('IdRetoRecurso')->references('IdRetoRecurso')->on('contabilidad_modulo_reto_recurso')->nullOnDelete();
            });
        }

        // 11. Lecciones del Módulo
        if (! Schema::hasTable('contabilidad_modulo_leccion')) {
            Schema::create('contabilidad_modulo_leccion', function (Blueprint $table) {
                $table->increments('IdLeccion');
                $table->unsignedInteger('IdModulo');
                $table->string('Nombre', 200);
                $table->string('Codigo', 100)->nullable()->index();
                $table->text('UrlLeccion')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdModulo')->references('IdModulo')->on('contabilidad_modulo')->cascadeOnDelete();
            });
        }

        // 12. Recursos dentro de Lecciones
        if (! Schema::hasTable('contabilidad_modulo_leccion_recurso')) {
            Schema::create('contabilidad_modulo_leccion_recurso', function (Blueprint $table) {
                $table->increments('IdLeccionRecurso');
                $table->unsignedInteger('IdLeccion');
                $table->string('Nombre', 200);
                $table->text('URLRecurso');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdLeccion')->references('IdLeccion')->on('contabilidad_modulo_leccion')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contabilidad_modulo_leccion_recurso');
        Schema::dropIfExists('contabilidad_modulo_leccion');
        Schema::dropIfExists('contabilidad_modulo_reto_alumno');
        Schema::dropIfExists('contabilidad_modulo_reto_recurso');
        Schema::dropIfExists('contabilidad_modulo_reto');
        Schema::dropIfExists('contabilidad_ciclo');
        Schema::dropIfExists('contabilidad_asesor');
        Schema::dropIfExists('contabilidad_modulo');
        Schema::dropIfExists('contabilidad_grupo');
        Schema::dropIfExists('contabilidad_periodo');
        Schema::dropIfExists('contabilidad_oportunidades');
        Schema::dropIfExists('contabilidad_alumno');
    }
};
