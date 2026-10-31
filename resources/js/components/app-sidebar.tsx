import AppLogo from '@/components/app-logo';
import {
    NavGroup,
    type SidebarMenuItemDef,
    type SidebarModuleGroup,
} from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';
import { Input } from '@/components/ui/input';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import cine from '@/routes/cine';
import github from '@/routes/github';
import desarrollo from '@/routes/desarrollo';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Award,
    BookmarkCheck,
    BookOpen,
    Calculator,
    CalendarCheck2,
    CalendarRange,
    CheckSquare,
    Clapperboard,
    Code2,
    Film,
    Boxes,
    FolderGit2,
    FolderKanban,
    ShieldCheck,
    GraduationCap,
    History,
    Languages,
    Layers,
    LayoutGrid,
    Link2,
    ListChecks,
    Mail,
    MessageSquare,
    MessageSquareText,
    Palette,
    Search,
    Settings,
    Table2,
    Target,
    TriangleAlert,
    User,
    UserCheck,
    UserCog,
    Users,
} from 'lucide-react';
import * as React from 'react';

const sinAcentos = (s: string) =>
    String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

function matchesTerm(text: string, term: string): boolean {
    return sinAcentos(text).includes(sinAcentos(term));
}

function filterItems(
    items: SidebarMenuItemDef[],
    term: string,
): SidebarMenuItemDef[] {
    if (!term) {
        return items;
    }

    const filtered: SidebarMenuItemDef[] = [];

    for (const item of items) {
        const matchesParent = matchesTerm(item.title, term);

        if (item.children?.length) {
            const children = matchesParent
                ? item.children
                : filterItems(item.children, term);

            if (children.length > 0 || matchesParent) {
                filtered.push({ ...item, children });
            }
        } else if (matchesParent) {
            filtered.push(item);
        }
    }

    return filtered;
}

function primeraHoja(
    independents: SidebarMenuItemDef[],
    modules: SidebarModuleGroup[],
): string | undefined {
    for (const item of independents) {
        if (item.href) {
            return item.href;
        }
    }

    const findInItems = (items: SidebarMenuItemDef[]): string | undefined => {
        for (const item of items) {
            if (item.href) {
                return item.href;
            }
            if (item.children?.length) {
                const found = findInItems(item.children);
                if (found) {
                    return found;
                }
            }
        }

        return undefined;
    };

    for (const mod of modules) {
        const found = findInItems(mod.items);
        if (found) {
            return found;
        }
    }

    return undefined;
}

