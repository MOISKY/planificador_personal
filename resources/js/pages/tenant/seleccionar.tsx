import { cambiar } from '@/actions/App/Http/Controllers/TenantController';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logout } from '@/routes';
import { type Cliente } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, LogOut } from 'lucide-react';

export default function SeleccionarCliente({
    clientes,
    actual,
}: {
    clientes: Cliente[];
    actual: number | null;
}) {
    return (
        <>
            <Head title="Seleccionar cliente" />
            <div className="flex min-h-svh flex-col bg-background p-6 md:p-10">
                <header className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                        <AppLogoIcon className="size-8" />
                        PLANIFICADOR PERSONAL
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={logout()} as="button">
                            <LogOut className="size-4" />
                            Cerrar sesión
                        </Link>
                    </Button>
                </header>

                <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            ¿Con qué cliente vas a trabajar?
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tienes acceso a {clientes.length} clientes. Puedes
                            cambiarlo después desde el menú de usuario.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {clientes.map((cliente) => (
                            <Card
                                key={cliente.IdCliente}
                                className={
                                    cliente.IdCliente === actual
                                        ? 'border-primary shadow-sm'
                                        : 'shadow-sm'
                                }
                            >
                                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                                    <div className="flex size-20 items-center justify-center rounded-xl bg-muted">
                                        {cliente.URL_logo ? (
                                            <img
                                                src={cliente.URL_logo}
                                                alt=""
                                                className="max-h-16 max-w-16 object-contain"
                                            />
                                        ) : (
                                            <Building2 className="size-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {cliente.SNombre}
                                        </p>
                                        {cliente.SCodigoCliente && (
                                            <p className="text-xs text-muted-foreground">
                                                {cliente.SCodigoCliente}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            router.post(
                                                cambiar({
                                                    idCliente:
                                                        cliente.IdCliente,
                                                }).url,
                                            )
                                        }
                                    >
                                        Entrar
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
