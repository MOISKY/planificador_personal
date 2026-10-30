import { ContextPanel } from '@/components/context-panel';
import { type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import { KpisActividadRecursos } from '@/components/ingles/dashboard/kpis-actividad-recursos';
import { KpisActividades } from '@/components/ingles/dashboard/kpis-actividades';
import { KpisCatalogos } from '@/components/ingles/dashboard/kpis-catalogos';
import { SeccionNoticias } from '@/components/ingles/dashboard/seccion-noticias';
import { UltimasActividadRecursos } from '@/components/ingles/dashboard/ultimas-actividad-recursos';
import { UltimasActividades } from '@/components/ingles/dashboard/ultimas-actividades';
import { UltimasMateriaRecursos } from '@/components/ingles/dashboard/ultimas-materia-recursos';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type GrupoActividadItem,
    type GrupoActividadRecursoItem,
    type MateriaRecursoItem,
} from '@/types/ingles';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Languages, Users } from 'lucide-react';

interface Props {
    kpis: {
        catalogos: {
            grupos: number;
            materias: number;
            alumnos: number;
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
    ultimasMateriasRecursos: MateriaRecursoItem[];
    ultimasActividades: GrupoActividadItem[];
    ultimasActividadesRecursos: GrupoActividadRecursoItem[];
    noticias: {
        usa: NoticiaItem[];
        canada: NoticiaItem[];
        uk: NoticiaItem[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/dashboard' },
    { title: 'Dashboard', href: '/ingles/dashboard' },
];

export default function InglesDashboard({
    kpis,
    ultimasMateriasRecursos = [],
    ultimasActividades = [],
    ultimasActividadesRecursos = [],
    noticias = { usa: [], canada: [], uk: [] },
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<Languages />}
                    title="Dashboard de Inglés"
                    description="Resumen y seguimiento global de grupos, materias, alumnos, avance en actividades y entregas de recursos."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Link href="/ingles/materias">
                                    <BookOpen className="size-3.5" />
                                    Gestionar Materias
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="gap-1.5 text-xs">
                                <Link href="/ingles/grupos">
                                    <Users className="size-3.5" />
                                    Ver Grupos
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <PageContent className="space-y-6">
                    {/* Fila 1: Cantidades de Catálogos Principales (Grupos, Materias, Alumnos) */}
                    <KpisCatalogos
                        grupos={kpis.catalogos.grupos}
                        materias={kpis.catalogos.materias}
                        alumnos={kpis.catalogos.alumnos}
                    />

                    {/* Fila 2: Actividades por Estatus (No Realizada, En Proceso, Realizada) */}
                    <KpisActividades
                        noRealizada={kpis.actividades.noRealizada}
                        enProceso={kpis.actividades.enProceso}
                        realizada={kpis.actividades.realizada}
                    />

                    {/* Fila 3: Actividades Recursos por Estatus (No Realizada, En Proceso, Realizada) */}
                    <KpisActividadRecursos
                        noRealizada={kpis.actividadesRecursos.noRealizada}
                        enProceso={kpis.actividadesRecursos.enProceso}
                        realizada={kpis.actividadesRecursos.realizada}
                    />

                    {/* Fila 4: Tres Columnas Simultáneas de Últimos Agregados */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        <UltimasMateriaRecursos items={ultimasMateriasRecursos} />
                        <UltimasActividades items={ultimasActividades} />
                        <UltimasActividadRecursos items={ultimasActividadesRecursos} />
                    </div>

                    {/* Fila 5: Tres Columnas Simultáneas de Noticias en Vivo (USA, Canadá, Reino Unido) */}
                    <SeccionNoticias noticias={noticias} />
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}

