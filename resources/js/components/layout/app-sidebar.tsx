import AppLogo from '@/components/layout/app-logo';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import { Input } from '@/components/ui/input';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import cine from '@/routes/cine';
import ejemplo from '@/routes/ejemplo';
import github from '@/routes/github';
import { edit as editProfile } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Folder,
    FolderGit2,
    History,
    LayoutGrid,
    MessageSquare,
    Search,
    Settings,
    Table2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Proyectos', href: github.proyectos(), icon: FolderGit2 },
    {
        title: 'Ejemplo',
        href: ejemplo.index(),
        icon: Table2,
        cacheTags: ['ejemplo'],
    },
    { title: 'Configuración', href: editProfile(), icon: Settings },
];

const cineNavItems: NavItem[] = [
    {
        title: 'Dashboard Cine',
        href: cine.dashboard(),
        icon: LayoutGrid,
        cacheTags: ['cine-dashboard'],
    },
    {
        title: 'Catálogos',
        icon: Folder,
        subItems: [
            {
                title: 'Tipo Opinión',
                href: cine.tiposOpinion.index(),
                cacheTags: ['cine-tipos-opinion'],
            },
            {
                title: 'Producción',
                href: cine.producciones.index(),
                cacheTags: ['cine-producciones'],
            },
            {
                title: 'Directores',
                href: cine.directores.index(),
                cacheTags: ['cine-directores'],
            },
            {
                title: 'Producción Recurso',
                href: cine.recursos.index(),
                cacheTags: ['cine-recursos'],
            },
        ],
    },
    {
        title: 'Producción Comentario',
        href: cine.comentarios.index(),
        icon: MessageSquare,
        cacheTags: ['cine-comentarios'],
    },
    {
        title: 'Producción Seguimiento',
        href: cine.seguimiento.index(),
        icon: History,
        cacheTags: ['cine-seguimiento'],
    },
    {
        title: 'Producción Estatus',
        href: cine.estatus.index(),
        icon: Activity,
        cacheTags: ['cine-estatus'],
    },
];

const normalizar = (s: string) =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

export function AppSidebar() {
    const [search, setSearch] = useState('');
    const term = normalizar(search.trim());
    const { repos, cineEstrenosProximosCount = 0 } = usePage<any>().props;
    const [newProjectsCount, setNewProjectsCount] = useState(0);

    useEffect(() => {
        const lastVisitStr = localStorage.getItem('last_github_visit');
        if (lastVisitStr && repos && repos.length > 0) {
            const lastVisit = new Date(lastVisitStr);
            const count = repos.filter(
                (r: any) => new Date(r.updated_at) > lastVisit,
            ).length;
            setNewProjectsCount(count);
        }
    }, [repos]);

    const itemsRaw = term
        ? mainNavItems.filter((i) => normalizar(i.title).includes(term))
        : mainNavItems;

    const cineFiltered = term
        ? (cineNavItems
              .map((item) => {
                  if (item.subItems) {
                      const subs = item.subItems.filter((s) =>
                          normalizar(s.title).includes(term),
                      );
                      if (subs.length > 0 || normalizar(item.title).includes(term)) {
                          return {
                              ...item,
                              subItems: subs.length > 0 ? subs : item.subItems,
                          };
                      }
                      return null;
                  }
                  return normalizar(item.title).includes(term) ? item : null;
              })
              .filter(Boolean) as NavItem[])
        : cineNavItems;

    const cineRaw = cineFiltered.map((item) => {
        if (item.subItems) {
            const subItemsConBadge = item.subItems.map((sub) => {
                if (sub.title === 'Producción' && cineEstrenosProximosCount > 0) {
                    return {
                        ...sub,
                        badge: (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                {cineEstrenosProximosCount}
                            </span>
                        ),
                    };
                }
                return sub;
            });

            return {
                ...item,
                subItems: subItemsConBadge,
                badge:
                    cineEstrenosProximosCount > 0 ? (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse ml-auto">
                            {cineEstrenosProximosCount}
                        </span>
                    ) : undefined,
            };
        }
        return item;
    });

    const items = itemsRaw.map((item) => {
        if (item.title === 'Proyectos' && newProjectsCount > 0) {
            return {
                ...item,
                badge: (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {newProjectsCount}
                    </span>
                ),
            };
        }
        return item;
    });

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
                            <Link href={dashboard()} prefetch>
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
                            aria-label="Buscar en el menú"
                        />
                    </div>
                </div>

                {items.length > 0 && <NavMain items={items} label="General" />}

                {cineRaw.length > 0 && <NavMain items={cineRaw} label="Cine" />}

                {items.length === 0 && cineRaw.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No se encontraron resultados.
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
