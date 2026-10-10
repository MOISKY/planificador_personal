import { useEffect, useState } from 'react';

export type FontSize = 'chico' | 'normal' | 'grande' | 'extra';

export const FONT_SIZES: { value: FontSize; label: string; escala: string }[] =
    [
        { value: 'chico', label: 'Chico', escala: '87.5%' },
        { value: 'normal', label: 'Normal', escala: '100%' },
        { value: 'grande', label: 'Grande', escala: '112.5%' },
        { value: 'extra', label: 'Extra grande', escala: '125%' },
    ];

const KEY = 'fontSize';

function leer(): FontSize {
    if (typeof window === 'undefined') {
        return 'normal';
    }
    const v = localStorage.getItem(KEY);
    return FONT_SIZES.some((f) => f.value === v) ? (v as FontSize) : 'normal';
}

export function useFontSize() {
    const [fontSize, setFontSize] = useState<FontSize>(leer);

    useEffect(() => {
        const escala = FONT_SIZES.find((f) => f.value === fontSize)!.escala;
        document.documentElement.style.fontSize = escala;
        localStorage.setItem(KEY, fontSize);
    }, [fontSize]);

    return { fontSize, setFontSize };
}
