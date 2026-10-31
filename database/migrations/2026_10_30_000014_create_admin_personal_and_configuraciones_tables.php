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
        // 1. Modificar tabla admin_usuarios para asegurar campos requeridos
        if (Schema::hasTable('admin_usuarios')) {
            Schema::table('admin_usuarios', function (Blueprint $table) {
                if (! Schema::hasColumn('admin_usuarios', 'NombreUsuario')) {
                    $table->string('NombreUsuario', 50)->nullable();
                }
                if (! Schema::hasColumn('admin_usuarios', 'FechaRegistro')) {
                    $table->timestamp('FechaRegistro')->nullable()->useCurrent();
                }
            });
        }

        // 2. admin_modulos
        if (! Schema::hasTable('admin_modulos')) {
            Schema::create('admin_modulos', function (Blueprint $table) {
                $table->id('IdModulo');
                $table->string('Codigo', 50);
                $table->string('Nombre', 150);
                $table->string('EActivo', 2)->default('Si');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 3. admin_cargo
        if (! Schema::hasTable('admin_cargo')) {
            Schema::create('admin_cargo', function (Blueprint $table) {
                $table->id('IdCargo');
                $table->string('Codigo', 50);
                $table->string('Nombre', 150);
                $table->string('EActivo', 2)->default('Si');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 4. admin_personal
        if (! Schema::hasTable('admin_personal')) {
            Schema::create('admin_personal', function (Blueprint $table) {
                $table->id('IdPersonal');
                $table->string('Codigo', 50);
                $table->string('Nombre', 100);
                $table->string('APaterno', 100);
                $table->string('AMaterno', 100)->nullable();
                $table->string('Telefono', 20)->nullable();
                $table->string('Movil', 20)->nullable();
                $table->string('CorreoElectronico', 150)->nullable();
                $table->string('EActivo', 2)->default('Si');
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 5. admin_personal_cargo
        if (! Schema::hasTable('admin_personal_cargo')) {
            Schema::create('admin_personal_cargo', function (Blueprint $table) {
                $table->id('IdPersonalCargo');
                $table->foreignId('IdPersonal')
                    ->constrained('admin_personal', 'IdPersonal')
                    ->cascadeOnDelete();
                $table->foreignId('IdCargo')
                    ->constrained('admin_cargo', 'IdCargo')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 6. admin_personal_usuario
        if (! Schema::hasTable('admin_personal_usuario')) {
            Schema::create('admin_personal_usuario', function (Blueprint $table) {
                $table->id('IdPersonalUsuario');
                $table->foreignId('IdPersonal')
                    ->constrained('admin_personal', 'IdPersonal')
                    ->cascadeOnDelete();
                $table->unsignedInteger('IdUsuario');
                $table->foreign('IdUsuario')
                    ->references('IdUsuario')
                    ->on('admin_usuarios')
                    ->cascadeOnDelete();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 7. admin_usuario_configuracion_github
        if (! Schema::hasTable('admin_usuario_configuracion_github')) {
            Schema::create('admin_usuario_configuracion_github', function (Blueprint $table) {
                $table->id('IdUsuarioConfiguracionGithub');
                $table->unsignedInteger('IdUsuario');
                $table->foreign('IdUsuario')
                    ->references('IdUsuario')
                    ->on('admin_usuarios')
                    ->cascadeOnDelete();
                $table->text('GITHUB_TOKEN')->nullable();
                $table->string('GITHUB_USERNAME', 100)->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }

        // 8. admin_usuario_configuracion_gmail
        if (! Schema::hasTable('admin_usuario_configuracion_gmail')) {
            Schema::create('admin_usuario_configuracion_gmail', function (Blueprint $table) {
                $table->id('IdUsuarioConfiguracionGmail');
                $table->unsignedInteger('IdUsuario');
                $table->foreign('IdUsuario')
                    ->references('IdUsuario')
                    ->on('admin_usuarios')
                    ->cascadeOnDelete();
                $table->string('MAIL_MAILER', 50)->default('smtp');
                $table->string('MAIL_SCHEME', 50)->nullable();
                $table->string('MAIL_HOST', 150)->nullable();
                $table->integer('MAIL_PORT')->nullable();
                $table->string('MAIL_USERNAME', 150)->nullable();
                $table->text('MAIL_PASSWORD')->nullable();
                $table->string('MAIL_FROM_NAME', 150)->nullable();
                $table->string('MAIL_FROM_ADDRESS', 150)->nullable();
                $table->timestamp('FechaRegistro')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_usuario_configuracion_gmail');
        Schema::dropIfExists('admin_usuario_configuracion_github');
        Schema::dropIfExists('admin_personal_usuario');
        Schema::dropIfExists('admin_personal_cargo');
        Schema::dropIfExists('admin_personal');
        Schema::dropIfExists('admin_cargo');
        Schema::dropIfExists('admin_modulos');

        if (Schema::hasTable('admin_usuarios')) {
            Schema::table('admin_usuarios', function (Blueprint $table) {
                if (Schema::hasColumn('admin_usuarios', 'FechaRegistro')) {
                    $table->dropColumn('FechaRegistro');
                }
                if (Schema::hasColumn('admin_usuarios', 'NombreUsuario')) {
                    $table->dropColumn('NombreUsuario');
                }
            });
        }
    }
};
