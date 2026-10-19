import { ExternalLink, Film } from 'lucide-react';
import React from 'react';

interface PosterColumnaProps {
    url?: string | null;
    alt: string;
    fallbackIcon?: React.ReactNode;
}

export function PosterColumna({ url, alt, fallbackIcon }: PosterColumnaProps) {
    return (
        <div className="relative w-16 h-22 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-muted shrink-0 border flex items-center justify-center shadow-xs">
            {url ? (
                <img
                    src={url}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                fallbackIcon ?? <Film className="size-7 text-muted-foreground/60" />
            )}
        </div>
    );
}

interface BotonFichaTmdbProps {
    query?: string | null;
    variant?: 'icon' | 'badge';
    label?: string;
}

export function BotonFichaTmdb({
    query,
    variant = 'icon',
    label = 'Ficha',
}: BotonFichaTmdbProps) {
    if (!query || query.trim() === '') {
        return null;
    }

    const tmdbUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(query.trim())}`;

    if (variant === 'badge') {
        return (
            <a
                href={tmdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-background hover:bg-muted text-foreground transition shadow-2xs hover:text-primary shrink-0"
                title={`Ver ficha oficial de "${query}" en TMDB`}
            >
                <span>{label}</span>
                <ExternalLink className="size-3" />
            </a>
        );
    }

    return (
        <a
            href={tmdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="size-6 rounded inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0"
            title={`Ver ficha oficial de "${query}" en TMDB`}
        >
            <ExternalLink className="size-3.5" />
        </a>
    );
}
