/*
 | Utilidades de fecha del estándar UI (portadas de appweb_proveedores/resources/js/lib/utils.js).
 | Trabajan sobre cadenas 'aaaa-mm-dd' y hora local: ninguna fecha pasa por new Date(iso),
 | porque eso la interpreta en UTC y en México retrocede un día.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * '2026-08-21 10:00:00' (lo que manda MySQL) -> '21-08-2026'. Lo que no sea ISO sale tal cual.
 * '0000-00-00' es la fecha vacía de MySQL: se devuelve en blanco para que la cuadrícula
 * pinte su guion en vez del texto crudo.
 */
export function formatDate(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (raw.startsWith('0000-00-00')) {
        return '';
    }
    const match = ISO.exec(raw.slice(0, 10));
    return match ? `${match[3]}-${match[2]}-${match[1]}` : raw;
}

/** Hoy en 'aaaa-mm-dd' en hora local (toISOString() daría el día siguiente después de las 18:00). */
export function hoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Día 1 del mes de la fecha dada (por omisión, del mes en curso). */
export function inicioDeMes(fecha: string = hoy()): string {
    return fecha.slice(0, 8) + '01';
}

/** '2026-08-21' -> '21-08-2026'. */
export function isoToDisplay(value: unknown): string {
    const match = ISO.exec(String(value ?? ''));
    return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value ?? '');
}

/** '21-08-2026' -> '2026-08-21'; null si está incompleta o el día no existe. */
export function displayToIso(value: unknown): string | null {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(value ?? ''));
    if (!match) {
        return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Pone los guiones conforme se teclea; ignora lo que no sea dígito. */
export function maskDate(value: unknown): string {
    const digits = String(value ?? '')
        .replace(/\D/g, '')
        .slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
        .filter(Boolean)
        .join('-');
}
