export interface AdminPersonalSimple {
    IdPersonal: number;
    Nombre: string;
    APaterno: string;
    AMaterno?: string | null;
    CorreoElectronico?: string | null;
    Telefono?: string | null;
    Movil?: string | null;
    EActivo?: string;
}

export interface AdminModuloSimple {
    IdModulo: number;
    Codigo: string;
    Nombre: string;
    EActivo?: string;
}

export interface AdminKardexProyectoEstatusItem {
    IdAdminProyectoEstatus: number;
    IdProyecto: number;
    Estatus: string;
    FechaRegistro: string;
    proyecto?: {
        IdProyecto: number;
        Nombre: string;
    };
}

export interface AdminProyectoPersonalItem {
    IdProyectoPersonal: number;
    IdProyecto: number;
    IdPersonal: number;
    FechaRegistro: string;
    personal?: AdminPersonalSimple;
}

export interface AdminProyectoModuloItem {
    IdProyectoModulo: number;
    IdProyecto: number;
    IdModulo: number;
    FechaRegistro: string;
    modulo?: AdminModuloSimple;
}

export interface AdminKardexProyectoActividadEstatusItem {
    IdAdminActividadEstatus: number;
    IdActividad: number;
    Estatus: string;
    FechaRegistro: string;
    actividad?: {
        IdActividad: number;
        Nombre: string;
        proyecto?: {
            IdProyecto: number;
            Nombre: string;
        };
    };
}

export interface AdminProyectoActividadAdicionalItem {
    IdActividadAdicional: number;
    IdActividad: number;
    Descripcion?: string | null;
    UrlRecurso?: string | null;
    FechaRegistro: string;
}

export interface AdminProyectoActividadEquipoItem {
    IdEquipo: number;
    IdActividad: number;
    IdPersonal: number;
    FechaRegistro: string;
    personal?: AdminPersonalSimple;
}

export interface AdminKardexProyectoActividadRecursoEstatusItem {
    IdAdminActividadRecursoEstatus: number;
    IdActividadRecurso: number;
    Estatus: string;
    FechaRegistro: string;
    recurso?: {
        IdActividadRecurso: number;
        Nombre: string;
        actividad?: {
            IdActividad: number;
            Nombre: string;
            proyecto?: {
                IdProyecto: number;
                Nombre: string;
            };
        };
    };
}

export interface AdminProyectoActividadRecursoItem {
    IdActividadRecurso: number;
    IdActividad: number;
    IdPersonal?: number | null;
    Nombre: string;
    URLRecurso?: string | null;
    FechaRegistro: string;
    personal?: AdminPersonalSimple | null;
    estatusActual?: AdminKardexProyectoActividadRecursoEstatusItem | null;
    estatusKardex?: AdminKardexProyectoActividadRecursoEstatusItem[];
}

export interface AdminProyectoActividadItem {
    IdActividad: number;
    IdProyecto: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaEntrega?: string | null;
    IdModulo?: number | null;
    Tipo: 'Individual' | 'Equipo' | 'Todos';
    FechaRegistro: string;
    modulo?: AdminModuloSimple | null;
    estatusActual?: AdminKardexProyectoActividadEstatusItem | null;
    estatusKardex?: AdminKardexProyectoActividadEstatusItem[];
    actividadesAdicionales?: AdminProyectoActividadAdicionalItem[];
    actividades_adicionales_count?: number;
    equipos?: AdminProyectoActividadEquipoItem[];
    equipos_count?: number;
    recursos?: AdminProyectoActividadRecursoItem[];
    recursos_count?: number;
}

export interface AdminProyectoItem {
    IdProyecto: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaInicio?: string | null;
    Duracion?: string | null;
    FechaRegistro: string;
    estatusActual?: AdminKardexProyectoEstatusItem | null;
    estatusKardex?: AdminKardexProyectoEstatusItem[];
    miembros?: AdminProyectoPersonalItem[];
    miembros_count?: number;
    modulos?: AdminProyectoModuloItem[];
    modulos_count?: number;
    actividades?: AdminProyectoActividadItem[];
    actividades_count?: number;
}

