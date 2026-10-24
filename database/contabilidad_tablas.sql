-- ==========================================================
-- Base de Datos: planificacion_personal
-- Módulo: Contabilidad (CRUD Alumnos, Ciclo, Retos, Lecciones, etc.)
-- Generado a partir de los Diagramas Entidad-Relación (ER)
-- Compatible con: MySQL 8.0+ / MariaDB 10.4+ (XAMPP / phpMyAdmin)
-- ==========================================================

USE `planificacion_personal`;

-- Desactivar temporalmente revisión de llaves foráneas para ejecución limpia
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. ALUMNOS CRUD: contabilidad_alumno
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
-- 2. OPORTUNIDADES CRUD: contabilidad_oportunidades
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_oportunidades`;
CREATE TABLE `contabilidad_oportunidades` (
    `IdOportunidad` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdOportunidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de oportunidades (1ra, 2da, etc.)';

-- ----------------------------------------------------------
-- 3. PERIODOS CRUD: contabilidad_periodo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_periodo`;
CREATE TABLE `contabilidad_periodo` (
    `IdPeriodo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `FechaInicio` DATE NOT NULL,
    `FechaFin` DATE NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdPeriodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Periodos escolares o de evaluación';

-- ----------------------------------------------------------
-- 4. GRUPOS CRUD: contabilidad_grupo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_grupo`;
CREATE TABLE `contabilidad_grupo` (
    `IdGrupo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Grupo` VARCHAR(100) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdGrupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Grupos escolares';

-- ----------------------------------------------------------
-- 5. MODULOS CRUD: contabilidad_modulo
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_modulo`;
CREATE TABLE `contabilidad_modulo` (
    `IdModulo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Modulo` VARCHAR(150) NOT NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdModulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulos o asignaturas de contabilidad';

-- ----------------------------------------------------------
-- 6. ASESORES CRUD: contabilidad_asesor
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `contabilidad_asesor`;
CREATE TABLE `contabilidad_asesor` (
    `IdAsesor` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `ApellidoPaterno` VARCHAR(100) NOT NULL,
    `ApellidoMaterno` VARCHAR(100) NULL,
    `FechaRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`IdAsesor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de asesores o docentes';

-- ----------------------------------------------------------
-- 7. CICLO CRUD: contabilidad_ciclo
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de ciclos con periodo, oportunidad, grupo y asesor';

-- ----------------------------------------------------------
-- 8. RETOS CRUD: contabilidad_modulo_reto
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Retos o proyectos por módulo';

-- ----------------------------------------------------------
-- 9. RECURSOS DENTRO DE RETOS: contabilidad_modulo_reto_recurso
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos y materiales asociados a los retos';

-- ----------------------------------------------------------
-- 10. ACTIVIDADES ALUMNOS EN RETOS: contabilidad_modulo_reto_alumno
-- Nota ER: En el diagrama el óvalo de clave primaria decía "IdRetoRecurso" por duplicación gráfica de la entidad previa;
-- se define IdRetoAlumno como PK y se incluye IdRetoRecurso como referencia foránea opcional al recurso del reto.
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Entregas y actividades de alumnos para cada reto';

-- ----------------------------------------------------------
-- 11. LECCION CRUD: contabilidad_modulo_leccion
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lecciones teóricas o prácticas de cada módulo';

-- ----------------------------------------------------------
-- 12. RECURSOS DENTRO DE LECCION: contabilidad_modulo_leccion_recurso
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recursos asociados a cada lección';

-- Reactivar revisión de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;
