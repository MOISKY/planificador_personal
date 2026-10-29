export interface AlumnoItem {
    IdAlumno: number;
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno?: string | null;
    NombreCompleto?: string;
    FechaRegistro?: string;
}

export interface AsesorItem {
    IdAsesor: number;
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno?: string | null;
    NombreCompleto?: string;
    FechaRegistro?: string;
}

export interface PeriodoItem {
    IdPeriodo: number;
    Nombre: string;
    FechaInicio: string;
    FechaFin: string;
    FechaRegistro?: string;
}

export interface MateriaItem {
    IdMateria: number;
    Nombre: string;
    recursos_count?: number;
    FechaRegistro?: string;
}

export interface MateriaRecursoAdicionalItem {
    IdRecursoAdicional: number;
    IdRecurso: number;
    Descripcion: string;
    UrlRecurso: string;
    FechaRegistro?: string;
}

export interface MateriaRecursoItem {
    IdRecurso: number;
    IdMateria: number;
    Nombre: string;
    Descripcion?: string | null;
    recursos_adicionales_count?: number;
    recursos_adicionales?: MateriaRecursoAdicionalItem[];
    materia?: MateriaItem;
    FechaRegistro?: string;
}

export interface GrupoItem {
    IdGrupo: number;
    Grupo: string;
    IdPeriodo: number;
    IdMateria: number;
    IdAsesor: number;
    alumnos_count?: number;
    actividades_count?: number;
    periodo?: PeriodoItem;
    materia?: MateriaItem;
    asesor?: AsesorItem;
    FechaRegistro?: string;
}

export interface GrupoAlumnoItem {
    IdGrupoAlumno: number;
    IdGrupo: number;
    IdAlumno: number;
    alumno?: AlumnoItem;
    FechaRegistro?: string;
}

export interface GrupoActividadAdicionalItem {
    IdActividadAdicional: number;
    IdActividad: number;
    Descripcion: string;
    UrlRecurso: string;
    FechaRegistro?: string;
}

export interface GrupoActividadEquipoItem {
    IdEquipo: number;
    IdActividad: number;
    IdAlumno: number;
    alumno?: AlumnoItem;
    FechaRegistro?: string;
}

export interface KardexActividadEstatusItem {
    IdActividadEstatus: number;
    IdActividad: number;
    Estatus: 'No Realizado' | 'En Proceso' | 'Realizado';
    actividad?: GrupoActividadItem;
    FechaRegistro?: string;
}

export interface GrupoActividadItem {
    IdActividad: number;
    IdGrupo: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaEntrega?: string | null;
    Tipo: 'Individual' | 'Equipo' | 'Grupo';
    actividades_adicionales_count?: number;
    equipos_count?: number;
    recursos_count?: number;
    estatus_actual?: KardexActividadEstatusItem;
    actividades_adicionales?: GrupoActividadAdicionalItem[];
    grupo?: GrupoItem;
    FechaRegistro?: string;
}

export interface KardexActividadRecursoEstatusItem {
    IdActividadRecursoEstatus: number;
    IdActividadRecurso: number;
    Estatus: 'No Realizado' | 'En Proceso' | 'Realizado';
    recurso?: GrupoActividadRecursoItem;
    FechaRegistro?: string;
}

export interface GrupoActividadRecursoItem {
    IdActividadRecurso: number;
    IdActividad: number;
    Nombre: string;
    IdAlumno?: number | null;
    URLRecurso: string;
    alumno?: AlumnoItem;
    actividad?: GrupoActividadItem;
    estatus_actual?: KardexActividadRecursoEstatusItem;
    FechaRegistro?: string;
}

