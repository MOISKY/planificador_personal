import { CalendarCheck2 } from 'lucide-react';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <>
            <div
                className={`flex aspect-square ${className ?? 'size-9'} shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20`}
            >
                <CalendarCheck2 className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="truncate leading-tight font-bold tracking-tight text-sidebar-foreground">
                    PLANIFICADOR PERSONAL
                </span>
            </div>
        </>
    );
}
