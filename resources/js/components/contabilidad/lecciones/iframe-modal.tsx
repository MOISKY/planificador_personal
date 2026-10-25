import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BookOpen, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    url: string | null;
    titulo: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function IframeModal({
    url,
    titulo,
    open,
    onOpenChange,
}: Props) {
    const [cargando, setCargando] = useState(true);
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (open) {
            setCargando(true);
            setKey((prev) => prev + 1);
        }
    }, [open, url]);

    const recargar = () => {
        setCargando(true);
        setKey((prev) => prev + 1);
    };

    if (!url) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl w-[96vw] max-h-[94vh] h-[92vh] flex flex-col p-4 sm:p-6 gap-3">
                <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <div className="flex items-center gap-2.5 truncate pr-6">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                            <BookOpen className="size-4" />
                        </div>
                        <div className="truncate">
                            <DialogTitle className="text-base sm:text-lg font-semibold truncate">
                                {titulo || 'Previsualización de Lección'}
                            </DialogTitle>
                            <DialogDescription className="text-xs truncate max-w-xl">
                                {url}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="size-8 p-0"
                            onClick={recargar}
                            title="Recargar lección"
                        >
                            <RefreshCw className="size-3.5" />
                        </Button>

                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer noopener"
                                title="Abrir en pestaña nueva"
                            >
                                <ExternalLink className="size-3.5" />
                                <span className="hidden sm:inline">Abrir en pestaña nueva</span>
                            </a>
                        </Button>
                    </div>
                </DialogHeader>

                <div className="relative flex-1 w-full overflow-hidden rounded-lg border bg-muted/20">
                    {cargando && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 gap-2">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground font-medium">
                                Cargando presentación de la lección...
                            </p>
                        </div>
                    )}

                    <iframe
                        key={key}
                        src={url}
                        title={titulo}
                        onLoad={() => setCargando(false)}
                        allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full border-0 rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
