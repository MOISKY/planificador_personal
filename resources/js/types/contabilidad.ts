export interface AlumnoItem {
    IdAlumno: number;
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno?: string | null;
    nombre_completo?: string;
    FechaRegistro?: string;
}

export interface OportunidadItem {
    IdOportunidad: number;
    Nombre: string;
    FechaRegistro?: string;
}

export interface PeriodoItem {
    IdPeriodo: number;
    Nombre: string;
    FechaInicio: string;
    FechaFin: string;
    FechaRegistro?: string;
}

export interface GrupoItem {
    IdGrupo: number;
    Grupo: string;
    FechaRegistro?: string;
}

export interface AsesorItem {
    IdAsesor: number;
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno?: string | null;
    nombre_completo?: string;
    FechaRegistro?: string;
}

export interface CicloItem {
    IdCiclo: number;
    IdPeriodo: number;
    IdOportunidad: number;
    IdGrupo: number;
    IdAsesor: number;
    FechaRegistro?: string;
    periodo?: PeriodoItem;
    oportunidad?: OportunidadItem;
    grupo?: GrupoItem;
    asesor?: AsesorItem;
}

export interface ModuloRetoRecursoItem {
    IdRetoRecurso: number;
    IdReto: number;
    IdModuloDetalle?: number | null;
    Nombre: string;
    URLRecurso: string;
    FechaRegistro?: string;
}

export interface ModuloRetoAlumnoItem {
    IdRetoAlumno: number;
    IdReto: number;
    IdAlumno: number;
    IdRetoRecurso?: number | null;
    IdModuloDetalle?: number | null;
    Nombre: string;
    URLRecurso: string;
    FechaRegistro?: string;
    alumno?: AlumnoItem;
    recurso_asociado?: ModuloRetoRecursoItem;
}

export interface ModuloRetoItem {
    IdReto: number;
    IdModulo: number;
    Nombre: string;
    UrlReto?: string | null;
    FechaRegistro?: string;
    modulo?: ModuloItem;
    recursos?: ModuloRetoRecursoItem[];
    actividades_alumnos?: ModuloRetoAlumnoItem[];
    recursos_count?: number;
    alumnos_count?: number;
    actividades_alumnos_count?: number;
}

export interface ModuloLeccionRecursoItem {
    IdLeccionRecurso: number;
    IdLeccion: number;
    Nombre: string;
    URLRecurso: string;
    FechaRegistro?: string;
}

export interface ModuloLeccionItem {
    IdLeccion: number;
    IdModulo: number;
    Nombre: string;
    UrlLeccion?: string | null;
    FechaRegistro?: string;
    modulo?: ModuloItem;
    recursos?: ModuloLeccionRecursoItem[];
    recursos_count?: number;
}

export interface ModuloItem {
    IdModulo: number;
    Modulo: string;
    FechaRegistro?: string;
    retos_count?: number;
    lecciones_count?: number;
    retos?: ModuloRetoItem[];
    lecciones?: ModuloLeccionItem[];
}

export type LeccionEstatusTipo = 'No leido' | 'Leyendo' | 'Leido';

export interface ModuloLeccionEstatusItem {
    IdLeccionEstatus: number;
    IdLeccion: number;
    Estatus: LeccionEstatusTipo;
    FechaRegistro?: string;
    leccion?: ModuloLeccionItem;
}

export type RetoRecursoEstatusTipo = 'No Realizado' | 'En Proceso' | 'Realizado';

export interface ModuloRetoRecursoEstatusItem {
    IdRetoRecursoEstatus: number;
    IdRetoRecurso: number;
    Estatus: RetoRecursoEstatusTipo;
    FechaRegistro?: string;
    recurso?: ModuloRetoRecursoItem & {
        reto?: ModuloRetoItem & {
            modulo?: ModuloItem;
        };
    };
}

