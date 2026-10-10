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
import ejemplo from '@/routes/ejemplo';
import { edit as editProfile } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Search, Settings, Table2 } from 'lucide-react';
import { useState } from 'react';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
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
    const items = term
        ? mainNavItems.filter((i) => normalizar(i.title).includes(term))
        : mainNavItems;

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
