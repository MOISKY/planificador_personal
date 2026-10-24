import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { Link } from '@inertiajs/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import * as React from 'react';

export interface SidebarMenuItemDef {
    title: string;
    icon: LucideIcon;
    href?: string;
    badge?: React.ReactNode;
    children?: SidebarMenuItemDef[];
}

export interface SidebarModuleGroup {
    title: string;
    icon: LucideIcon;
    badge?: React.ReactNode;
    items: SidebarMenuItemDef[];
}

interface NavGroupProps {
    groups: SidebarModuleGroup[];
    isSearching?: boolean;
}

function itemHasActiveDescendant(
    item: SidebarMenuItemDef,
    urlIsActive: ReturnType<typeof useActiveUrl>['urlIsActive'],
): boolean {
    if (item.href && urlIsActive(item.href, undefined, { wildcard: true })) {
        return true;
    }

    return (
        item.children?.some((child) =>
            itemHasActiveDescendant(child, urlIsActive),
        ) ?? false
    );
}

function LeafItem({
    item,
    urlIsActive,
}: {
    item: SidebarMenuItemDef;
    urlIsActive: ReturnType<typeof useActiveUrl>['urlIsActive'];
}) {
    if (!item.href) {
        return null;
    }

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild isActive={urlIsActive(item.href)}>
                <Link
                    href={item.href}
                    prefetch
                    className="flex items-center justify-between w-full"
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        <span className="line-clamp-2 min-w-0 flex-1 break-words">
                            {item.title}
                        </span>
                    </div>
                    {item.badge && (
                        <div className="ml-auto shrink-0">{item.badge}</div>
                    )}
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

function SubMenuGroup({
    item,
    urlIsActive,
    isSearching = false,
}: {
    item: SidebarMenuItemDef;
    urlIsActive: ReturnType<typeof useActiveUrl>['urlIsActive'];
    isSearching?: boolean;
}) {
    const subActive =
        item.children?.some((child) =>
            itemHasActiveDescendant(child, urlIsActive),
        ) ?? false;

    const [isOpen, setIsOpen] = React.useState(subActive);

    React.useEffect(() => {
        if (subActive) {
            setIsOpen(true);
        }
    }, [subActive]);

    const effectiveOpen = isSearching ? true : isOpen;

    return (
        <Collapsible
            open={effectiveOpen}
            onOpenChange={setIsOpen}
            className="group/collapsible"
        >
            <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuSubButton isActive={subActive}>
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        <span className="line-clamp-2 min-w-0 flex-1 break-words">
                            {item.title}
                        </span>
                        {item.badge && (
                            <div className="ml-auto mr-1 shrink-0">
                                {item.badge}
                            </div>
                        )}
                        <ChevronRight className="ml-auto size-3 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children?.map((child) =>
                            child.children?.length ? (
                                <SubMenuGroup
                                    key={child.title}
                                    item={child}
                                    urlIsActive={urlIsActive}
                                    isSearching={isSearching}
                                />
                            ) : (
                                <LeafItem
                                    key={child.title}
                                    item={child}
                                    urlIsActive={urlIsActive}
                                />
                            ),
                        )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuSubItem>
        </Collapsible>
    );
}

function GroupItem({
    group,
    urlIsActive,
    isSearching = false,
}: {
    group: SidebarModuleGroup;
    urlIsActive: ReturnType<typeof useActiveUrl>['urlIsActive'];
    isSearching?: boolean;
}) {
    const groupActive = group.items.some((item) =>
        itemHasActiveDescendant(item, urlIsActive),
    );

    const [isOpen, setIsOpen] = React.useState(groupActive);

    React.useEffect(() => {
        if (groupActive) {
            setIsOpen(true);
        }
    }, [groupActive]);

    const effectiveOpen = isSearching ? true : isOpen;

    return (
        <Collapsible
            open={effectiveOpen}
            onOpenChange={setIsOpen}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={group.title}
                        isActive={groupActive}
                    >
                        <group.icon className="size-4 shrink-0" />
                        <span className="line-clamp-2 min-w-0 flex-1 break-words">
                            {group.title}
                        </span>
                        {group.badge && (
                            <div className="ml-auto mr-1 shrink-0">
                                {group.badge}
                            </div>
                        )}
                        <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.items.map((item) =>
                            item.children?.length ? (
                                <SubMenuGroup
                                    key={item.title}
                                    item={item}
                                    urlIsActive={urlIsActive}
                                    isSearching={isSearching}
                                />
                            ) : (
                                <LeafItem
                                    key={item.title}
                                    item={item}
                                    urlIsActive={urlIsActive}
                                />
                            ),
                        )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function NavGroup({ groups, isSearching = false }: NavGroupProps) {
    const { urlIsActive } = useActiveUrl();

    return (
        <>
            {groups.map((group) => (
                <GroupItem
                    key={group.title}
                    group={group}
                    urlIsActive={urlIsActive}
                    isSearching={isSearching}
                />
            ))}
        </>
    );
}
