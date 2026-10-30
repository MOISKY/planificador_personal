import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    FolderGit2,
    User,
    Clock,
    FileCode2,
    Calendar,
    CalendarDays,
    CalendarCheck,
    Folder,
    File,
    GitCommit,
    X,
    FileText,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/page-shell';
import { ContextPanel } from '@/components/context-panel';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import github from '@/routes/github';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function ProyectoDetalle({
    repo,
    commits = [],
    username,
}: {
    repo: any;
    commits: any[];
    username: string;
}) {
    const [openDrawer, setOpenDrawer] = useState<'day' | 'month' | 'year' | 'commit' | null>(null);
    const [selectedCommit, setSelectedCommit] = useState<any>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Desarrollo', href: '/consultor/proyectos' },
        { title: 'Proyectos', href: github.proyectos().url },
        { title: repo.name, href: '#' },
    ];

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTopLevelFolder = (filename: string) => {
        const parts = filename.split('/');
        return parts.length > 1 ? parts[0] + '/' : parts[0];
    };

    // Calculate files for period drawers
    const getPeriodData = (period: 'day' | 'month' | 'year') => {
        const now = new Date();
        let filtered: any[] = [];
        if (period === 'day') {
            filtered = commits.filter(
                (c) => new Date(c.commit.author.date).toDateString() === now.toDateString(),
            );
        } else if (period === 'month') {
            filtered = commits.filter((c) => {
                const date = new Date(c.commit.author.date);
                return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                );
            });
        } else {
            filtered = commits.filter(
                (c) => new Date(c.commit.author.date).getFullYear() === now.getFullYear(),
            );
        }

        if (period === 'day') {
            const groupedByTime: Record<string, Set<string>> = {};
            filtered.forEach((commit) => {
                const timeStr = new Date(commit.commit.author.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                if (!groupedByTime[timeStr]) groupedByTime[timeStr] = new Set();
                (commit.files || []).forEach((f: any) =>
                    groupedByTime[timeStr].add(getTopLevelFolder(f.filename)),
                );
            });
            return groupedByTime;
        } else {
            const folders = new Set<string>();
            filtered.forEach((commit) => {
                (commit.files || []).forEach((f: any) =>
                    folders.add(getTopLevelFolder(f.filename)),
                );
            });
            return folders;
        }
    };

    const renderPeriodContent = () => {
        if (!openDrawer || openDrawer === 'commit') return null;
        const data = getPeriodData(openDrawer);

        if (openDrawer === 'day') {
            const grouped = data as Record<string, Set<string>>;
            const hours = Object.keys(grouped).sort().reverse();
            if (hours.length === 0) {
                return (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                        <Clock className="size-8 mx-auto mb-2 opacity-40" />
                        No hubo cambios registrados hoy.
                    </div>
                );
            }

            return (
                <div className="space-y-4">
                    {hours.map((hour) => (
                        <div key={hour} className="border rounded-xl p-4 bg-muted/20">
                            <h4 className="font-semibold text-sm mb-2.5 flex items-center gap-2 text-foreground">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{hour} hrs</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(grouped[hour]).map((folder) => (
                                    <Badge
                                        key={folder}
                                        variant="secondary"
                                        className="flex items-center gap-1.5 font-mono text-xs py-1 px-2.5"
                                    >
                                        {folder.endsWith('/') ? (
                                            <Folder className="w-3.5 h-3.5 text-primary" />
                                        ) : (
                                            <File className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                        <span>{folder}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            const folders = Array.from(data as Set<string>).sort();
            if (folders.length === 0) {
                return (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                        <Calendar className="size-8 mx-auto mb-2 opacity-40" />
                        No hubo cambios registrados en este periodo.
                    </div>
                );
            }
            return (
                <div className="border rounded-xl p-4 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">
                        Total de áreas o módulos afectados: {folders.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {folders.map((folder) => (
                            <Badge
                                key={folder}
                                variant="secondary"
                                className="flex items-center gap-1.5 font-mono text-xs py-1.5 px-3"
                            >
                                {folder.endsWith('/') ? (
                                    <Folder className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                    <File className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                                <span>{folder}</span>
                            </Badge>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle - ${repo.name}`} />
            <PageShell>
                <ContextPanel
                    icon={<FolderGit2 />}
                    title={repo.name}
                    description={repo.description || 'Historial detallado del proyecto y sus archivos afectados.'}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOpenDrawer('day')}
                                className="gap-1.5"
                            >
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>Archivos Afectados Hoy</span>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOpenDrawer('month')}
                                className="gap-1.5"
                            >
                                <CalendarDays className="w-4 h-4 text-primary" />
                                <span>Archivos Afectados este Mes</span>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOpenDrawer('year')}
                                className="gap-1.5"
                            >
                                <CalendarCheck className="w-4 h-4 text-primary" />
                                <span>Archivos Afectados este Año</span>
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                                <GitCommit className="size-5 text-primary" />
                                Historial de Commits
                            </h2>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {commits.length} commits
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {commits.length > 0 ? (
                                commits.map((commitData: any) => {
                                    const commit = commitData.commit;
                                    return (
                                        <div
                                            key={commitData.sha}
                                            className="overflow-hidden rounded-xl border bg-card shadow-xs p-4 transition-all hover:shadow-md hover:border-primary/40 flex items-start gap-4"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <User className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3
                                                    className="text-sm font-semibold text-foreground line-clamp-1"
                                                    title={commit.message}
                                                >
                                                    {commit.message}
                                                </h3>
                                                <p className="text-xs font-medium text-muted-foreground mt-0.5 mb-1.5">
                                                    {commit.author.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] py-0 px-1.5 font-mono"
                                                    >
                                                        {commitData.sha.substring(0, 7)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(commit.author.date).replace(',', ' a las')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center h-full">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="gap-1.5"
                                                    onClick={() => {
                                                        setSelectedCommit(commitData);
                                                        setOpenDrawer('commit');
                                                    }}
                                                >
                                                    <FileCode2 className="w-4 h-4 text-primary" />
                                                    <span>Detalle</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center text-sm text-muted-foreground border rounded-xl bg-card">
                                    No hay commits recientes en este proyecto.
                                </div>
                            )}
                        </div>
                    </div>
                </PageContent>
            </PageShell>

            {/* Drawers laterales con Sheet */}
            <Sheet open={openDrawer !== null} onOpenChange={(open) => !open && setOpenDrawer(null)}>
                <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-2">
                        <SheetTitle className="flex items-center gap-2 text-lg">
                            {openDrawer === 'day' && (
                                <>
                                    <Calendar className="size-5 text-primary" />
                                    Archivos Afectados Hoy
                                </>
                            )}
                            {openDrawer === 'month' && (
                                <>
                                    <CalendarDays className="size-5 text-primary" />
                                    Archivos Afectados este Mes
                                </>
                            )}
                            {openDrawer === 'year' && (
                                <>
                                    <CalendarCheck className="size-5 text-primary" />
                                    Archivos Afectados este Año
                                </>
                            )}
                            {openDrawer === 'commit' && (
                                <>
                                    <FileCode2 className="size-5 text-primary" />
                                    Detalle del Commit
                                </>
                            )}
                        </SheetTitle>
                        <SheetDescription>
                            {openDrawer === 'commit'
                                ? 'Archivos modificados, agregados o eliminados en este commit.'
                                : 'Carpetas y módulos principales con actividad durante este periodo.'}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator />

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {openDrawer !== 'commit' ? (
                            renderPeriodContent()
                        ) : (
                            selectedCommit && (
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-xl bg-muted/20 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="font-mono text-xs bg-card">
                                                {selectedCommit.sha.substring(0, 7)}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(selectedCommit.commit.author.date)}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-sm text-foreground">
                                            {selectedCommit.commit.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <User className="size-3.5" />
                                            <span>Autor: {selectedCommit.commit.author.name}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                            Archivos Modificados ({selectedCommit.files?.length ?? 0})
                                        </h4>
                                        <div className="space-y-2">
                                            {(selectedCommit.files || []).map((file: any, i: number) => {
                                                const isAdded = file.status === 'added';
                                                const isRemoved = file.status === 'removed';
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-2.5 text-xs border rounded-lg p-2.5 bg-card font-mono"
                                                    >
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                                                isAdded
                                                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                                    : isRemoved
                                                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                                                                    : 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                                                            }`}
                                                        >
                                                            {file.status.substring(0, 3)}
                                                        </span>
                                                        <FileText className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate flex-1" title={file.filename}>
                                                            {file.filename}
                                                        </span>
                                                        {file.changes && (
                                                            <span className="text-[11px] text-muted-foreground shrink-0">
                                                                +{file.additions ?? 0} -{file.deletions ?? 0}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <Separator />

                    <SheetFooter className="p-4">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                <X className="mr-1.5 size-4" />
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
