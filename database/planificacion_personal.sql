-- ==========================================================
-- Base de Datos: planificacion_personal
-- Generado a partir del Diagrama Entidad-Relación (ER)
-- Compatible con: MySQL 8.0+ / MariaDB 10.4+ (XAMPP)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `planificacion_personal`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `planificacion_personal`;

-- Desactivar temporalmente revisión de llaves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Catálogo: cine_tipo_opinion
-- Nota ER: tipo opinion (agregar, editar, eliminar)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_tipo_opinion`;
CREATE TABLE `cine_tipo_opinion` (
    `IdTipoOpinion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdTipoOpinion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de tipos de opinión';

-- ----------------------------------------------------------
-- 2. Entidad: cine_directores
-- Nota ER: directores (agregar cuando se busca el nombre se llena campos de api, editar, eliminar)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_directores`;
CREATE TABLE `cine_directores` (
    `IdDirector` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `NombreDirector` VARCHAR(150) NOT NULL,
    `Fecha_Nacimiento` DATE NULL,
    `Descripcion` TEXT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdDirector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de directores obtenidos por API o manual';

-- ----------------------------------------------------------
-- 3. Entidad: cine_produccion
-- Nota ER: produccion (agregar cuando se busca el nombre se llena campos de api, editar, eliminar)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_produccion`;
CREATE TABLE `cine_produccion` (
    `IdProduccion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `NombreProduccion` VARCHAR(255) NOT NULL,
    `Sinopsis` TEXT NULL,
    `FechaProduccion` DATE NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccion`),
    INDEX `idx_produccion_nombre` (`NombreProduccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Películas, series o producciones';

-- ----------------------------------------------------------
-- 4. Tabla Intermedia: cine_produccion_directores
-- Relación Muchos a Muchos entre Producciones y Directores
-- Permite asociar uno o más directores por producción
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_produccion_directores`;
CREATE TABLE `cine_produccion_directores` (
    `IdProduccionDirector` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdProduccion` INT UNSIGNED NOT NULL,
    `IdDirector` INT UNSIGNED NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccionDirector`),
    UNIQUE KEY `uk_produccion_director` (`IdProduccion`, `IdDirector`),
    INDEX `idx_pdir_produccion` (`IdProduccion`),
    INDEX `idx_pdir_director` (`IdDirector`),
    CONSTRAINT `fk_pdir_produccion`
        FOREIGN KEY (`IdProduccion`)
        REFERENCES `cine_produccion` (`IdProduccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_pdir_director`
        FOREIGN KEY (`IdDirector`)
        REFERENCES `cine_directores` (`IdDirector`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación intermedia entre producciones y sus directores';

-- ----------------------------------------------------------
-- 5. Entidad: cine_produccion_recurso
-- Nota ER: produccion recurso (agregar, editar, eliminar)
-- En el diagrama el óvalo PK decía "IdProduccionEstatus" por error de copiado; se define IdProduccionRecurso.
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_produccion_recurso`;
CREATE TABLE `cine_produccion_recurso` (
    `IdProduccionRecurso` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdProduccion` INT UNSIGNED NOT NULL,
    `Tipo` ENUM('ver', 'video', 'sitio', 'imagen', 'documento') NOT NULL,
    `URL_produccion_recurso` TEXT NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccionRecurso`),
    INDEX `idx_recurso_produccion` (`IdProduccion`),
    CONSTRAINT `fk_recurso_produccion`
        FOREIGN KEY (`IdProduccion`)
        REFERENCES `cine_produccion` (`IdProduccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos multimedia y enlaces de producciones';

-- ----------------------------------------------------------
-- 6. Entidad: cine_produccion_comentario
-- Nota ER: produccion comentario (agregar, editar, eliminar)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_produccion_comentario`;
CREATE TABLE `cine_produccion_comentario` (
    `IdProduccionComentario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdProduccion` INT UNSIGNED NOT NULL,
    `IdTipoOpinion` INT UNSIGNED NULL COMMENT 'Relación opcional con catálogo cine_tipo_opinion',
    `titulo` VARCHAR(200) NOT NULL,
    `comentario` TEXT NOT NULL,
    `calificacion` TINYINT UNSIGNED NULL COMMENT 'Escala de 1 a 10 (o 1 a 5)',
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccionComentario`),
    INDEX `idx_comentario_produccion` (`IdProduccion`),
    INDEX `idx_comentario_tipo_opinion` (`IdTipoOpinion`),
    CONSTRAINT `fk_comentario_produccion`
        FOREIGN KEY (`IdProduccion`)
        REFERENCES `cine_produccion` (`IdProduccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_comentario_tipo_opinion`
        FOREIGN KEY (`IdTipoOpinion`)
        REFERENCES `cine_tipo_opinion` (`IdTipoOpinion`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comentarios y opiniones de las producciones';

-- ----------------------------------------------------------
-- 7. Entidad: cine_kardex_produccion_seguimiento
-- Nota ER: produccion estatus: agregar (bitácora de seguimiento)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_kardex_produccion_seguimiento`;
CREATE TABLE `cine_kardex_produccion_seguimiento` (
    `IdProduccionSeguimiento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdProduccion` INT UNSIGNED NOT NULL,
    `Fecha` DATE NOT NULL,
    `Hora` TIME NOT NULL,
    `Descripcion` TEXT NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccionSeguimiento`),
    INDEX `idx_seguimiento_produccion` (`IdProduccion`),
    CONSTRAINT `fk_seguimiento_produccion`
        FOREIGN KEY (`IdProduccion`)
        REFERENCES `cine_produccion` (`IdProduccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial y seguimiento de visualización o eventos de la producción';

-- ----------------------------------------------------------
-- 8. Entidad: cine_kardex_produccion_estatus
-- Nota ER: produccion estatus (editar se hara insert automatico al agregar una produccion)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `cine_kardex_produccion_estatus`;
CREATE TABLE `cine_kardex_produccion_estatus` (
    `IdProduccionEstatus` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdProduccion` INT UNSIGNED NOT NULL,
    `Estatus` ENUM('viendo', 'por ver', 'visto') NOT NULL DEFAULT 'por ver',
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdProduccionEstatus`),
    INDEX `idx_estatus_produccion` (`IdProduccion`),
    CONSTRAINT `fk_estatus_produccion`
        FOREIGN KEY (`IdProduccion`)
        REFERENCES `cine_produccion` (`IdProduccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kardex / estado actual de la producción (viendo, por ver, visto)';

-- ----------------------------------------------------------
-- TRIGGER (Opcional): Inserción automática de estatus inicial
-- Según la nota: "se hara insert automatico al agregar una produccion"
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_produccion_insert_estatus`;
DELIMITER $$
CREATE TRIGGER `trg_produccion_insert_estatus`
AFTER INSERT ON `cine_produccion`
FOR EACH ROW
BEGIN
    INSERT INTO `cine_kardex_produccion_estatus` (`IdProduccion`, `Estatus`, `FechaRegistro`)
    VALUES (NEW.`IdProduccion`, 'por ver', NOW());
END$$
DELIMITER ;

-- ==========================================================
-- MÓDULO CONTABILIDAD (CRUD Alumnos, Ciclo, Retos, Lecciones)
-- Generado a partir del Diagrama Entidad-Relación (ER)
-- ==========================================================

-- ----------------------------------------------------------
-- 9. Catálogo: contabilidad_alumno
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_alumno`;
CREATE TABLE `contabilidad_alumno` (
    `IdAlumno` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `ApellidoPaterno` VARCHAR(100) NOT NULL,
    `ApellidoMaterno` VARCHAR(100) NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdAlumno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de alumnos';

-- ----------------------------------------------------------
-- 10. Catálogo: contabilidad_oportunidades
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_oportunidades`;
CREATE TABLE `contabilidad_oportunidades` (
    `IdOportunidad` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdOportunidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de oportunidades';

-- ----------------------------------------------------------
-- 11. Catálogo: contabilidad_periodo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_periodo`;
CREATE TABLE `contabilidad_periodo` (
    `IdPeriodo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `FechaInicio` DATE NOT NULL,
    `FechaFin` DATE NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdPeriodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Periodos escolares';

-- ----------------------------------------------------------
-- 12. Catálogo: contabilidad_grupo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_grupo`;
CREATE TABLE `contabilidad_grupo` (
    `IdGrupo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Grupo` VARCHAR(100) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdGrupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Grupos escolares';

-- ----------------------------------------------------------
-- 13. Catálogo: contabilidad_modulo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo`;
CREATE TABLE `contabilidad_modulo` (
    `IdModulo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Modulo` VARCHAR(150) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdModulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulos o asignaturas';

-- ----------------------------------------------------------
-- 14. Catálogo: contabilidad_asesor
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_asesor`;
CREATE TABLE `contabilidad_asesor` (
    `IdAsesor` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `ApellidoPaterno` VARCHAR(100) NOT NULL,
    `ApellidoMaterno` VARCHAR(100) NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdAsesor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de asesores / docentes';

-- ----------------------------------------------------------
-- 15. Entidad: contabilidad_ciclo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_ciclo`;
CREATE TABLE `contabilidad_ciclo` (
    `IdCiclo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdPeriodo` INT UNSIGNED NOT NULL,
    `IdOportunidad` INT UNSIGNED NOT NULL,
    `IdGrupo` INT UNSIGNED NOT NULL,
    `IdAsesor` INT UNSIGNED NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdCiclo`),
    INDEX `idx_ciclo_periodo` (`IdPeriodo`),
    INDEX `idx_ciclo_oportunidad` (`IdOportunidad`),
    INDEX `idx_ciclo_grupo` (`IdGrupo`),
    INDEX `idx_ciclo_asesor` (`IdAsesor`),
    CONSTRAINT `fk_ciclo_periodo`
        FOREIGN KEY (`IdPeriodo`)
        REFERENCES `contabilidad_periodo` (`IdPeriodo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_ciclo_oportunidad`
        FOREIGN KEY (`IdOportunidad`)
        REFERENCES `contabilidad_oportunidades` (`IdOportunidad`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_ciclo_grupo`
        FOREIGN KEY (`IdGrupo`)
        REFERENCES `contabilidad_grupo` (`IdGrupo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_ciclo_asesor`
        FOREIGN KEY (`IdAsesor`)
        REFERENCES `contabilidad_asesor` (`IdAsesor`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de ciclo escolar';

-- ----------------------------------------------------------
-- 16. Entidad: contabilidad_modulo_reto
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo_reto`;
CREATE TABLE `contabilidad_modulo_reto` (
    `IdReto` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdModulo` INT UNSIGNED NOT NULL,
    `Nombre` VARCHAR(200) NOT NULL,
    `UrlReto` TEXT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdReto`),
    INDEX `idx_reto_modulo` (`IdModulo`),
    CONSTRAINT `fk_reto_modulo`
        FOREIGN KEY (`IdModulo`)
        REFERENCES `contabilidad_modulo` (`IdModulo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Retos de cada módulo';

-- ----------------------------------------------------------
-- 17. Entidad: contabilidad_modulo_reto_recurso
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo_reto_recurso`;
CREATE TABLE `contabilidad_modulo_reto_recurso` (
    `IdRetoRecurso` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdReto` INT UNSIGNED NOT NULL,
    `IdModuloDetalle` INT UNSIGNED NULL,
    `Nombre` VARCHAR(200) NOT NULL,
    `URLRecurso` TEXT NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdRetoRecurso`),
    INDEX `idx_retorecurso_reto` (`IdReto`),
    INDEX `idx_retorecurso_modulodetalle` (`IdModuloDetalle`),
    CONSTRAINT `fk_retorecurso_reto`
        FOREIGN KEY (`IdReto`)
        REFERENCES `contabilidad_modulo_reto` (`IdReto`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos para retos';

-- ----------------------------------------------------------
-- 18. Entidad: contabilidad_modulo_reto_alumno
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo_reto_alumno`;
CREATE TABLE `contabilidad_modulo_reto_alumno` (
    `IdRetoAlumno` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdReto` INT UNSIGNED NOT NULL,
    `IdAlumno` INT UNSIGNED NOT NULL,
    `IdRetoRecurso` INT UNSIGNED NULL,
    `IdModuloDetalle` INT UNSIGNED NULL,
    `Nombre` VARCHAR(200) NOT NULL,
    `URLRecurso` TEXT NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdRetoAlumno`),
    INDEX `idx_retoalumno_reto` (`IdReto`),
    INDEX `idx_retoalumno_alumno` (`IdAlumno`),
    INDEX `idx_retoalumno_recurso` (`IdRetoRecurso`),
    INDEX `idx_retoalumno_modulodetalle` (`IdModuloDetalle`),
    CONSTRAINT `fk_retoalumno_reto`
        FOREIGN KEY (`IdReto`)
        REFERENCES `contabilidad_modulo_reto` (`IdReto`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_retoalumno_alumno`
        FOREIGN KEY (`IdAlumno`)
        REFERENCES `contabilidad_alumno` (`IdAlumno`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_retoalumno_recurso`
        FOREIGN KEY (`IdRetoRecurso`)
        REFERENCES `contabilidad_modulo_reto_recurso` (`IdRetoRecurso`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Actividades y entregas de alumnos para cada reto';

-- ----------------------------------------------------------
-- 19. Entidad: contabilidad_modulo_leccion
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo_leccion`;
CREATE TABLE `contabilidad_modulo_leccion` (
    `IdLeccion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdModulo` INT UNSIGNED NOT NULL,
    `Nombre` VARCHAR(200) NOT NULL,
    `UrlLeccion` TEXT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdLeccion`),
    INDEX `idx_leccion_modulo` (`IdModulo`),
    CONSTRAINT `fk_leccion_modulo`
        FOREIGN KEY (`IdModulo`)
        REFERENCES `contabilidad_modulo` (`IdModulo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lecciones de cada módulo';

-- ----------------------------------------------------------
-- 20. Entidad: contabilidad_modulo_leccion_recurso
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo_leccion_recurso`;
CREATE TABLE `contabilidad_modulo_leccion_recurso` (
    `IdLeccionRecurso` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `IdLeccion` INT UNSIGNED NOT NULL,
    `Nombre` VARCHAR(200) NOT NULL,
    `URLRecurso` TEXT NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdLeccionRecurso`),
    INDEX `idx_leccionrecurso_leccion` (`IdLeccion`),
    CONSTRAINT `fk_leccionrecurso_leccion`
        FOREIGN KEY (`IdLeccion`)
        REFERENCES `contabilidad_modulo_leccion` (`IdLeccion`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos asociados a lecciones';

-- Reactivar revisión de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;
