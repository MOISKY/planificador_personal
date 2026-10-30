export interface EspecialidadItem {
    IdEspecialidad: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaRegistro?: string;
    candidatos_count?: number;
}

export interface CandidatoTipoItem {
    IdCandidatoTipo: number;
    Nombre: string;
    Descripcion?: string | null;
    FechaRegistro?: string;
    candidatos_count?: number;
}

export interface CandidatoItem {
    IdCandidato: number;
    Nombre: string;
    APaterno: string;
    AMaterno?: string | null;
    Telefono?: string | null;
    Movil?: string | null;
    IOrden: number;
    CorreoElectronico?: string | null;
    UrlCv?: string | null;
    EActivo: 'Si' | 'No' | string;
    IdEspecialidad: number;
    IdCandidatoTipo?: number | null;
    FechaRegistro?: string;
    nombre_completo?: string;
    especialidad?: EspecialidadItem | null;
    candidatoTipo?: CandidatoTipoItem | null;
}
