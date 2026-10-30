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
    ExternalLink,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/page-shell';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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

interface CommitItem {
    sha: string;
    html_url?: string;
    commit: {
        message: string;
        author: {
            name: string;
            email?: string;
            date: string;
        };
    };
    files?: Array<{
        filename: string;
        status: string;
        additions?: number;
        deletions?: number;
        changes?: number;
    }>;
}

export default function ProyectoDetalle({
    repo,
    commits = [],
    username,
}: {
    repo: any;
    commits: CommitItem[];
    username: string;
}) {
    const [openDrawer, setOpenDrawer] = useState<'day' | 'month' | 'year' | 'commit' | null>(null);
    const [selectedCommit, setSelectedCommit] = useState<CommitItem | null>(null);

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
        let filtered: CommitItem[] = [];
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
                (commit.files || []).forEach((f) =>
                    groupedByTime[timeStr].add(getTopLevelFolder(f.filename)),
                );
            });
            return groupedByTime;
        } else {
            const folders = new Set<string>();
            filtered.forEach((commit) => {
                (commit.files || []).forEach((f) =>
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

    const columns: Column<CommitItem>[] = [
        {
            key: 'sha',
            label: 'Commit',
            className: 'w-24 text-center font-mono text-xs',
            render: (c) => (
                <Badge variant="outline" className="font-mono text-xs bg-muted/50 px-2 py-0.5">
                    {c.sha.substring(0, 7)}
                </Badge>
            ),
        },
        {
            key: 'message',
            label: 'Mensaje de Commit',
            render: (c) => (
                <div className="flex items-start gap-2.5 py-1">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                        <GitCommit className="size-4" />
                    </div>
                    <div className="min-w-0 max-w-lg">
                        <p
                            className="font-semibold text-foreground text-sm line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                                setSelectedCommit(c);
                                setOpenDrawer('commit');
                            }}
                            title={c.commit.message}
                        >
                            {c.commit.message}
                        </p>
                        {c.files && c.files.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-mono">
                                <FileText className="size-3 text-muted-foreground/70" />
                                <span>{c.files.length} archivo(s) modificado(s)</span>
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'author',
            label: 'Autor',
            render: (c) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold text-xs">
                        <User className="size-3.5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-foreground">
                            {c.commit.author.name}
                        </p>
                        {c.commit.author.email && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                {c.commit.author.email}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'date',
            label: 'Fecha y Hora',
            sortable: true,
            className: 'w-48 text-xs',
            render: (c) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
                    <span>{formatDate(c.commit.author.date).replace(',', ' a las')}</span>
                </div>
            ),
        },
    ];

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
                    <DataTable
                        data={commits}
                        columns={columns}
                        idKey="sha"
                        mode="client"
                        searchPlaceholder="Buscar por mensaje, autor o sha..."
                        customActions={(c) => (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-1.5"
                                    onClick={() => {
                                        setSelectedCommit(c);
                                        setOpenDrawer('commit');
                                    }}
                                >
                                    <FileCode2 className="w-4 h-4 text-primary" />
                                    <span>Detalle</span>
                                </Button>
                                {c.html_url && (
                                    <Button asChild size="icon-sm" variant="ghost">
                                        <a
                                            href={c.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Ver commit en GitHub"
                                        >
                                            <ExternalLink className="size-3.5 text-muted-foreground" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                        emptyTitle="No hay commits registrados"
                        emptyDescription="No se encontraron commits recientes en este repositorio."
                    />
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
