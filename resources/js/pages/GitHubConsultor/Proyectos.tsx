import { useEffect } from 'react';
import { Head, usePoll } from '@inertiajs/react';
import { FolderGit2, User, ExternalLink, GitCommit, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/page-shell';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import github from '@/routes/github';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Proyectos', href: github.proyectos().url },
];

interface RepoItem {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    last_commit_message?: string | null;
    last_commit_author?: string | null;
    owner: {
        login: string;
        avatar_url?: string;
    };
}

export default function Proyectos({
    repos = [],
    username,
}: {
    repos: RepoItem[];
    username: string;
}) {
    // Auto-actualizar cada 10 segundos
    usePoll(10000, { only: ['repos'] });

    // Update last visit when leaving or unmounting
    useEffect(() => {
        const now = new Date().toISOString();
        return () => {
            localStorage.setItem('last_github_visit', now);
        };
    }, []);

    // Format date string
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

    const columns: Column<RepoItem>[] = [
        {
            key: 'name',
            label: 'Proyecto / Repositorio',
            sortable: true,
            render: (repo) => (
                <div className="flex items-start gap-3 py-1">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base uppercase">
                        {repo.name.charAt(0)}
                    </div>
                    <div className="min-w-0 max-w-md">
                        <a
                            href={github.proyecto({ owner: repo.owner.login, repo: repo.name }).url}
                            className="font-bold text-foreground text-sm hover:underline hover:text-primary transition-colors block truncate"
                            title={repo.name}
                        >
                            {repo.name}
                        </a>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 flex items-center gap-1.5">
                            <GitCommit className="size-3 shrink-0 text-muted-foreground/70" />
                            <span>{repo.last_commit_message || repo.description || 'Sin descripción del último commit'}</span>
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'last_commit_author',
            label: 'Usuario / Autor',
            sortable: true,
            render: (repo) => {
                const author = repo.last_commit_author || repo.owner?.login || '—';
                return (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{author}</span>
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            className: 'w-40 text-xs text-muted-foreground',
            render: (repo) => (
                <div className="flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                    <span>{formatDate(repo.created_at).replace(',', '')}</span>
                </div>
            ),
        },
        {
            key: 'updated_at',
            label: 'Última Modificación',
            sortable: true,
            className: 'w-44 text-xs font-medium text-foreground',
            render: (repo) => (
                <span className="font-mono text-xs">
                    {formatDate(repo.updated_at).replace(',', ' ')}
                </span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Proyectos - GitHub" />
            <PageShell>
                {/* Header Context Panel */}
                <ContextPanel
                    icon={<FolderGit2 />}
                    title="Mis Proyectos"
                    description="Explora y busca entre tus repositorios ordenados por modificaciones recientes."
                    actions={
                        <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 px-3 py-1 gap-1.5"
                        >
                            <User className="size-3" />
                            {username}
                        </Badge>
                    }
                />

                <PageContent>
                    <DataTable
                        data={repos}
                        columns={columns}
                        idKey="id"
                        mode="client"
                        searchPlaceholder="Buscar por nombre, autor, commit o descripción..."
                        customActions={(repo) => (
                            <Button asChild size="sm" variant="outline" className="gap-1.5 font-medium">
                                <a href={github.proyecto({ owner: repo.owner.login, repo: repo.name }).url}>
                                    <span>Ver Detalle</span>
                                    <ExternalLink className="size-3.5 opacity-70" />
                                </a>
                            </Button>
                        )}
                        emptyTitle="No se encontraron proyectos"
                        emptyDescription="No hay repositorios disponibles o ninguno coincide con el filtro de búsqueda."
                    />
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}
