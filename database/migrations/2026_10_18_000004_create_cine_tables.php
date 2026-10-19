<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cine_tipo_opinion')) {
            Schema::create('cine_tipo_opinion', function (Blueprint $table) {
                $table->increments('IdTipoOpinion');
                $table->string('Nombre', 100);
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        if (! Schema::hasTable('cine_directores')) {
            Schema::create('cine_directores', function (Blueprint $table) {
                $table->increments('IdDirector');
                $table->string('NombreDirector', 150);
                $table->date('Fecha_Nacimiento')->nullable();
                $table->text('Descripcion')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        if (! Schema::hasTable('cine_produccion')) {
            Schema::create('cine_produccion', function (Blueprint $table) {
                $table->increments('IdProduccion');
                $table->string('NombreProduccion', 255);
                $table->text('Sinopsis')->nullable();
                $table->date('FechaProduccion')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();
            });
        }

        if (! Schema::hasTable('cine_produccion_directores')) {
            Schema::create('cine_produccion_directores', function (Blueprint $table) {
                $table->increments('IdProduccionDirector');
                $table->unsignedInteger('IdProduccion');
                $table->unsignedInteger('IdDirector');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->unique(['IdProduccion', 'IdDirector']);
                $table->foreign('IdProduccion')->references('IdProduccion')->on('cine_produccion')->cascadeOnDelete();
                $table->foreign('IdDirector')->references('IdDirector')->on('cine_directores')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('cine_produccion_recurso')) {
            Schema::create('cine_produccion_recurso', function (Blueprint $table) {
                $table->increments('IdProduccionRecurso');
                $table->unsignedInteger('IdProduccion');
                $table->string('Tipo', 50); // ver, video, sitio, imagen, documento
                $table->text('URL_produccion_recurso');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdProduccion')->references('IdProduccion')->on('cine_produccion')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('cine_produccion_comentario')) {
            Schema::create('cine_produccion_comentario', function (Blueprint $table) {
                $table->increments('IdProduccionComentario');
                $table->unsignedInteger('IdProduccion');
                $table->unsignedInteger('IdTipoOpinion')->nullable();
                $table->string('titulo', 200);
                $table->text('comentario');
                $table->unsignedTinyInteger('calificacion')->nullable();
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdProduccion')->references('IdProduccion')->on('cine_produccion')->cascadeOnDelete();
                $table->foreign('IdTipoOpinion')->references('IdTipoOpinion')->on('cine_tipo_opinion')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('cine_kardex_produccion_seguimiento')) {
            Schema::create('cine_kardex_produccion_seguimiento', function (Blueprint $table) {
                $table->increments('IdProduccionSeguimiento');
                $table->unsignedInteger('IdProduccion');
                $table->date('Fecha');
                $table->time('Hora');
                $table->text('Descripcion');
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdProduccion')->references('IdProduccion')->on('cine_produccion')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('cine_kardex_produccion_estatus')) {
            Schema::create('cine_kardex_produccion_estatus', function (Blueprint $table) {
                $table->increments('IdProduccionEstatus');
                $table->unsignedInteger('IdProduccion');
                $table->string('Estatus', 50)->default('por ver'); // viendo, por ver, visto
                $table->dateTime('FechaRegistro')->useCurrent();

                $table->foreign('IdProduccion')->references('IdProduccion')->on('cine_produccion')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cine_kardex_produccion_estatus');
        Schema::dropIfExists('cine_kardex_produccion_seguimiento');
        Schema::dropIfExists('cine_produccion_comentario');
        Schema::dropIfExists('cine_produccion_recurso');
        Schema::dropIfExists('cine_produccion_directores');
        Schema::dropIfExists('cine_produccion');
        Schema::dropIfExists('cine_directores');
        Schema::dropIfExists('cine_tipo_opinion');
    }
};