export function AppSidebar() {
    const { urlIsActive } = useActiveUrl();
    const [search, setSearch] = React.useState('');
    const { repos, cineEstrenosProximosCount = 0 } = usePage<any>().props;
    const [newProjectsCount, setNewProjectsCount] = React.useState(0);

    React.useEffect(() => {
        const lastVisitStr = localStorage.getItem('last_github_visit');
        if (lastVisitStr && repos && repos.length > 0) {
            const lastVisit = new Date(lastVisitStr);
            const count = repos.filter(
                (r: any) => new Date(r.updated_at) > lastVisit,
            ).length;
            setNewProjectsCount(count);
        }
    }, [repos]);

    // Nivel 0: Opciones independientes en la raíz
    const independents: SidebarMenuItemDef[] = [
        {
            title: 'Dashboard',
            href: toUrl(dashboard()),
            icon: LayoutGrid,
        },
    ];

    // Nivel 1: Módulos (Collapsibles interactivos con icono, título, badge y flecha animada)
    const modules: SidebarModuleGroup[] = [
        {
            title: 'Desarrollo',
            icon: Code2,
            badge:
                newProjectsCount > 0 ? (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {newProjectsCount}
                    </span>
                ) : undefined,
            // Nivel 2: Opciones del módulo
            items: [
                {
                    title: 'Catálogos',
                    icon: Boxes,
                    children: [
                        {
                            title: 'Especialidad',
                            href: toUrl(desarrollo.especialidades.index()),
                            icon: Award,
                        },
                        {
                            title: 'Tipo Candidato',
                            href: toUrl(desarrollo.candidatosTipos.index()),
                            icon: Layers,
                        },
                        {
                            title: 'Candidatos',
                            href: toUrl(desarrollo.candidatos.index()),
                            icon: UserCheck,
                        },
                    ],
                },
                {
                    title: 'Proyectos',
                    href: toUrl(github.proyectos()),
                    icon: FolderGit2,
                    badge:
                        newProjectsCount > 0 ? (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                {newProjectsCount}
                            </span>
                        ) : undefined,
                },
            ],
        },
        {
            title: 'Cine',
            icon: Clapperboard,
            badge:
                cineEstrenosProximosCount > 0 ? (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {cineEstrenosProximosCount}
                    </span>
                ) : undefined,
            // Nivel 2: Opciones del módulo (incluyendo SubMenú Catálogos)
            items: [
                {
                    title: 'Dashboard Cine',
                    href: toUrl(cine.dashboard()),
                    icon: LayoutGrid,
                },
                {
                    title: 'Catálogos',
                    icon: Boxes,
                    badge:
                        cineEstrenosProximosCount > 0 ? (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                {cineEstrenosProximosCount}
                            </span>
                        ) : undefined,
                    // Nivel 3: Subopciones dentro de Catálogos (con sangría y línea guía vertical)
                    children: [
                        {
                            title: 'Tipo Opinión',
                            href: toUrl(cine.tiposOpinion.index()),
                            icon: MessageSquareText,
                        },
                        {
                            title: 'Producción',
                            href: toUrl(cine.producciones.index()),
                            icon: Film,
                            badge:
                                cineEstrenosProximosCount > 0 ? (
                                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                        {cineEstrenosProximosCount}
                                    </span>
                                ) : undefined,
                        },
                        {
                            title: 'Directores',
                            href: toUrl(cine.directores.index()),
                            icon: UserCheck,
                        },
                        {
                            title: 'Producción Recurso',
                            href: toUrl(cine.recursos.index()),
                            icon: Link2,
                        },
                    ],
                },
                {
                    title: 'Producción Comentario',
                    href: toUrl(cine.comentarios.index()),
                    icon: MessageSquare,
                },
                {
                    title: 'Producción Seguimiento',
                    href: toUrl(cine.seguimiento.index()),
                    icon: History,
                },
                {
                    title: 'Producción Estatus',
                    href: toUrl(cine.estatus.index()),
                    icon: Activity,
                },
            ],
        },
        {
            title: 'Contabilidad',
            icon: Calculator,
            items: [
                {
                    title: 'Dashboard',
                    href: '/contabilidad/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Catálogos',
                    icon: Boxes,
                    children: [
                        {
                            title: 'Alumnos',
                            href: '/contabilidad/alumnos',
                            icon: GraduationCap,
                        },
                        {
                            title: 'Oportunidades',
                            href: '/contabilidad/oportunidades',
                            icon: Award,
                        },
                        {
                            title: 'Periodos',
                            href: '/contabilidad/periodos',
                            icon: CalendarRange,
                        },
                        {
                            title: 'Grupos',
                            href: '/contabilidad/grupos',
                            icon: Users,
                        },
                        {
                            title: 'Asesores',
                            href: '/contabilidad/asesores',
                            icon: UserCheck,
                        },
                        {
                            title: 'Ciclos',
                            href: '/contabilidad/ciclos',
                            icon: Layers,
                        },
                    ],
                },
                {
                    title: 'Módulos',
                    href: '/contabilidad/modulos',
                    icon: BookOpen,
                },
                {
                    title: 'Módulo Lección Estatus',
                    href: '/contabilidad/modulo-leccion-estatus',
                    icon: BookmarkCheck,
                },
                {
                    title: 'Módulo Reto Estatus',
                    href: '/contabilidad/modulo-reto-recurso-estatus',
                    icon: CheckSquare,
                },
            ],
        },
        {
            title: 'Inglés',
            icon: Languages,
            items: [
                {
                    title: 'Dashboard',
                    href: '/ingles/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Catálogos',
                    icon: Boxes,
                    children: [
                        {
                            title: 'Alumnos',
                            href: '/ingles/alumnos',
                            icon: GraduationCap,
                        },
                        {
                            title: 'Asesores',
                            href: '/ingles/asesores',
                            icon: UserCheck,
                        },
                        {
                            title: 'Periodos',
                            href: '/ingles/periodos',
                            icon: CalendarRange,
                        },
                        {
                            title: 'Materias',
                            href: '/ingles/materias',
                            icon: BookOpen,
                        },
                    ],
                },
                {
                    title: 'Grupos',
                    href: '/ingles/grupos',
                    icon: Users,
                },
                {
                    title: 'Grupo Actividades Estatus',
                    href: '/ingles/grupo-actividades-estatus',
                    icon: BookmarkCheck,
                },
                {
                    title: 'Grupo Actividad Recurso Estatus',
                    href: '/ingles/grupo-actividad-recursos-estatus',
                    icon: CheckSquare,
                },
            ],
        },
        {
            title: 'Proyectos',
            icon: FolderKanban,
            items: [
                {
                    title: 'Dashboard',
                    href: '/proyectos/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Catálogos',
                    icon: Boxes,
                    children: [
                        {
                            title: 'Catálogo de Personas',
                            href: '/proyectos/personas',
                            icon: Users,
                        },
                        {
                            title: 'Roles',
                            href: '/proyectos/roles',
                            icon: ShieldCheck,
                        },
                    ],
                },
                {
                    title: 'Proyectos',
                    href: '/proyectos/proyectos',
                    icon: FolderGit2,
                },
                {
                    title: 'Proyecto Estatus',
                    href: '/proyectos/proyecto-estatus',
                    icon: ListChecks,
                },
                {
                    title: 'Proyecto Actividades Estatus',
                    href: '/proyectos/proyecto-actividades-estatus',
                    icon: BookmarkCheck,
                },
                {
                    title: 'Proyecto Actividad Recursos Estatus',
                    href: '/proyectos/proyecto-actividad-recursos-estatus',
                    icon: CheckSquare,
                },
            ],
        },
        {
            title: 'Configuración',
            icon: Settings,
            items: [
                {
                    title: 'Usuarios',
                    href: '/configuracion/usuarios',
                    icon: UserCog,
                },
                {
                    title: 'Configuración GitHub',
                    href: '/configuracion/github',
                    icon: FolderGit2,
                },
                {
                    title: 'Configuración Gmail',
                    href: '/configuracion/gmail',
                    icon: Mail,
                },
            ],
        },
    ];

    const term = search.trim();
    const isSearching = term !== '';
    const filteredIndependents = filterItems(independents, term);
    const filteredModules = modules
        .map((module) => {
            if (!term) {
                return module;
            }

            const moduleMatches = matchesTerm(module.title, term);
            const items = moduleMatches
                ? module.items
                : filterItems(module.items, term);

            if (items.length === 0 && !moduleMatches) {
                return null;
            }

            return items.length > 0 ? { ...module, items } : module;
        })
        .filter((module): module is SidebarModuleGroup => module !== null);

    const hasMenuContent = independents.length > 0 || modules.length > 0;
    const hasSearchResults =
        filteredIndependents.length > 0 || filteredModules.length > 0;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border px-4 pt-4 pb-3 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="p-0! group-data-[collapsible=icon]:justify-center hover:bg-transparent"
                        >
                            <Link href={toUrl(dashboard())} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar menú..."
                            className="bg-sidebar-accent/50 pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setSearch('');
                                }
                                if (e.key === 'Enter' && term) {
                                    const primerHref = primeraHoja(
                                        filteredIndependents,
                                        filteredModules,
                                    );
                                    if (primerHref) {
                                        window.location.href = primerHref;
                                    }
                                }
                            }}
                            aria-label="Buscar en el menú"
                        />
                    </div>
                </div>

                {hasMenuContent && hasSearchResults ? (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarMenu>
                            {filteredIndependents.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={urlIsActive(item.href ?? '')}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link
                                            href={item.href ?? '#'}
                                            prefetch
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                {item.icon && (
                                                    <item.icon className="size-4 shrink-0" />
                                                )}
                                                <span className="line-clamp-2 min-w-0 flex-1 break-words">
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.badge && (
                                                <div className="ml-auto shrink-0">
                                                    {item.badge}
                                                </div>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            <NavGroup
                                groups={filteredModules}
                                isSearching={isSearching}
                            />
                        </SidebarMenu>
                    </SidebarGroup>
                ) : term ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No se encontraron resultados.
                    </div>
                ) : (
                    <div className="px-4 py-6 text-center">
                        <TriangleAlert className="mx-auto h-6 w-6 text-warning-foreground" />
                        <p className="mt-2 mb-0 text-sm text-sidebar-foreground/70">
                            Sin Módulos Asignados
                        </p>
                        <small className="text-xs text-sidebar-foreground/50">
                            Contacta a soporte
                        </small>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <div className="flex flex-col gap-2 p-2 group-data-[collapsible=icon]:p-0">
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
                        <div className="flex-1 group-data-[collapsible=icon]:hidden">
                            <NavUser />
                        </div>
                    </div>
                    <div className="hidden group-data-[collapsible=icon]:block">
                        <NavUser />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
