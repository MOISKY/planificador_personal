import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

interface NavMainProps {
    items?: NavItem[];
    label?: string;
}

export function NavMain({ items = [], label = 'Menú' }: NavMainProps) {
    const { urlIsActive } = useActiveUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isAnySubActive = hasSubItems
                        ? item.subItems!.some(
                              (sub) => sub.href && urlIsActive(sub.href),
                          )
                        : false;

                    if (hasSubItems) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isAnySubActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            isActive={isAnySubActive}
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </div>
                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.subItems!.map((sub) => (
                                                <SidebarMenuSubItem key={sub.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            sub.href
                                                                ? urlIsActive(sub.href)
                                                                : false
                                                        }
                                                    >
                                                        <Link
                                                            href={sub.href!}
                                                            prefetch
                                                            cacheTags={sub.cacheTags}
                                                            className="flex items-center justify-between w-full"
                                                        >
                                                            <span>{sub.title}</span>
                                                            {sub.badge && (
                                                                <div className="ml-auto">
                                                                    {sub.badge}
                                                                </div>
                                                            )}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={item.href ? urlIsActive(item.href) : false}
                                tooltip={{ children: item.title }}
                            >
                                <Link
                                    href={item.href!}
                                    prefetch
                                    cacheTags={item.cacheTags}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </div>
                                    {item.badge && (
                                        <div className="ml-auto">
                                            {item.badge}
                                        </div>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
