import {
    TarjetaProduccionTmdb,
    type ProduccionTmdbItem,
} from '@/components/cine/dashboard/tarjeta-produccion-tmdb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame } from 'lucide-react';

interface TendenciasMesProps {
    items: ProduccionTmdbItem[];
    onQuickAdd: (item: ProduccionTmdbItem) => void;
    agregandoId?: number | null;
}

export function TendenciasMes({
    items = [],
    onQuickAdd,
    agregandoId,
}: TendenciasMesProps) {
    return (
        <Card className="flex flex-col h-[580px]">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Flame className="size-4 text-orange-500" />
                        Tendencias del mes
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                        TMDB Popular
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <div className="h-full overflow-y-scroll p-3.5 pr-2 space-y-3 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                    {items.map((item) => (
                        <TarjetaProduccionTmdb
                            key={`tendencia-${item.id}`}
                            item={item}
                            onQuickAdd={onQuickAdd}
                            agregandoId={agregandoId}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
