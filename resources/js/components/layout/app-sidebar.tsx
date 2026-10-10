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
import github from '@/routes/github';
import ejemplo from '@/routes/ejemplo';
import { edit as editProfile } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Search, Settings, Table2, FolderGit2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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

const normalizar = (s: string) =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

export function AppSidebar() {
    const [search, setSearch] = useState('');
    const term = normalizar(search.trim());
    const { repos } = usePage<any>().props;
    const [newProjectsCount, setNewProjectsCount] = useState(0);

    useEffect(() => {
        const lastVisitStr = localStorage.getItem('last_github_visit');
        if (lastVisitStr && repos && repos.length > 0) {
            const lastVisit = new Date(lastVisitStr);
            const count = repos.filter((r: any) => new Date(r.updated_at) > lastVisit).length;
            setNewProjectsCount(count);
        }
    }, [repos]);

    const itemsRaw = term
        ? mainNavItems.filter((i) => normalizar(i.title).includes(term))
        : mainNavItems;

    const items = itemsRaw.map(item => {
        if (item.title === 'Proyectos' && newProjectsCount > 0) {
            return {
                ...item,
                badge: <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{newProjectsCount}</span>
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

                {items.length > 0 ? (
                    <NavMain items={items} />
                ) : (
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
