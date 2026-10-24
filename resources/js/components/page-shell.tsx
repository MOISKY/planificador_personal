import { ContextPanel } from '@/components/context-panel';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    icon?: React.ReactNode;
    /** Sin uso desde que el encabezado es un ContextPanel; se conserva por compatibilidad. */
    iconLabel?: string;
    title: string;
    description?: string;
    children?: React.ReactNode;
}

/** Encabezado de página. Es un ContextPanel: mismas props que antes, `children` van como acciones. */
export function PageHeader({
    icon,
    title,
    description,
    children,
}: PageHeaderProps) {
    return (
        <ContextPanel
            icon={icon}
            title={title}
            description={description}
            actions={children}
        />
    );
}

interface PageShellProps {
    children: React.ReactNode;
    className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
    return (
        <div
            className={cn(
                'flex h-full flex-1 flex-col gap-6 p-4 lg:p-6',
                className,
            )}
        >
            {children}
        </div>
    );
}

interface PageContentProps {
    children: React.ReactNode;
    className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
    return <div className={cn('flex-1', className)}>{children}</div>;
}
