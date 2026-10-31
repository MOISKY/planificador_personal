export interface UsuarioConfigItem {
    IdUsuario: number;
    SIdUsuario?: string;
    NombreUsuario?: string;
    SNombre: string;
    SMail: string;
    STelefono?: string | null;
    EActivo: 'Si' | 'No';
    password_plano?: string;
    FechaRegistro?: string;
    FechaHora?: string;
}

export interface UsuarioSimpleOption {
    IdUsuario: number;
    NombreUsuario?: string;
    SNombre: string;
    SMail: string;
}

export interface ConfiguracionGithubItem {
    IdUsuarioConfiguracionGithub: number;
    IdUsuario: number;
    GITHUB_USERNAME: string;
    GITHUB_TOKEN?: string;
    FechaRegistro?: string;
    usuario?: UsuarioSimpleOption;
}

export interface ConfiguracionGmailItem {
    IdUsuarioConfiguracionGmail: number;
    IdUsuario: number;
    MAIL_MAILER: string;
    MAIL_SCHEME?: string | null;
    MAIL_HOST?: string | null;
    MAIL_PORT?: number | null;
    MAIL_USERNAME?: string | null;
    MAIL_PASSWORD?: string | null;
    MAIL_FROM_NAME?: string | null;
    MAIL_FROM_ADDRESS?: string | null;
    FechaRegistro?: string;
    usuario?: UsuarioSimpleOption;
}

