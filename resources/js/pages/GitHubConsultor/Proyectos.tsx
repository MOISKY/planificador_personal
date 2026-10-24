import { useState, useEffect } from 'react';
import { Head, usePoll } from '@inertiajs/react';
import { FolderGit2, User, Github, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageShell, PageContent } from '@/components/page-shell';
import { ContextPanel } from '@/components/context-panel';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import github from '@/routes/github';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consultor GitHub', href: '/consultor' },
    { title: 'Proyectos', href: github.proyectos().url },
];

export default function Proyectos({ repos, username }: { repos: any[], username: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    
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
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter repos
    const filteredRepos = (repos || []).filter(repo => 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (repo.last_commit_message && repo.last_commit_message.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                            <User className="w-3 h-3 mr-1.5" />
                            {username}
                        </Badge>
                    }
                    filtros={
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar proyecto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 pl-8 bg-card"
                            />
                        </div>
                    }
                />

                <PageContent>
                    <div className="space-y-4">
                        {filteredRepos.length > 0 ? filteredRepos.map((repo: any) => (
                            <div key={repo.id} className="overflow-hidden rounded-xl border bg-card shadow-sm p-5 transition-shadow hover:shadow-md flex items-start gap-4">
                                
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary uppercase font-bold text-xl">
                                    {repo.name.charAt(0)}
                                </div>
                                
                                <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                    {/* Columna 1: Info */}
                                    <div className="md:col-span-2">
                                        <h3 className="truncate text-base font-bold text-foreground" title={repo.name}>
                                            {repo.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Creado: {formatDate(repo.created_at).replace(',', ' ')}
                                        </p>
                                        <p className="text-sm text-foreground line-clamp-1 mt-1 font-medium">
                                            {repo.last_commit_message || repo.description || 'Sin descripción del último commit'}
                                        </p>
                                    </div>
                                    
                                    {/* Columna 2: Usuario */}
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                            Usuario
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <User className="size-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">{repo.last_commit_author || repo.owner.login}</span>
                                        </div>
                                    </div>

                                    {/* Columna 3: Fecha Hora & Link */}
                                    <div className="flex flex-col justify-center items-start md:items-end gap-2">
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Fecha Hora
                                            </p>
                                            <span className="text-sm font-bold text-foreground mt-1 block">
                                                {formatDate(repo.updated_at).replace(',', ' ')}
                                            </span>
                                        </div>
                                        <Button asChild size="sm" variant="outline" className="w-full md:w-auto mt-2">
                                            <a href={github.proyecto({ owner: repo.owner.login, repo: repo.name }).url}>
                                                Ver Detalle
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="overflow-hidden rounded-xl border bg-card p-12 text-center flex flex-col items-center gap-3">
                                <Search className="size-8 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground font-medium">No se encontraron proyectos con ese nombre.</p>
                            </div>
                        )}
                    </div>
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}
