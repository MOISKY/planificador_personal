import { DashboardGraficas } from '@/components/dashboard/graficas';
import { DashboardHero } from '@/components/dashboard/hero';
import { DashboardKpis } from '@/components/dashboard/kpis';
import { DashboardListas } from '@/components/dashboard/listas';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import AppLayout from '@/layouts/app-layout';
import { BARRAS, DONA, KPIS, RECIENTES } from '@/lib/dashboard-demo';
import ejemplo from '@/routes/ejemplo';
import { edit as editProfile } from '@/routes/profile';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ClipboardList, Users } from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <PageShell>
                <PageContent className="space-y-5">
                    <DashboardHero
                        titulo={`Bienvenido, ${auth.user.name}`}
                        subtitulo="Resumen de actividad del periodo"
                        accion={{
                            label: 'Ver listado',
                            href: ejemplo.index().url,
                        }}
                    />
                    <DashboardKpis kpis={KPIS} />
                    <DashboardGraficas barras={BARRAS} dona={DONA} />
                    <DashboardListas
                        recientes={RECIENTES}
                        verTodasHref={ejemplo.index().url}
                        accesos={[
                            {
                                title: 'Listado de ejemplo',
                                desc: 'DataTable + drawer',
                                href: ejemplo.index().url,
                                icon: ClipboardList,
                            },
                            {
                                title: 'Mi perfil',
                                desc: 'Nombre y correo',
                                href: editProfile().url,
                                icon: Users,
                            },
                        ]}
                    />
                </PageContent>
            </PageShell>
        </AppLayout>
    );
}
