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
        // 1. admin_proyecto (Proyecto CRUD)
        if (! Schema::hasTable('admin_proyecto')) {
            Schema::create('admin_proyecto', function (Blueprint $table) {
                $table->id('IdProyecto');
                $table->string('Nombre', 200);
                $table->text('Descripcion')->nullable();
                $table->date('FechaInicio')->nullable();
                $table->string('Duracion', 100)->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 2. admin_kardex_proyecto_estatus
        if (! Schema::hasTable('admin_kardex_proyecto_estatus')) {
            Schema::create('admin_kardex_proyecto_estatus', function (Blueprint $table) {
                $table->id('IdAdminProyectoEstatus');
                $table->foreignId('IdProyecto')
                    ->constrained('admin_proyecto', 'IdProyecto')
                    ->cascadeOnDelete();
                $table->string('Estatus', 50)->default('Pendiente');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 3. admin_proyecto_personal (Miembros Proyecto CRUD)
        if (! Schema::hasTable('admin_proyecto_personal')) {
            Schema::create('admin_proyecto_personal', function (Blueprint $table) {
                $table->id('IdProyectoPersonal');
                $table->foreignId('IdProyecto')
                    ->constrained('admin_proyecto', 'IdProyecto')
                    ->cascadeOnDelete();
                $table->foreignId('IdPersonal')
                    ->constrained('admin_personal', 'IdPersonal')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();

                $table->unique(['IdProyecto', 'IdPersonal'], 'admin_proyecto_personal_unique');
            });
        }

        // 4. admin_proyecto_modulo (Módulos Proyecto CRUD)
        if (! Schema::hasTable('admin_proyecto_modulo')) {
            Schema::create('admin_proyecto_modulo', function (Blueprint $table) {
                $table->id('IdProyectoModulo');
                $table->foreignId('IdProyecto')
                    ->constrained('admin_proyecto', 'IdProyecto')
                    ->cascadeOnDelete();
                $table->foreignId('IdModulo')
                    ->constrained('admin_modulos', 'IdModulo')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();

                $table->unique(['IdProyecto', 'IdModulo'], 'admin_proyecto_modulo_unique');
            });
        }

        // 5. admin_proyecto_actividad (Actividades CRUD)
        if (! Schema::hasTable('admin_proyecto_actividad')) {
            Schema::create('admin_proyecto_actividad', function (Blueprint $table) {
                $table->id('IdActividad');
                $table->foreignId('IdProyecto')
                    ->constrained('admin_proyecto', 'IdProyecto')
                    ->cascadeOnDelete();
                $table->string('Nombre', 200);
                $table->text('Descripcion')->nullable();
                $table->date('FechaEntrega')->nullable();
                $table->foreignId('IdModulo')
                    ->nullable()
                    ->constrained('admin_modulos', 'IdModulo')
                    ->nullOnDelete();
                $table->string('Tipo', 50)->default('Individual'); // Individual, Equipo, Todos
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 6. admin_kardex_proyecto_actividad_estatus
        if (! Schema::hasTable('admin_kardex_proyecto_actividad_estatus')) {
            Schema::create('admin_kardex_proyecto_actividad_estatus', function (Blueprint $table) {
                $table->id('IdAdminActividadEstatus');
                $table->foreignId('IdActividad')
                    ->constrained('admin_proyecto_actividad', 'IdActividad')
                    ->cascadeOnDelete();
                $table->string('Estatus', 50)->default('No Realizada');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 7. admin_proyecto_actividad_adicional (Actividad Adicional Drawer)
        if (! Schema::hasTable('admin_proyecto_actividad_adicional')) {
            Schema::create('admin_proyecto_actividad_adicional', function (Blueprint $table) {
                $table->id('IdActividadAdicional');
                $table->foreignId('IdActividad')
                    ->constrained('admin_proyecto_actividad', 'IdActividad')
                    ->cascadeOnDelete();
                $table->text('Descripcion')->nullable();
                $table->string('UrlRecurso', 1000)->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 8. admin_proyecto_actividad_equipo (Grupo Personal CRUD)
        if (! Schema::hasTable('admin_proyecto_actividad_equipo')) {
            Schema::create('admin_proyecto_actividad_equipo', function (Blueprint $table) {
                $table->id('IdEquipo');
                $table->foreignId('IdActividad')
                    ->constrained('admin_proyecto_actividad', 'IdActividad')
                    ->cascadeOnDelete();
                $table->foreignId('IdPersonal')
                    ->constrained('admin_personal', 'IdPersonal')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();

                $table->unique(['IdActividad', 'IdPersonal'], 'admin_actividad_personal_unique');
            });
        }

        // 9. admin_proyecto_actividad_recurso (Actividades Personal CRUD)
        if (! Schema::hasTable('admin_proyecto_actividad_recurso')) {
            Schema::create('admin_proyecto_actividad_recurso', function (Blueprint $table) {
                $table->id('IdActividadRecurso');
                $table->foreignId('IdActividad')
                    ->constrained('admin_proyecto_actividad', 'IdActividad')
                    ->cascadeOnDelete();
                $table->foreignId('IdPersonal')
                    ->nullable()
                    ->constrained('admin_personal', 'IdPersonal')
                    ->nullOnDelete();
                $table->string('Nombre', 200);
                $table->string('URLRecurso', 1000)->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 10. admin_kardex_proyecto_actividad_recurso_estatus
        if (! Schema::hasTable('admin_kardex_proyecto_actividad_recurso_estatus')) {
            Schema::create('admin_kardex_proyecto_actividad_recurso_estatus', function (Blueprint $table) {
                $table->id('IdAdminActividadRecursoEstatus');
                $table->foreignId('IdActividadRecurso')
                    ->constrained('admin_proyecto_actividad_recurso', 'IdActividadRecurso')
                    ->cascadeOnDelete();
                $table->string('Estatus', 50)->default('No Realizada');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_kardex_proyecto_actividad_recurso_estatus');
        Schema::dropIfExists('admin_proyecto_actividad_recurso');
        Schema::dropIfExists('admin_proyecto_actividad_equipo');
        Schema::dropIfExists('admin_proyecto_actividad_adicional');
        Schema::dropIfExists('admin_kardex_proyecto_actividad_estatus');
        Schema::dropIfExists('admin_proyecto_actividad');
        Schema::dropIfExists('admin_proyecto_modulo');
        Schema::dropIfExists('admin_proyecto_personal');
        Schema::dropIfExists('admin_kardex_proyecto_estatus');
        Schema::dropIfExists('admin_proyecto');
    }
};
