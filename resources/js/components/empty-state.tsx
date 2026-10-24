import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const tamanos = {
    sm: {
        wrap: 'py-6 gap-1',
        icon: 'size-10 p-2.5',
        title: 'text-sm',
        desc: 'text-xs',
    },
    md: {
        wrap: 'py-10 gap-1',
        icon: 'size-16 p-4',
        title: 'text-lg',
        desc: 'text-sm',
    },
    lg: {
        wrap: 'py-16 gap-2',
        icon: 'size-20 p-5',
        title: 'text-xl',
        desc: 'text-base',
    },
};

export function EmptyState({
    icon,
    title = 'No hay registros',
    description = 'No se encontraron datos para mostrar.',
    action,
    size = 'md',
    className,
}: EmptyStateProps) {
    const t = tamanos[size];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                t.wrap,
                className,
            )}
        >
            <div
                className={cn(
                    'mb-3 flex items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-full',
                    t.icon,
                )}
            >
                {icon ?? <Search />}
            </div>
            {title && (
                <h3
                    className={cn(
                        'font-medium tracking-tight text-foreground',
                        t.title,
                    )}
                >
                    {title}
                </h3>
            )}
            {description && (
                <p className={cn('max-w-sm text-muted-foreground', t.desc)}>
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
