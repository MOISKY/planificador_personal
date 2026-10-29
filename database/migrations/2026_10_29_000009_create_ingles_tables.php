<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. ingles_alumno
        if (! Schema::hasTable('ingles_alumno')) {
            Schema::create('ingles_alumno', function (Blueprint $table) {
                $table->increments('IdAlumno');
                $table->string('Nombre', 100);
                $table->string('ApellidoPaterno', 100);
                $table->string('ApellidoMaterno', 100)->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 2. ingles_asesor
        if (! Schema::hasTable('ingles_asesor')) {
            Schema::create('ingles_asesor', function (Blueprint $table) {
                $table->increments('IdAsesor');
                $table->string('Nombre', 100);
                $table->string('ApellidoPaterno', 100);
                $table->string('ApellidoMaterno', 100)->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 3. ingles_periodo
        if (! Schema::hasTable('ingles_periodo')) {
            Schema::create('ingles_periodo', function (Blueprint $table) {
                $table->increments('IdPeriodo');
                $table->string('Nombre', 100);
                $table->date('FechaInicio');
                $table->date('FechaFin');
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 4. ingles_materia
        if (! Schema::hasTable('ingles_materia')) {
            Schema::create('ingles_materia', function (Blueprint $table) {
                $table->increments('IdMateria');
                $table->string('Nombre', 150);
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        // 5. ingles_materia_recurso (hija de materia)
        if (! Schema::hasTable('ingles_materia_recurso')) {
            Schema::create('ingles_materia_recurso', function (Blueprint $table) {
                $table->increments('IdRecurso');
                $table->unsignedInteger('IdMateria');
                $table->string('Nombre', 150);
                $table->text('Descripcion')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdMateria')
                    ->references('IdMateria')
                    ->on('ingles_materia')
                    ->cascadeOnDelete();
            });
        }

        // 6. ingles_materia_recurso_adicional (drawer de recurso adicional)
        if (! Schema::hasTable('ingles_materia_recurso_adicional')) {
            Schema::create('ingles_materia_recurso_adicional', function (Blueprint $table) {
                $table->increments('IdRecursoAdicional');
                $table->unsignedInteger('IdRecurso');
                $table->text('Descripcion');
                $table->string('UrlRecurso', 1000);
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdRecurso')
                    ->references('IdRecurso')
                    ->on('ingles_materia_recurso')
                    ->cascadeOnDelete();
            });
        }

        // 7. ingles_grupo (opción independiente)
        if (! Schema::hasTable('ingles_grupo')) {
            Schema::create('ingles_grupo', function (Blueprint $table) {
                $table->increments('IdGrupo');
                $table->string('Grupo', 50);
                $table->unsignedInteger('IdPeriodo');
                $table->unsignedInteger('IdMateria');
                $table->unsignedInteger('IdAsesor');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdPeriodo')
                    ->references('IdPeriodo')
                    ->on('ingles_periodo')
                    ->cascadeOnDelete();

                $table->foreign('IdMateria')
                    ->references('IdMateria')
                    ->on('ingles_materia')
                    ->cascadeOnDelete();

                $table->foreign('IdAsesor')
                    ->references('IdAsesor')
                    ->on('ingles_asesor')
                    ->cascadeOnDelete();
            });
        }

        // 8. ingles_grupo_alumno (hijo 1 de grupo)
        if (! Schema::hasTable('ingles_grupo_alumno')) {
            Schema::create('ingles_grupo_alumno', function (Blueprint $table) {
                $table->increments('IdGrupoAlumno');
                $table->unsignedInteger('IdGrupo');
                $table->unsignedInteger('IdAlumno');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdGrupo')
                    ->references('IdGrupo')
                    ->on('ingles_grupo')
                    ->cascadeOnDelete();

                $table->foreign('IdAlumno')
                    ->references('IdAlumno')
                    ->on('ingles_alumno')
                    ->cascadeOnDelete();
            });
        }

        // 9. ingles_grupo_actividad (hijo 2 de grupo)
        if (! Schema::hasTable('ingles_grupo_actividad')) {
            Schema::create('ingles_grupo_actividad', function (Blueprint $table) {
                $table->increments('IdActividad');
                $table->unsignedInteger('IdGrupo');
                $table->string('Nombre', 200);
                $table->text('Descripcion')->nullable();
                $table->dateTime('FechaEntrega')->nullable();
                $table->string('Tipo', 50)->default('Individual'); // Individual, Equipo, Grupo
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdGrupo')
                    ->references('IdGrupo')
                    ->on('ingles_grupo')
                    ->cascadeOnDelete();
            });
        }

        // 10. ingles_grupo_actividad_adicional (drawer en actividad)
        if (! Schema::hasTable('ingles_grupo_actividad_adicional')) {
            Schema::create('ingles_grupo_actividad_adicional', function (Blueprint $table) {
                $table->increments('IdActividadAdicional');
                $table->unsignedInteger('IdActividad');
                $table->text('Descripcion');
                $table->string('UrlRecurso', 1000);
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdActividad')
                    ->references('IdActividad')
                    ->on('ingles_grupo_actividad')
                    ->cascadeOnDelete();
            });
        }

        // 11. ingles_grupo_actividad_equipo (equipos de alumnos en actividad)
        if (! Schema::hasTable('ingles_grupo_actividad_equipo')) {
            Schema::create('ingles_grupo_actividad_equipo', function (Blueprint $table) {
                $table->increments('IdEquipo');
                $table->unsignedInteger('IdActividad');
                $table->unsignedInteger('IdAlumno');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdActividad')
                    ->references('IdActividad')
                    ->on('ingles_grupo_actividad')
                    ->cascadeOnDelete();

                $table->foreign('IdAlumno')
                    ->references('IdAlumno')
                    ->on('ingles_alumno')
                    ->cascadeOnDelete();
            });
        }

        // 12. ingles_grupo_actividad_recurso (actividades alumnos / entregas)
        if (! Schema::hasTable('ingles_grupo_actividad_recurso')) {
            Schema::create('ingles_grupo_actividad_recurso', function (Blueprint $table) {
                $table->increments('IdActividadRecurso');
                $table->unsignedInteger('IdActividad');
                $table->string('Nombre', 200);
                $table->unsignedInteger('IdAlumno')->nullable(); // NULL por defecto si Tipo es Individual (entidad débil)
                $table->string('URLRecurso', 1000);
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdActividad')
                    ->references('IdActividad')
                    ->on('ingles_grupo_actividad')
                    ->cascadeOnDelete();

                $table->foreign('IdAlumno')
                    ->references('IdAlumno')
                    ->on('ingles_alumno')
                    ->nullOnDelete();
            });
        }

        // 13. ingles_kardex_grupo_actividad_estatus (kardex estatus actividad)
        if (! Schema::hasTable('ingles_kardex_grupo_actividad_estatus')) {
            Schema::create('ingles_kardex_grupo_actividad_estatus', function (Blueprint $table) {
                $table->increments('IdActividadEstatus');
                $table->unsignedInteger('IdActividad');
                $table->string('Estatus', 50)->default('No Realizado'); // 'No Realizado', 'En Proceso', 'Realizado'
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdActividad')
                    ->references('IdActividad')
                    ->on('ingles_grupo_actividad')
                    ->cascadeOnDelete();
            });
        }

        // 14. ingles_kardex_grupo_actividad_recurso_estatus (kardex estatus recurso)
        if (! Schema::hasTable('ingles_kardex_grupo_actividad_recurso_estatus')) {
            Schema::create('ingles_kardex_grupo_actividad_recurso_estatus', function (Blueprint $table) {
                $table->increments('IdActividadRecursoEstatus');
                $table->unsignedInteger('IdActividadRecurso');
                $table->string('Estatus', 50)->default('No Realizado'); // 'No Realizado', 'En Proceso', 'Realizado'
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdActividadRecurso')
                    ->references('IdActividadRecurso')
                    ->on('ingles_grupo_actividad_recurso')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ingles_kardex_grupo_actividad_recurso_estatus');
        Schema::dropIfExists('ingles_kardex_grupo_actividad_estatus');
        Schema::dropIfExists('ingles_grupo_actividad_recurso');
        Schema::dropIfExists('ingles_grupo_actividad_equipo');
        Schema::dropIfExists('ingles_grupo_actividad_adicional');
        Schema::dropIfExists('ingles_grupo_actividad');
        Schema::dropIfExists('ingles_grupo_alumno');
        Schema::dropIfExists('ingles_grupo');
        Schema::dropIfExists('ingles_materia_recurso_adicional');
        Schema::dropIfExists('ingles_materia_recurso');
        Schema::dropIfExists('ingles_materia');
        Schema::dropIfExists('ingles_periodo');
        Schema::dropIfExists('ingles_asesor');
        Schema::dropIfExists('ingles_alumno');
    }
};
