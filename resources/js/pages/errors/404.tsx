import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="404 - Página no encontrada" />
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md text-center">
                    {/* Ilustración */}
                    <div className="relative mb-8">
                        <div className="text-[10rem] leading-none font-bold text-muted-foreground/10 select-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-muted p-6">
                                <SearchX className="size-16 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Texto */}
                    <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                        Página no encontrada
                    </h1>
                    <p className="mb-8 text-muted-foreground">
                        Lo sentimos, la página que buscas no existe o ha sido
                        movida.
                    </p>

                    {/* Acciones */}
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Volver atrás
                        </Button>
                        <Button
                            onClick={() => router.visit('/')}
                            className="w-full sm:w-auto"
                        >
                            <Home className="mr-2 size-4" />
                            Ir al inicio
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
