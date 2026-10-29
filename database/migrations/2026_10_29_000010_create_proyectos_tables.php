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
        // 1. Catálogo de Personas
        Schema::create('proyectos_persona', function (Blueprint $table) {
            $table->id('IdPersona');
            $table->string('Nombre', 100);
            $table->string('ApellidoPaterno', 100);
            $table->string('ApellidoMaterno', 100)->nullable();
            $table->string('correoElectronico', 150)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 2. Catálogo de Roles
        Schema::create('proyectos_rol', function (Blueprint $table) {
            $table->id('IdRol');
            $table->string('Rol', 100);
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 3. Proyectos (Entidad Principal Independiente)
        Schema::create('proyectos_proyecto', function (Blueprint $table) {
            $table->id('IdProyecto');
            $table->string('Nombre', 200);
            $table->text('Descripcion')->nullable();
            $table->date('FechaInicio')->nullable();
            $table->date('FechaFinal')->nullable();
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 4. Recursos del Proyecto (Opción Hija)
        Schema::create('proyectos_proyecto_recurso', function (Blueprint $table) {
            $table->id('IdRecurso');
            $table->foreignId('IdProyecto')
                ->constrained('proyectos_proyecto', 'IdProyecto')
                ->cascadeOnDelete();
            $table->string('Nombre', 200);
            $table->text('Descripcion')->nullable();
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 5. Recursos Adicionales del Proyecto (Drawer de Recurso)
        Schema::create('proyectos_proyecto_recurso_adicional', function (Blueprint $table) {
            $table->id('IdRecursoAdicional');
            $table->foreignId('IdRecurso')
                ->constrained('proyectos_proyecto_recurso', 'IdRecurso')
                ->cascadeOnDelete();
            $table->text('Descripcion');
            $table->string('UrlRecurso', 1000);
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 6. Personas Asignadas al Proyecto con su Rol (Hijo 1 de Proyecto)
        Schema::create('proyectos_grupo_persona', function (Blueprint $table) {
            $table->id('IdGrupoPersona');
            $table->foreignId('IdProyecto')
                ->constrained('proyectos_proyecto', 'IdProyecto')
                ->cascadeOnDelete();
            $table->foreignId('IdPersona')
                ->constrained('proyectos_persona', 'IdPersona')
                ->cascadeOnDelete();
            $table->foreignId('IdRol')
                ->constrained('proyectos_rol', 'IdRol')
                ->cascadeOnDelete();
            $table->timestamp('FechaRegistro')->useCurrent();

            $table->unique(['IdProyecto', 'IdPersona'], 'proyectos_grupo_persona_unique');
        });

        // 7. Actividades del Proyecto (Hijo 2 de Proyecto)
        Schema::create('proyectos_proyecto_actividad', function (Blueprint $table) {
            $table->id('IdActividad');
            $table->foreignId('IdProyecto')
                ->constrained('proyectos_proyecto', 'IdProyecto')
                ->cascadeOnDelete();
            $table->string('Nombre', 200);
            $table->text('Descripcion')->nullable();
            $table->date('FechaEntrega')->nullable();
            $table->string('Tipo', 50)->default('Individual'); // Individual, Equipo, Grupo
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 8. Actividades Adicionales (Drawer de Actividad)
        Schema::create('proyectos_proyecto_actividad_adicional', function (Blueprint $table) {
            $table->id('IdActividadAdicional');
            $table->foreignId('IdActividad')
                ->constrained('proyectos_proyecto_actividad', 'IdActividad')
                ->cascadeOnDelete();
            $table->text('Descripcion');
            $table->string('UrlRecurso', 1000);
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 9. Equipos de la Actividad (Sub-hijo 1)
        Schema::create('proyectos_grupo_actividad_equipo', function (Blueprint $table) {
            $table->id('IdEquipo');
            $table->foreignId('IdActividad')
                ->constrained('proyectos_proyecto_actividad', 'IdActividad')
                ->cascadeOnDelete();
            $table->foreignId('IdPersona')
                ->constrained('proyectos_persona', 'IdPersona')
                ->cascadeOnDelete();
            $table->timestamp('FechaRegistro')->useCurrent();

            $table->unique(['IdActividad', 'IdPersona'], 'proyectos_actividad_persona_unique');
        });

        // 10. Recursos / Entregas de la Actividad (Sub-hijo 2)
        Schema::create('proyectos_grupo_actividad_recurso', function (Blueprint $table) {
            $table->id('IdActividadRecurso');
            $table->foreignId('IdActividad')
                ->constrained('proyectos_proyecto_actividad', 'IdActividad')
                ->cascadeOnDelete();
            $table->foreignId('IdPersona')
                ->nullable()
                ->constrained('proyectos_persona', 'IdPersona')
                ->nullOnDelete();
            $table->string('Nombre', 200);
            $table->string('URLRecurso', 1000);
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 11. Kardex de Estatus de Actividad de Proyecto
        Schema::create('proyectos_kardex_proyecto_actividad_estatus', function (Blueprint $table) {
            $table->id('IdActividadEstatus');
            $table->foreignId('IdActividad')
                ->constrained('proyectos_proyecto_actividad', 'IdActividad')
                ->cascadeOnDelete();
            $table->string('Estatus', 50)->default('No Realizado');
            $table->timestamp('FechaRegistro')->useCurrent();
        });

        // 12. Kardex de Estatus de Recurso de Actividad de Proyecto
        Schema::create('proyectos_kardex_proyecto_actividad_recurso_estatus', function (Blueprint $table) {
            $table->id('IdActividadRecursoEstatus');
            $table->foreignId('IdActividadRecurso')
                ->constrained('proyectos_grupo_actividad_recurso', 'IdActividadRecurso')
                ->cascadeOnDelete();
            $table->string('Estatus', 50)->default('No Realizado');
            $table->timestamp('FechaRegistro')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyectos_kardex_proyecto_actividad_recurso_estatus');
        Schema::dropIfExists('proyectos_kardex_proyecto_actividad_estatus');
        Schema::dropIfExists('proyectos_grupo_actividad_recurso');
        Schema::dropIfExists('proyectos_grupo_actividad_equipo');
        Schema::dropIfExists('proyectos_proyecto_actividad_adicional');
        Schema::dropIfExists('proyectos_proyecto_actividad');
        Schema::dropIfExists('proyectos_grupo_persona');
        Schema::dropIfExists('proyectos_proyecto_recurso_adicional');
        Schema::dropIfExists('proyectos_proyecto_recurso');
        Schema::dropIfExists('proyectos_proyecto');
        Schema::dropIfExists('proyectos_rol');
        Schema::dropIfExists('proyectos_persona');
    }
};
