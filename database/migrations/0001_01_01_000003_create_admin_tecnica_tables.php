<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tablas de admin_tecnica que usa el login. En un proyecto real ya existen en la
 * base maestra y esta migración no hace nada; solo las crea para desarrollar y
 * probar con sqlite sin una admin_tecnica a la mano.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('admin_usuarios')) {
            Schema::create('admin_usuarios', function (Blueprint $table) {
                $table->unsignedInteger('IdUsuario')->primary();
                $table->string('SIdUsuario', 50);
                $table->binary('SPassword')->nullable();
                $table->string('SNombre', 150);
                $table->string('SMail', 150);
                $table->string('STelefono', 30)->nullable();
                $table->string('EActivo', 2)->default('Si');
                $table->string('remember_token', 100)->nullable();
                $table->dateTime('FechaHora')->nullable();
            });
        }

        if (! Schema::hasTable('admin_clientes')) {
            Schema::create('admin_clientes', function (Blueprint $table) {
                $table->unsignedInteger('IdCliente')->primary();
                $table->string('SCodigoCliente', 50)->nullable();
                $table->string('SNombre', 150);
                $table->string('URL_logo')->nullable();
                $table->string('DB_HOST', 150)->nullable();
                $table->unsignedSmallInteger('DB_PORT')->nullable();
                $table->string('DB_DATABASE', 150)->nullable();
                $table->string('DB_USERNAME', 150)->nullable();
                $table->string('DB_PASSWORD', 150)->nullable();
                $table->string('EActivo', 2)->default('Si');
                $table->dateTime('FechaHora')->nullable();
            });
        }

        if (! Schema::hasTable('admin_clientes_roles_usuarios')) {
            Schema::create('admin_clientes_roles_usuarios', function (Blueprint $table) {
                $table->unsignedInteger('IdRolUsuario')->primary();
                $table->unsignedInteger('IdCliente');
                $table->unsignedInteger('IdRol');
                $table->unsignedInteger('IdUsuario');
                $table->dateTime('FechaHora')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_clientes_roles_usuarios');
        Schema::dropIfExists('admin_clientes');
        Schema::dropIfExists('admin_usuarios');
    }
};
