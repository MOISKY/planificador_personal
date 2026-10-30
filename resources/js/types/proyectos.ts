export interface PersonaItem {
    IdPersona: number;
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno?: string | null;
    correoElectronico?: string | null;
    telefono?: string | null;
    nombre_completo?: string;
    FechaRegistro?: string;
}

export interface RolItem {
    IdRol: number;
    Rol: string;
    FechaRegistro?: string;
}

export interface ProyectoRecursoAdicionalItem {
    IdRecursoAdicional: number;
    IdRecurso: number;
    Descripcion: string;
    UrlRecurso: string;
    FechaRegistro?: string;
}

export interface ProyectoRecursoItem {
    IdRecurso: number;
    IdProyecto: number;
    Nombre: string;
    Descripcion?: string | null;
    recursos_adicionales_count?: number;
    recursos_adicionales?: ProyectoRecursoAdicionalItem[];
    proyecto?: ProyectoItem;
    FechaRegistro?: string;
}

export interface GrupoPersonaItem {
    IdGrupoPersona: number;
    IdProyecto: number;
    IdPersona: number;
    IdRol: number;
    persona?: PersonaItem;
    rol?: RolItem;
    FechaRegistro?: string;
}

export interface ProyectoActividadAdicionalItem {
    IdActividadAdicional: number;
    IdActividad: number;
    Descripcion: string;
    UrlRecurso: string;
    FechaRegistro?: string;
}

export interface GrupoActividadEquipoItem {
    IdEquipo: number;
    IdActividad: number;
    IdPersona: number;
    persona?: PersonaItem;
    FechaRegistro?: string;
}

export interface KardexProyectoEstatusItem {
    IdProyectoEstatus: number;
    IdProyecto: number;
    Estatus: 'Pendiente' | 'En Emision' | 'Finalizado' | 'Cancelado' | 'Pausado';
    proyecto?: ProyectoItem;
    FechaRegistro?: string;
}

export interface KardexProyectoActividadEstatusItem {
    IdActividadEstatus: number;
    IdActividad: number;
    Estatus: 'No Realizado' | 'En Proceso' | 'Realizado';
    actividad?: ProyectoActividadItem;
    FechaRegistro?: string;
}

export interface ProyectoActividadItem {
    IdActividad: number;
    IdProyecto: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaEntrega?: string | null;
    Tipo: 'Individual' | 'Equipo' | 'Grupo';
    actividades_adicionales_count?: number;
    equipos_count?: number;
    recursos_count?: number;
    estatus_actual?: KardexProyectoActividadEstatusItem;
    actividades_adicionales?: ProyectoActividadAdicionalItem[];
    proyecto?: ProyectoItem;
    FechaRegistro?: string;
}

export interface KardexProyectoActividadRecursoEstatusItem {
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
    IdPersona?: number | null;
    URLRecurso: string;
    persona?: PersonaItem;
    actividad?: ProyectoActividadItem;
    estatus_actual?: KardexProyectoActividadRecursoEstatusItem;
    FechaRegistro?: string;
}

export interface ProyectoItem {
    IdProyecto: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaInicio?: string | null;
    FechaFinal?: string | null;
    duracion?: string | null;
    en_curso?: boolean;
    recursos_count?: number;
    personas_asignadas_count?: number;
    actividades_count?: number;
    estatus_actual?: KardexProyectoEstatusItem;
    FechaRegistro?: string;
}

