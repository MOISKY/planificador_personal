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

-- Reactivar revisión de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;
