import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface User {
    IdUsuario: number;
    SIdUsuario: string;
    SNombre: string;
    SMail: string;
    EActivo: 'Si' | 'No';
    name: string;
    email: string;
    avatar?: string | null;
    [key: string]: unknown;
}

export interface Cliente {
    IdCliente: number;
    SNombre: string;
    SCodigoCliente: string | null;
    URL_logo: string | null;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    cacheTags?: string[];
    badge?: React.ReactNode;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    flash: Flash;
    [key: string]: unknown;
}
