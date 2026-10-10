import { useEffect } from 'react';
import { Head, usePoll } from '@inertiajs/react';
import { GitCommit, Github, FolderGit2, User, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/noil/page-shell';
import { ContextPanel } from '@/components/noil/context-panel';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consultor GitHub', href: '/consultor' },
];

export default function Index({ repos, commits, username }: { repos: any[], commits: any[], username: string }) {
    
    // Auto-actualizar cada 10 segundos
    usePoll(10000, { only: ['commits', 'repos'] });

    // Format date string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consultor GitHub" />
            <PageShell>
                
                {/* Usamos el componente ContextPanel del template para el header */}
                <ContextPanel
                    icon={<Github />}
                    title="Consultor de GitHub"
                    description="Monitor en tiempo real de tus proyectos y últimos cambios."
                    actions={
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                            <User className="w-3 h-3 mr-1.5" />
                            {username}
                        </Badge>
                    }
                />

                <PageContent>
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Cambios Recientes (Commits) */}
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                                <GitCommit className="size-5 text-muted-foreground" />
                                Cambios Recientes
                            </h2>
                            
                            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin">
                                {commits && commits.length > 0 ? commits.map((commit: any) => (
                                    <div key={commit.id} className="overflow-hidden rounded-xl border bg-card shadow-sm p-4 transition-shadow hover:shadow-md flex items-start gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary uppercase font-bold text-lg">
                                            {commit.repo_name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-semibold text-foreground">
                                                {commit.repo_name}
                                            </h3>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                {commit.author_name}
                                            </p>
                                            <p className="text-sm text-foreground line-clamp-2">
                                                {commit.message}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-xs font-semibold tracking-wide text-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(commit.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="overflow-hidden rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                                        No hay commits recientes.
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}
