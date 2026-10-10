import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FolderGit2, User, Clock, FileCode2, Calendar, CalendarDays, CalendarCheck, Folder, File } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/noil/page-shell';
import { ContextPanel } from '@/components/noil/context-panel';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import github from '@/routes/github';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ProyectoDetalle({ repo, commits, username }: { repo: any, commits: any[], username: string }) {
    const [openModal, setOpenModal] = useState<'day' | 'month' | 'year' | 'commit' | null>(null);
    const [selectedCommit, setSelectedCommit] = useState<any>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Consultor GitHub', href: '/consultor' },
        { title: 'Proyectos', href: github.proyectos().url },
        { title: repo.name, href: '#' },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTopLevelFolder = (filename: string) => {
        const parts = filename.split('/');
        return parts.length > 1 ? parts[0] + '/' : parts[0];
    };

    // Calculate files for period modals
    const getPeriodData = (period: 'day' | 'month' | 'year') => {
        const now = new Date();
        let filtered = [];
        if (period === 'day') {
            filtered = commits.filter(c => new Date(c.commit.author.date).toDateString() === now.toDateString());
        } else if (period === 'month') {
            filtered = commits.filter(c => {
                const date = new Date(c.commit.author.date);
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
        } else {
            filtered = commits.filter(c => new Date(c.commit.author.date).getFullYear() === now.getFullYear());
        }

        if (period === 'day') {
            const groupedByTime: Record<string, Set<string>> = {};
            filtered.forEach(commit => {
                const timeStr = new Date(commit.commit.author.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                if (!groupedByTime[timeStr]) groupedByTime[timeStr] = new Set();
                (commit.files || []).forEach((f: any) => groupedByTime[timeStr].add(getTopLevelFolder(f.filename)));
            });
            return groupedByTime;
        } else {
            const folders = new Set<string>();
            filtered.forEach(commit => {
                (commit.files || []).forEach((f: any) => folders.add(getTopLevelFolder(f.filename)));
            });
            return folders;
        }
    };

    const RenderPeriodContent = () => {
        if (!openModal || openModal === 'commit') return null;
        const data = getPeriodData(openModal);
        
        if (openModal === 'day') {
            const grouped = data as Record<string, Set<string>>;
            const hours = Object.keys(grouped).sort().reverse();
            if (hours.length === 0) return <p className="text-muted-foreground text-sm">No hubo cambios hoy.</p>;
            
            return (
                <div className="space-y-4">
                    {hours.map(hour => (
                        <div key={hour} className="border rounded-xl p-4 bg-muted/30">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> {hour} hrs
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(grouped[hour]).map(folder => (
                                    <Badge key={folder} variant="secondary" className="flex items-center gap-1 font-mono text-xs py-1">
                                        {folder.endsWith('/') ? <Folder className="w-3 h-3 text-muted-foreground" /> : <File className="w-3 h-3 text-muted-foreground" />}
                                        {folder}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            const folders = Array.from(data as Set<string>).sort();
            if (folders.length === 0) return <p className="text-muted-foreground text-sm">No hubo cambios en este periodo.</p>;
            return (
                <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-muted/30">
                    {folders.map(folder => (
                        <Badge key={folder} variant="secondary" className="flex items-center gap-1 font-mono text-xs py-1.5 px-2.5">
                            {folder.endsWith('/') ? <Folder className="w-3 h-3 text-muted-foreground" /> : <File className="w-3 h-3 text-muted-foreground" />}
                            {folder}
                        </Badge>
                    ))}
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
                    description={repo.description || "Historial detallado del proyecto y sus archivos afectados."}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => setOpenModal('day')}>
                                <Calendar className="w-4 h-4 mr-1.5 text-primary" /> Detalle Día
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setOpenModal('month')}>
                                <CalendarDays className="w-4 h-4 mr-1.5 text-primary" /> Detalle Mes
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setOpenModal('year')}>
                                <CalendarCheck className="w-4 h-4 mr-1.5 text-primary" /> Detalle Año
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 mb-4">
                            <Clock className="size-5 text-muted-foreground" />
                            Historial de Commits
                        </h2>
                        
                        <div className="space-y-3">
                            {commits.length > 0 ? commits.map((commitData: any) => {
                                const commit = commitData.commit;
                                return (
                                    <div key={commitData.sha} className="overflow-hidden rounded-xl border bg-card shadow-sm p-4 transition-shadow hover:shadow-md flex items-start gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <User className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-foreground line-clamp-1" title={commit.message}>
                                                {commit.message}
                                            </h3>
                                            <p className="text-xs font-medium text-muted-foreground mt-0.5 mb-1.5">
                                                {commit.author.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                                    {commitData.sha.substring(0, 7)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(commit.author.date).replace(',', ' a las')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center h-full">
                                            <Button size="sm" variant="secondary" onClick={() => {
                                                setSelectedCommit(commitData);
                                                setOpenModal('commit');
                                            }}>
                                                <FileCode2 className="w-4 h-4 mr-1.5" />
                                                Detalle
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-8 text-center text-sm text-muted-foreground border rounded-xl bg-card">
                                    No hay commits recientes en este proyecto.
                                </div>
                            )}
                        </div>
                    </div>
                </PageContent>
            </PageShell>

            {/* Modals */}
            <Dialog open={openModal !== null} onOpenChange={(open) => !open && setOpenModal(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {openModal === 'day' && 'Archivos Afectados Hoy'}
                            {openModal === 'month' && 'Archivos Afectados este Mes'}
                            {openModal === 'year' && 'Archivos Afectados este Año'}
                            {openModal === 'commit' && 'Detalle del Commit'}
                        </DialogTitle>
                        <DialogDescription>
                            {openModal === 'commit' ? 'Todos los archivos modificados en este commit.' : 'Carpetas y archivos principales afectados.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4">
                        {openModal !== 'commit' ? (
                            <RenderPeriodContent />
                        ) : (
                            selectedCommit && (
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-xl bg-muted/30 mb-4">
                                        <p className="font-semibold text-sm mb-1">{selectedCommit.commit.message}</p>
                                        <p className="text-xs text-muted-foreground">Por: {selectedCommit.commit.author.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {(selectedCommit.files || []).map((file: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm border-b pb-2 last:border-0 font-mono">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                    file.status === 'added' ? 'bg-green-100 text-green-700' :
                                                    file.status === 'removed' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {file.status.substring(0, 3).toUpperCase()}
                                                </span>
                                                <span className="truncate">{file.filename}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
