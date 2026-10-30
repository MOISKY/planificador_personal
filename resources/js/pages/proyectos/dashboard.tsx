import { ContextPanel } from '@/components/context-panel';
import { type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import { PageContent, PageShell } from '@/components/page-shell';
import { KpisActividadRecursos } from '@/components/proyectos/dashboard/kpis-actividad-recursos';
import { KpisActividades } from '@/components/proyectos/dashboard/kpis-actividades';
import { KpisCatalogos } from '@/components/proyectos/dashboard/kpis-catalogos';
import { KpisProyectosEstatus } from '@/components/proyectos/dashboard/kpis-proyectos-estatus';
import { SeccionNoticias } from '@/components/proyectos/dashboard/seccion-noticias';
import { UltimasActividadRecursos } from '@/components/proyectos/dashboard/ultimas-actividad-recursos';
import { UltimasActividades } from '@/components/proyectos/dashboard/ultimas-actividades';
import { UltimosProyectos } from '@/components/proyectos/dashboard/ultimos-proyectos';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type GrupoActividadRecursoItem,
    type ProyectoActividadItem,
    type ProyectoItem,
} from '@/types/proyectos';
import { Head, Link } from '@inertiajs/react';
import { FolderGit2, FolderKanban, Users } from 'lucide-react';

interface Props {
    kpis: {
        catalogos: {
            proyectos: number;
            personas: number;
            roles: number;
        };
        proyectosEstatus: {
            pendiente: number;
            enEmision: number;
            finalizado: number;
            cancelado: number;
            pausado: number;
        };
        actividades: {
            noRealizada: number;
            enProceso: number;
            realizada: number;
        };
        actividadesRecursos: {
            noRealizada: number;
            enProceso: number;
            realizada: number;
        };
    };
    ultimosProyectos: ProyectoItem[];
    ultimasActividades: ProyectoActividadItem[];
    ultimasActividadesRecursos: GrupoActividadRecursoItem[];
    noticias: {
        desarrollo: NoticiaItem[];
        tecnologia: NoticiaItem[];
        versiones: NoticiaItem[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/dashboard' },
    { title: 'Dashboard', href: '/proyectos/dashboard' },
];

export default function ProyectosDashboard({
    kpis,
    ultimosProyectos = [],
    ultimasActividades = [],
    ultimasActividadesRecursos = [],
    noticias = { desarrollo: [], tecnologia: [], versiones: [] },
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<FolderKanban />}
                    title="Dashboard de Proyectos"
                    description="Resumen y seguimiento global de proyectos, actividades, colaboradores, entregas y novedades tecnológicas."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Link href="/proyectos/personas">
                                    <Users className="size-3.5" />
                                    Colaboradores
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="gap-1.5 text-xs">
                                <Link href="/proyectos/proyectos">
                                    <FolderGit2 className="size-3.5" />
                                    Gestionar Proyectos
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <PageContent className="space-y-6">
                    {/* Fila 1: Cantidades de Catálogos Principales (Proyectos, Personas, Roles) */}
                    <KpisCatalogos
                        proyectos={kpis.catalogos.proyectos}
                        personas={kpis.catalogos.personas}
                        roles={kpis.catalogos.roles}
                    />

                    {/* Fila 2: Proyectos por Estatus (Pendiente, En Emisión, Finalizado, Cancelado, Pausado) */}
                    <KpisProyectosEstatus
                        pendiente={kpis.proyectosEstatus.pendiente}
                        enEmision={kpis.proyectosEstatus.enEmision}
                        finalizado={kpis.proyectosEstatus.finalizado}
                        cancelado={kpis.proyectosEstatus.cancelado}
                        pausado={kpis.proyectosEstatus.pausado}
                    />

                    {/* Fila 3: Actividades por Estatus (No Realizada, En Proceso, Realizada) */}
                    <KpisActividades
                        noRealizada={kpis.actividades.noRealizada}
                        enProceso={kpis.actividades.enProceso}
                        realizada={kpis.actividades.realizada}
                    />

                    {/* Fila 4: Actividades Recursos por Estatus (No Realizada, En Proceso, Realizada) */}
                    <KpisActividadRecursos
                        noRealizada={kpis.actividadesRecursos.noRealizada}
                        enProceso={kpis.actividadesRecursos.enProceso}
                        realizada={kpis.actividadesRecursos.realizada}
                    />

                    {/* Fila 5: Tres Columnas Simultáneas de Últimos Agregados */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        <UltimosProyectos items={ultimosProyectos} />
                        <UltimasActividades items={ultimasActividades} />
                        <UltimasActividadRecursos items={ultimasActividadesRecursos} />
                    </div>

                    {/* Fila 6: Tres Columnas Simultáneas de Noticias en Vivo */}
                    <SeccionNoticias noticias={noticias} />
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}

