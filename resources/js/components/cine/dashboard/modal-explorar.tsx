import {
    TarjetaProduccionTmdb,
    type ProduccionTmdbItem,
} from '@/components/cine/dashboard/tarjeta-produccion-tmdb';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import cine from '@/routes/cine';
import { Compass, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

interface ModalExplorarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onQuickAdd: (item: ProduccionTmdbItem) => void;
    agregandoId?: number | null;
}

export function ModalExplorar({
    open,
    onOpenChange,
    onQuickAdd,
    agregandoId,
}: ModalExplorarProps) {
    const anioActual = new Date().getFullYear();
    const [ano, setAno] = useState(String(anioActual));
    const [query, setQuery] = useState('');
    const [cargando, setCargando] = useState(false);
    const [resultados, setResultados] = useState<ProduccionTmdbItem[]>([]);

    const ejecutarBusqueda = async (anoSeleccionado = ano, textoQuery = query) => {
        setCargando(true);
        try {
            const numAno = anoSeleccionado.trim() !== '' ? Number(anoSeleccionado) : anioActual;
            const resp = await fetch(
                cine.explorar({
                    query: {
                        ano: numAno,
                        query: textoQuery.trim(),
                    },
                }).url,
            );
            const data = await resp.json();
            setResultados(data.results ?? []);
        } catch (err) {
            console.error('Error explorando TMDB:', err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Compass className="size-5 text-primary" />
                        Explorar Catálogo Mundial (TMDB)
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Ingresa cualquier año sin restricciones o escribe el título para descubrir y agregar producciones directamente a tu lista.
                    </DialogDescription>
                </DialogHeader>

                {/* Filtros: Selector de Año libre + Buscador */}
                <div className="flex gap-2.5 my-3">
                    <div className="w-32 shrink-0">
                        <Input
                            type="number"
                            min="1890"
                            max="2099"
                            placeholder="Año libre (ej. 1972)"
                            value={ano}
                            onChange={(e) => setAno(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    ejecutarBusqueda(e.currentTarget.value, query);
                                }
                            }}
                            className="h-9 text-xs"
                            title="Ingresa cualquier año (ej. 1930, 1954, 1972, 2026)"
                        />
                    </div>

                    <div className="relative flex-1">
                        <Input
                            placeholder="Buscar por título (ej. Dune, Matrix, Batman)..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    ejecutarBusqueda(ano, e.currentTarget.value);
                                }
                            }}
                            className="h-9 text-xs pr-9"
                        />
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => ejecutarBusqueda()}
                        disabled={cargando}
                        className="h-9 text-xs shrink-0"
                    >
                        {cargando ? (
                            <Loader2 className="size-3.5 animate-spin mr-1" />
                        ) : (
                            <Search className="size-3.5 mr-1" />
                        )}
                        Explorar
                    </Button>
                </div>

                {/* Resultados */}
                <div className="flex-1 min-h-[320px] max-h-[60vh] overflow-y-scroll pr-2 p-3 space-y-3 border rounded-xl bg-muted/10 [scrollbar-width:auto] [scrollbar-color:hsl(var(--primary))_hsl(var(--muted))] [&::-webkit-scrollbar]:w-3.5 [&::-webkit-scrollbar-track]:bg-muted/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                    {cargando ? (
                        <div className="flex flex-col items-center justify-center min-h-[280px] p-8 text-xs text-muted-foreground">
                            <Loader2 className="size-6 animate-spin text-primary mb-2" />
                            Consultando producciones en TMDB...
                        </div>
                    ) : resultados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[280px] p-8 text-xs text-muted-foreground text-center">
                            <Compass className="size-8 text-muted-foreground/40 mb-2" />
                            Ingresa cualquier año o título y pulsa en <b>Explorar</b> para cargar los resultados.
                        </div>
                    ) : (
                        resultados.map((item) => (
                            <TarjetaProduccionTmdb
                                key={`explore-${item.id}`}
                                item={item}
                                onQuickAdd={onQuickAdd}
                                agregandoId={agregandoId}
                            />
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
