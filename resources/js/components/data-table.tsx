import { exportCsv } from '@/components/export-csv';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SelectorPagina } from '@/components/ui/selector-pagina';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Download,
    Eye,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    hideable?: boolean;
    defaultHidden?: boolean;
    sortable?: boolean;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface FilterChip {
    key: string;
    label: string;
    value: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pagination?: PaginationData;
    searchValue?: string;
    searchPlaceholder?: string;
    baseUrl?: string;
    idKey?: string;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    isEditDisabled?: (item: T) => boolean;
    isDeleteDisabled?: (item: T) => boolean;
    editDisabledReason?: string;
    deleteDisabledReason?: string;
    onView?: (item: T) => void;
    editUrl?: (item: T) => string;
    viewUrl?: (item: T) => string;
    addUrl?: string;
    addLabel?: string;
    selectable?: boolean;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    customActions?: (item: T) => React.ReactNode;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    filters?: FilterChip[];
    onFilterRemove?: (key: string) => void;
    extraParams?: Record<string, string | number | undefined>;
    /** Props a recargar al buscar/paginar (partial reload); útil cuando la página tiene deferred props. */
    reloadOnly?: string[];
    /** Id de la fila marcada cuando la pantalla usa selección única; la resalta. */
    filaMarcada?: number | string | null;
    showAllOption?: boolean;
    loading?: boolean;
    /** Nombre de archivo para Exportar (sin extensión). Por omisión, el último segmento de baseUrl. */
    exportar?: string;
    /** Deshabilita el botón de exportar si no cuenta con permisos */
    isExportDisabled?: boolean;
    exportDisabledReason?: string;
    /** Modo de paginación y búsqueda: 'auto' (detecta si el cliente tiene toda la lista o si el servidor pagina), 'client', o 'server'. */
    mode?: 'auto' | 'client' | 'server';
}

const ALL_PER_PAGE = 100000;

function normalizeSearchText(v: unknown): string {
    return String(v ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function isBlankValue(v: unknown): boolean {
    if (v === null || v === undefined) return true;
    const s = String(v).trim().toLowerCase();
    return (
        s === '' ||
        s === '—' ||
        s === '-' ||
        s === 'n/a' ||
        s === 'por definir' ||
        s.startsWith('0000-00-00') ||
        s.startsWith('00/00/0000')
    );
}

/**
 * Parsea fechas en formatos comunes:
 * - %d/%m/%Y o %d-%m-%Y (ej: "25/08/2026", "05/11/2024", "1/5/2024", con o sin hora)
 * - ISO %Y-%m-%d o %Y/%m/%d (ej: "2026-08-25", "2026-08-25 14:30:00")
 * Retorna el timestamp numérico en ms o null si no es fecha válida.
 */
function parseDateTimestamp(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) {
        const t = value.getTime();
        return isNaN(t) ? null : t;
    }
    const str = String(value).trim();
    if (isBlankValue(str)) return null;

    // 1. Formato %d/%m/%Y o %d-%m-%Y (con hora opcional de 12 o 24 hrs)
    const dmy = str.match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(am|pm|a\.m\.|p\.m\.))?)?/i,
    );
    if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]);
        let year = Number(dmy[3]);
        if (year < 100) {
            year += year < 50 ? 2000 : 1900;
        }
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            let hours = dmy[4] ? Number(dmy[4]) : 0;
            const minutes = dmy[5] ? Number(dmy[5]) : 0;
            const seconds = dmy[6] ? Number(dmy[6]) : 0;
            const meridian = dmy[7]?.toLowerCase().replace(/\./g, '');
            if (meridian === 'pm' && hours < 12) hours += 12;
            if (meridian === 'am' && hours === 12) hours = 0;

            const date = new Date(year, month - 1, day, hours, minutes, seconds);
            const t = date.getTime();
            if (!isNaN(t)) {
                return t;
            }
        }
    }

    // 2. Formato ISO %Y-%m-%d o %Y/%m/%d (ej: "2024-10-15", "2024-10-15 14:30:00")
    const ymd = str.match(
        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
    );
    if (ymd) {
        const year = Number(ymd[1]);
        const month = Number(ymd[2]);
        const day = Number(ymd[3]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const hours = ymd[4] ? Number(ymd[4]) : 0;
            const minutes = ymd[5] ? Number(ymd[5]) : 0;
            const seconds = ymd[6] ? Number(ymd[6]) : 0;
            const date = new Date(year, month - 1, day, hours, minutes, seconds);
            const t = date.getTime();
            if (!isNaN(t)) {
                return t;
            }
        }
    }

    return null;
}

function parseNumericValue(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (isBlankValue(str)) return null;
    const cleaned = str.replace(/^[$\s]+/, '').replace(/,/g, '');
    const num = Number(cleaned);
    return !isNaN(num) && cleaned !== '' ? num : null;
}

function compareValues(a: unknown, b: unknown, dir: 'asc' | 'desc'): number {
    const aBlank = isBlankValue(a);
    const bBlank = isBlankValue(b);

    // Valores nulos o vacíos siempre al final, independientemente de asc o desc
    if (aBlank && bBlank) return 0;
    if (aBlank) return 1;
    if (bBlank) return -1;

    // 1. Fechas (%d/%m/%Y, ISO, etc.)
    const dateA = parseDateTimestamp(a);
    const dateB = parseDateTimestamp(b);
    if (dateA !== null && dateB !== null) {
        return dir === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // 2. Números o moneda (ej: "$1,500.50", 123)
    const numA = parseNumericValue(a);
    const numB = parseNumericValue(b);
    if (numA !== null && numB !== null) {
        return dir === 'asc' ? numA - numB : numB - numA;
    }

    // 3. Texto alfabético en español (con soporte numérico natural y estabilidad lexicográfica)
    const strA = normalizeSearchText(a);
    const strB = normalizeSearchText(b);
    let cmp = strA.localeCompare(strB, 'es', {
        sensitivity: 'base',
        numeric: true,
    });
    if (cmp === 0) {
        cmp = String(a ?? '').localeCompare(String(b ?? ''), 'es', {
            numeric: true,
        });
    }
    return dir === 'asc' ? cmp : -cmp;
}

function extractTextContent(node: unknown): string {
    if (node === null || node === undefined || typeof node === 'boolean') {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node).trim();
    }
    if (Array.isArray(node)) {
        return node
            .map((item) => extractTextContent(item))
            .filter((s) => s.length > 0)
            .join(' ')
            .trim();
    }
    if (typeof node === 'object') {
        if (node instanceof Date) {
            return isNaN(node.getTime()) ? '' : node.toISOString();
        }
        if ('props' in node && node.props && typeof node.props === 'object') {
            const props = node.props as Record<string, unknown>;
            if ('children' in props && props.children !== undefined) {
                const childText = extractTextContent(props.children);
                if (childText) return childText;
            }
            if ('activeLabel' in props && 'active' in props) {
                return String(
                    props.active ? props.activeLabel : props.inactiveLabel,
                );
            }
            if (typeof props.title === 'string' && props.title.trim()) {
                return props.title.trim();
            }
            if (typeof props.label === 'string' && props.label.trim()) {
                return props.label.trim();
            }
            if (
                typeof props.value === 'string' ||
                typeof props.value === 'number'
            ) {
                return String(props.value).trim();
            }
        }
    }
    return '';
}

function extractHref(node: unknown): string | null {
    if (!node || typeof node !== 'object') return null;
    if ('props' in node && node.props && typeof node.props === 'object') {
        const props = node.props as Record<string, unknown>;
        if (typeof props.href === 'string' && props.href.trim()) {
            return props.href.trim();
        }
        if (props.children) {
            const childHref = extractHref(props.children);
            if (childHref) return childHref;
        }
    }
    if (Array.isArray(node)) {
        for (const item of node) {
            const h = extractHref(item);
            if (h) return h;
        }
    }
    return null;
}

function extractExportValue<T>(
    item: T,
    key: string,
    colDef?: Column<T>,
): unknown {
    const raw = getValue(item, key);

    // 1. Si el valor del campo en el objeto ya es una URL (ej. UrlLeccion, URLRecurso), exportar la URL
    if (typeof raw === 'string' && /^(https?:\/\/|\/|mailto:|tel:)/i.test(raw.trim())) {
        return raw.trim();
    }

    if (colDef?.render && item && typeof item === 'object') {
        try {
            const rendered = colDef.render(item);

            // 2. Si el elemento renderizado contiene un <a> o link con href, exportar ese enlace
            const href = extractHref(rendered);
            if (href && /^(https?:\/\/|\/|mailto:|tel:)/i.test(href.trim())) {
                return href.trim();
            }

            // 3. Si el texto renderizado es un botón o acción (ej. "Ver Lección", "Ver Entrega", "Ver recurso")
            const text = extractTextContent(rendered);
            const esTextoBoton = /^(ver|abrir|descargar|ir|consultar|detalle|enlace|link)/i.test(text.trim());
            if (esTextoBoton) {
                if (typeof raw === 'string' && /^(https?:\/\/)/i.test(raw.trim())) {
                    return raw.trim();
                }
                const itemObj = item as Record<string, unknown>;
                const urlKeys = ['UrlLeccion', 'URLRecurso', 'UrlRecurso', 'UrlReto', 'URL_produccion_recurso', 'Url', 'url', 'URL', 'Enlace', 'enlace', 'link', 'Link'];
                for (const uk of urlKeys) {
                    if (typeof itemObj[uk] === 'string' && /^(https?:\/\/)/i.test(String(itemObj[uk]).trim())) {
                        return String(itemObj[uk]).trim();
                    }
                }
            }

            if (text !== '') {
                return text;
            }
            if (typeof rendered === 'number') {
                return rendered;
            }
            if (
                rendered !== null &&
                rendered !== undefined &&
                typeof rendered !== 'object'
            ) {
                return rendered;
            }
        } catch {
            // Ignorar errores durante evaluación
        }
    }

    if (raw !== null && raw !== undefined && raw !== '') {
        const text = extractTextContent(raw);
        if (text !== '') {
            return text;
        }
        return raw;
    }
    return raw ?? '';
}

function extractItemValue<T>(
    item: T,
    key: string,
    colDef?: Column<T>,
): unknown {
    if (colDef?.render && item && typeof item === 'object') {
        try {
            const rendered = colDef.render(item);
            const text = extractTextContent(rendered);
            if (text !== '') {
                return text;
            }
            if (typeof rendered === 'number') {
                return rendered;
            }
            if (
                rendered !== null &&
                rendered !== undefined &&
                typeof rendered !== 'object'
            ) {
                return rendered;
            }
        } catch {
            // Ignorar errores durante evaluación de render
        }
    }

    const raw = getValue(item, key);
    if (raw !== null && raw !== undefined && raw !== '') {
        const text = extractTextContent(raw);
        if (text !== '') {
            return text;
        }
        return raw;
    }
    return raw;
}

function getValue(item: unknown, key: string): unknown {
    if (!item || typeof item !== 'object') return undefined;
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            return undefined;
        }
    }
    return value;
}

export function DataTable<T extends object>({
    data,
    columns,
    pagination,
    searchValue = '',
    searchPlaceholder = 'Buscar...',
    baseUrl = '',
    idKey = 'id',
    onEdit,
    onDelete,
    isEditDisabled,
    isDeleteDisabled,
    editDisabledReason = 'Esta acción no está disponible para el estado actual.',
    deleteDisabledReason = 'Esta acción no está disponible para el estado actual.',
    onView,
    editUrl,
    viewUrl,
    addUrl,
    addLabel = 'Nuevo',
    selectable = false,
    emptyIcon,
    emptyTitle = 'No hay registros',
    emptyDescription = 'No se encontraron datos para mostrar.',
    customActions,
    sortColumn,
    sortDirection,
    onSort,
    filters,
    onFilterRemove,
    extraParams,
    reloadOnly,
    filaMarcada = null,
    loading = false,
    showAllOption = false,
    exportar = baseUrl?.split('/').filter(Boolean).pop() ?? 'tabla',
    isExportDisabled = false,
    exportDisabledReason = 'No cuentas con permisos para exportar.',
    mode = 'auto',
}: DataTableProps<T>) {
    const safeData = data || [];
    const safeColumns = columns || [];

    const page = usePage();

    // Detección automática o explícita de props a recargar (partial reload) para optimizar
    // la velocidad evitando transferir catálogos o re-ejecutar consultas pesadas en cada clic.
    const effectiveReloadOnly = useMemo(() => {
        if (reloadOnly && reloadOnly.length > 0) {
            return reloadOnly;
        }
        if (!page?.props) return undefined;

        const keys: string[] = [];
        for (const [key, val] of Object.entries(page.props)) {
            if (
                val === pagination ||
                (val && typeof val === 'object' && 'data' in val && (val as { data?: unknown }).data === data) ||
                val === data
            ) {
                keys.push(key);
            }
        }
        if (keys.length === 0) return undefined;

        for (const extraKey of ['filters', 'searchValue', 'search']) {
            if (extraKey in page.props && !keys.includes(extraKey)) {
                keys.push(extraKey);
            }
        }
        return keys;
    }, [reloadOnly, page?.props, pagination, data]);

    const getItemId = (item: T): string | number =>
        (item as Record<string, unknown>)[idKey] as string | number;

    // Determinación del modo:
    // - 'server': el servidor pagina y busca siempre.
    // - 'client': el cliente pagina y busca siempre en memoria.
    // - 'auto': detecta si el servidor está paginando o si tenemos el listado completo en memoria.
    const isServerMode = useMemo(() => {
        if (mode === 'server') return true;
        if (mode === 'client') return false;

        // Sin baseUrl no hay endpoint al cual pedir páginas o búsquedas en servidor
        if (!baseUrl || baseUrl.trim() === '') {
            return false;
        }

        // Si la paginación del servidor indica que hay más de una página:
        if (pagination && pagination.last_page > 1) {
            return true;
        }

        // Si el total reportado por el servidor supera los registros entregados:
        // significa que el servidor solo mandó una porción/página.
        if (
            pagination &&
            typeof pagination.total === 'number' &&
            pagination.total > safeData.length
        ) {
            return true;
        }

        // Si la pantalla define reloadOnly explícito (ej: SolicitudCotizacion),
        // es una pantalla con partial reload configurado para peticiones al servidor.
        if (reloadOnly && reloadOnly.length > 0) {
            return true;
        }

        // Si safeData contiene la totalidad de registros reportados por pagination (ej. safeData.length === pagination.total):
        // Tenemos el dataset completo en cliente. Debe paginar en cliente.
        if (
            pagination &&
            typeof pagination.total === 'number' &&
            safeData.length === pagination.total
        ) {
            return false;
        }

        // Si tenemos más datos en memoria que per_page pero pagination.last_page es 1:
        // Es un listado completo en memoria con pagination mock ({ last_page: 1 }). Debe paginar en cliente.
        if (safeData.length > (pagination?.per_page || 10)) {
            return false;
        }

        return false;
    }, [mode, baseUrl, pagination, safeData.length, reloadOnly]);

    // Búsqueda
    const [search, setSearch] = useState(searchValue);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearch(searchValue);
    }, [searchValue]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Ordenamiento
    // "sobre el ordenamiento vendrá exactamente como se trae de la consulta lo que si es cuando se seleccione la fecha y arriba o abajo se ajusta"
    const [internalSortColumn, setInternalSortColumn] = useState<string | null>(
        sortColumn || null,
    );
    const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc' | null>(
        sortDirection || null,
    );

    useEffect(() => {
        if (sortColumn !== undefined) setInternalSortColumn(sortColumn || null);
        if (sortDirection !== undefined) setInternalSortDirection(sortDirection || null);
    }, [sortColumn, sortDirection]);

    const activeSortColumn = sortColumn !== undefined ? sortColumn : internalSortColumn;
    const activeSortDirection = sortDirection !== undefined ? sortDirection : internalSortDirection;

    // Filtrado de filas (en modo cliente busca coincidencias en todo el registro)
    const normalizedQuery = useMemo(() => normalizeSearchText(search), [search]);

    const filteredData = useMemo(() => {
        if (isServerMode || !normalizedQuery) {
            return safeData;
        }

        return safeData.filter((item) => {
            // 1. Revisar todas las columnas declaradas (render primero para evaluar textos visibles como Ciudad, luego raw)
            for (const col of safeColumns) {
                if (col.render && typeof item === 'object' && item !== null) {
                    try {
                        const rendered = col.render(item);
                        const text = extractTextContent(rendered);
                        if (
                            text &&
                            normalizeSearchText(text).includes(normalizedQuery)
                        ) {
                            return true;
                        }
                    } catch {
                        // Ignorar errores en render
                    }
                }

                const val = getValue(item, String(col.key));
                if (val !== undefined && val !== null) {
                    const text = extractTextContent(val);
                    if (
                        text &&
                        normalizeSearchText(text).includes(normalizedQuery)
                    ) {
                        return true;
                    }
                }
            }

            // 2. Revisar propiedades del objeto en primer nivel
            if (typeof item === 'object' && item !== null) {
                for (const val of Object.values(item)) {
                    if (typeof val === 'string' || typeof val === 'number') {
                        if (normalizeSearchText(val).includes(normalizedQuery)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });
    }, [safeData, normalizedQuery, isServerMode, safeColumns]);

    // Ordenamiento de filas:
    // Por defecto conserva el orden original exacto de la consulta de base de datos.
    // Solo cuando el usuario hace clic en una cabecera (arriba/abajo), se reordena.
    const sortedData = useMemo(() => {
        if (isServerMode || !activeSortColumn || !activeSortDirection) {
            return filteredData;
        }

        const colDef = safeColumns.find(
            (c) => String(c.key) === activeSortColumn,
        );

        return [...filteredData].sort((itemA, itemB) => {
            const valA = extractItemValue(itemA, activeSortColumn, colDef);
            const valB = extractItemValue(itemB, activeSortColumn, colDef);
            return compareValues(valA, valB, activeSortDirection);
        });
    }, [
        filteredData,
        activeSortColumn,
        activeSortDirection,
        isServerMode,
        safeColumns,
    ]);

    // Paginación en cliente y en servidor
    const [clientPage, setClientPage] = useState(1);
    const [clientPerPage, setClientPerPage] = useState(
        pagination?.per_page || 10,
    );

    // Al escribir en el buscador, cambiar el tamaño de página o cambiar el dataset: reset a página 1
    useEffect(() => {
        if (!isServerMode) {
            setClientPage(1);
        }
    }, [normalizedQuery, clientPerPage, isServerMode, data]);

    const currentPerPage = isServerMode
        ? (pagination?.per_page || 10)
        : clientPerPage;

    const showingAll = currentPerPage >= ALL_PER_PAGE;

    const clientTotal = sortedData.length;
    const clientLastPage = Math.max(1, Math.ceil(clientTotal / currentPerPage));
    const safeClientPage = Math.min(clientPage, clientLastPage);

    const effectiveCurrentPage = isServerMode
        ? (pagination?.current_page || 1)
        : safeClientPage;
    const effectiveLastPage = isServerMode
        ? (pagination?.last_page || 1)
        : clientLastPage;
    const effectiveTotal = isServerMode
        ? (pagination?.total || 0)
        : clientTotal;

    const effectiveFrom = effectiveTotal === 0
        ? 0
        : isServerMode
            ? (pagination?.from ?? 0)
            : (safeClientPage - 1) * currentPerPage + 1;

    const effectiveTo = effectiveTotal === 0
        ? 0
        : isServerMode
            ? (pagination?.to ?? 0)
            : Math.min(safeClientPage * currentPerPage, clientTotal);

    // Filas visibles en la página actual
    const displayData = useMemo(() => {
        if (isServerMode) {
            if (!activeSortColumn || !activeSortDirection) {
                return safeData;
            }
            const colDef = safeColumns.find(
                (c) => String(c.key) === activeSortColumn,
            );
            return [...safeData].sort((itemA, itemB) => {
                const valA = extractItemValue(itemA, activeSortColumn, colDef);
                const valB = extractItemValue(itemB, activeSortColumn, colDef);
                return compareValues(valA, valB, activeSortDirection);
            });
        }
        if (showingAll) {
            return sortedData;
        }
        const start = (safeClientPage - 1) * currentPerPage;
        return sortedData.slice(start, start + currentPerPage);
    }, [
        isServerMode,
        safeData,
        showingAll,
        sortedData,
        safeClientPage,
        currentPerPage,
        activeSortColumn,
        activeSortDirection,
        safeColumns,
    ]);

    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(
        new Set(),
    );
    const [refreshing, setRefreshing] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(
            safeColumns
                .filter((col) => !col.defaultHidden)
                .map((col) => String(col.key)),
        ),
    );

    /**
     * Construye los parámetros de consulta para peticiones al servidor,
     * preservando rigurosamente los parámetros existentes en window.location.search
     * (por ejemplo FechaInicio, FechaFin, filtros de periodo o catálogos) y combinándolos
     * con extraParams y los overrides de la acción en curso.
     */
    const buildServerParams = (overrides: Record<string, unknown> = {}) => {
        const params: Record<string, unknown> = {};

        // 1. Preservar parámetros de la URL actual
        if (typeof window !== 'undefined' && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.forEach((val, key) => {
                params[key] = val;
            });
        }

        // 2. Aplicar extraParams si fueron provistos
        if (extraParams) {
            Object.entries(extraParams).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    params[k] = v;
                } else if (v === '' || v === null) {
                    delete params[k];
                }
            });
        }

        // 3. Parámetros de la tabla actuales
        if (search && search.trim() !== '') {
            params.search = search.trim();
        } else {
            delete params.search;
        }

        if (activeSortColumn) {
            params.sort_column = activeSortColumn;
        } else {
            delete params.sort_column;
        }

        if (activeSortDirection) {
            params.sort_direction = activeSortDirection;
        } else {
            delete params.sort_direction;
        }

        params.per_page = currentPerPage;

        // 4. Overrides específicos de la acción
        Object.entries(overrides).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                params[k] = v;
            } else {
                delete params[k];
            }
        });

        return params;
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        if (isServerMode && baseUrl) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            const delay = value.trim() === '' ? 50 : 350;
            searchTimeoutRef.current = setTimeout(() => {
                router.get(
                    baseUrl,
                    buildServerParams({
                        search: value || undefined,
                        page: 1,
                    }),
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        ...(effectiveReloadOnly ? { only: effectiveReloadOnly } : {}),
                    },
                );
            }, delay);
        } else {
            setClientPage(1);
        }
    };

    const handlePageChange = (page: number) => {
        const targetPage = Math.max(1, Math.min(page, effectiveLastPage));
        if (isServerMode && baseUrl) {
            router.get(
                baseUrl,
                buildServerParams({
                    page: targetPage,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    ...(effectiveReloadOnly ? { only: effectiveReloadOnly } : {}),
                },
            );
        } else {
            setClientPage(targetPage);
        }
    };

    const handlePerPageChange = (perPage: number) => {
        if (isServerMode && baseUrl) {
            router.get(
                baseUrl,
                buildServerParams({
                    page: 1,
                    per_page: perPage,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    ...(effectiveReloadOnly ? { only: effectiveReloadOnly } : {}),
                },
            );
        } else {
            setClientPerPage(perPage);
            setClientPage(1);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ onFinish: () => setRefreshing(false) });
    };

    const handleExport = () => {
        if (!exportar) return;
        const aCol = (col: Column<T>) => ({
            key: String(col.key),
            label: col.label,
        });
        const rowsToExport = isServerMode ? safeData : sortedData;
        const filas = rowsToExport.map((item) =>
            Object.fromEntries(
                safeColumns.map((col) => [
                    String(col.key),
                    extractExportValue(item, String(col.key), col),
                ]),
            ),
        );
        exportCsv(exportar, visibleCols.map(aCol), filas, {
            todasColumnas: safeColumns.map(aCol),
        });
    };

    const handleToggleShowAll = () => {
        if (isServerMode && baseUrl) {
            router.get(
                baseUrl,
                buildServerParams({
                    page: 1,
                    per_page: showingAll ? 10 : ALL_PER_PAGE,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    ...(effectiveReloadOnly ? { only: effectiveReloadOnly } : {}),
                },
            );
        } else {
            setClientPerPage(showingAll ? 10 : ALL_PER_PAGE);
            setClientPage(1);
        }
    };

    // Alterna orden: asc -> desc -> neutral (orden original de consulta)
    const handleSort = (column: string) => {
        let nextDir: 'asc' | 'desc' | null = 'asc';
        if (activeSortColumn === column) {
            if (activeSortDirection === 'asc') {
                nextDir = 'desc';
            } else if (activeSortDirection === 'desc') {
                nextDir = null; // Vuelve al orden original de la consulta
            } else {
                nextDir = 'asc';
            }
        }

        const effectiveDir = nextDir ?? 'asc';
        setInternalSortColumn(nextDir ? column : null);
        setInternalSortDirection(nextDir);

        if (onSort) {
            onSort(column, effectiveDir);
        } else if (isServerMode && baseUrl) {
            router.get(
                baseUrl,
                buildServerParams({
                    page: 1,
                    sort_column: nextDir ? column : undefined,
                    sort_direction: nextDir || undefined,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    ...(effectiveReloadOnly ? { only: effectiveReloadOnly } : {}),
                },
            );
        }
    };

    const toggleColumn = (key: string) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    const toggleRowSelection = (id: number | string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllRows = () => {
        if (selectedRows.size === displayData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(displayData.map((item) => getItemId(item))));
        }
    };

    const visibleCols = safeColumns.filter((col) =>
        visibleColumns.has(String(col.key)),
    );
    const hideableColumns = safeColumns.filter((col) => col.hideable !== false);
    const hasActions =
        onEdit || onDelete || onView || editUrl || viewUrl || customActions;
    const canGoPrevious = effectiveCurrentPage > 1;
    const canGoNext = effectiveCurrentPage < effectiveLastPage;

    // Flechita de ordenamiento estándar de la tabla
    const SortIcon = ({ column }: { column: string }) => {
        if (activeSortColumn !== column || !activeSortDirection) {
            return (
                <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
            );
        }
        return activeSortDirection === 'asc' ? (
            <ArrowUp className="ml-1 h-3.5 w-3.5 shrink-0 stroke-[2.5] text-primary" />
        ) : (
            <ArrowDown className="ml-1 h-3.5 w-3.5 shrink-0 stroke-[2.5] text-primary" />
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={cn("h-8 pl-8", search && "pr-8")}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => handleSearch('')}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Limpiar búsqueda"
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {exportar && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={safeData.length === 0 || isExportDisabled}
                            title={
                                isExportDisabled
                                    ? exportDisabledReason
                                    : 'Exportar lo que se está viendo'
                            }
                        >
                            <Download className="size-4" />
                            Exportar
                        </Button>
                    )}
                    {hideableColumns.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <SlidersHorizontal className="size-4" />
                                    Columnas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {hideableColumns.map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={String(column.key)}
                                        checked={visibleColumns.has(
                                            String(column.key),
                                        )}
                                        onCheckedChange={() =>
                                            toggleColumn(String(column.key))
                                        }
                                    >
                                        {column.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Actualizar"
                        aria-label="Actualizar"
                    >
                        <RefreshCw
                            className={cn(
                                'size-4',
                                refreshing && 'animate-spin',
                            )}
                        />
                    </Button>
                    {addUrl && (
                        <Button size="sm" onClick={() => router.visit(addUrl)}>
                            <Plus className="size-4" />
                            {addLabel}
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Chips */}
            {filters && filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
                    {filters.map((filter) => (
                        <Badge
                            key={filter.key}
                            variant="outline"
                            className="flex items-center gap-1 border-primary/20 bg-primary/5 px-3 py-1 text-primary"
                        >
                            <span className="text-xs font-medium">
                                {filter.label}:
                            </span>
                            <span className="text-xs">{filter.value}</span>
                            {onFilterRemove && (
                                <button
                                    type="button"
                                    onClick={() => onFilterRemove(filter.key)}
                                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Table */}
            <div
                className={cn(
                    'transition-opacity duration-200',
                    loading && safeData.length > 0 && 'opacity-50',
                )}
            >
                {/* El contenedor de Table es el único que hace scroll: así el thead sticky sí se fija. */}
                <Table containerClassName="scroll-thin max-h-[calc(100vh-18rem)] overflow-auto">
                    <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow className="hover:bg-transparent">
                            {selectable && (
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={
                                            displayData.length > 0 &&
                                            selectedRows.size ===
                                                displayData.length
                                        }
                                        onCheckedChange={toggleAllRows}
                                    />
                                </TableHead>
                            )}
                            {visibleCols.map((column) => {
                                const isSortable = column.sortable !== false;
                                return (
                                    <TableHead
                                        key={String(column.key)}
                                        className={cn(
                                            isSortable &&
                                                'group cursor-pointer select-none hover:text-foreground',
                                            column.className,
                                        )}
                                        onClick={
                                            isSortable
                                                ? () =>
                                                      handleSort(
                                                          String(column.key),
                                                      )
                                                : undefined
                                        }
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {column.label}
                                            {isSortable && (
                                                <SortIcon
                                                    column={String(column.key)}
                                                />
                                            )}
                                        </span>
                                    </TableHead>
                                );
                            })}
                            {hasActions && (
                                <TableHead className="w-24 text-right">
                                    Acciones
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && safeData.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow
                                    key={i}
                                    className="hover:bg-transparent"
                                >
                                    {selectable && (
                                        <TableCell>
                                            <Skeleton className="size-4" />
                                        </TableCell>
                                    )}
                                    {visibleCols.map((column, j) => (
                                        <TableCell key={String(column.key)}>
                                            <Skeleton
                                                className={cn(
                                                    'h-4',
                                                    j === 0
                                                        ? 'w-16'
                                                        : 'w-full max-w-[180px]',
                                                )}
                                            />
                                        </TableCell>
                                    ))}
                                    {hasActions && (
                                        <TableCell>
                                            <Skeleton className="ml-auto h-4 w-16" />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : displayData.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={
                                        visibleCols.length +
                                        (selectable ? 1 : 0) +
                                        (hasActions ? 1 : 0)
                                    }
                                    className="h-48"
                                >
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {emptyIcon || (
                                            <div className="mb-4 rounded-full bg-muted p-4">
                                                <Search className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <h3 className="mb-1 text-lg font-medium tracking-tight text-foreground">
                                            {search ? 'Sin coincidencias' : emptyTitle}
                                        </h3>
                                        <p className="max-w-sm text-sm text-muted-foreground">
                                            {search
                                                ? `No se encontraron registros que coincidan con "${search}".`
                                                : emptyDescription}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayData.map((item) => (
                                <TableRow
                                    key={getItemId(item)}
                                    data-state={
                                        selectedRows.has(getItemId(item)) ||
                                        (filaMarcada !== null &&
                                            filaMarcada === getItemId(item))
                                            ? 'selected'
                                            : undefined
                                    }
                                >
                                    {selectable && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRows.has(
                                                    getItemId(item),
                                                )}
                                                onCheckedChange={() =>
                                                    toggleRowSelection(
                                                        getItemId(item),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                    )}
                                    {visibleCols.map((column, index) => (
                                        <TableCell
                                            key={`${getItemId(item)}-${String(column.key)}`}
                                            className={cn(
                                                index === 0 && 'font-medium',
                                                column.className,
                                            )}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : renderValue(
                                                      getValue(
                                                          item,
                                                          String(column.key),
                                                      ),
                                                  )}
                                        </TableCell>
                                    ))}
                                    {hasActions && (
                                        <TableCell className="pr-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {(onView || viewUrl) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Ver"
                                                        aria-label="Ver"
                                                        className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => {
                                                            if (viewUrl)
                                                                router.visit(
                                                                    viewUrl(
                                                                        item,
                                                                    ),
                                                                );
                                                            else if (onView)
                                                                onView(item);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {(onEdit || editUrl) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        disabled={isEditDisabled?.(
                                                            item,
                                                        )}
                                                        title={
                                                            isEditDisabled?.(
                                                                item,
                                                            )
                                                                ? editDisabledReason
                                                                : 'Editar'
                                                        }
                                                        aria-label="Editar"
                                                        className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => {
                                                            if (editUrl)
                                                                router.visit(
                                                                    editUrl(
                                                                        item,
                                                                    ),
                                                                );
                                                            else if (onEdit)
                                                                onEdit(item);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        disabled={isDeleteDisabled?.(
                                                            item,
                                                        )}
                                                        title={
                                                            isDeleteDisabled?.(
                                                                item,
                                                            )
                                                                ? deleteDisabledReason
                                                                : 'Borrar'
                                                        }
                                                        aria-label="Borrar"
                                                        className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            onDelete(item)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {customActions &&
                                                    customActions(item)}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer: sticky al fondo de la ventana cuando la página hace scroll */}
            <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-card/95 px-4 py-3 text-sm text-muted-foreground shadow-[0_-8px_18px_-16px_hsl(222_47%_11%/0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p>
                    {selectable && selectedRows.size > 0
                        ? `${selectedRows.size} seleccionados · `
                        : ''}
                    Mostrando {effectiveFrom}-{effectiveTo} de {effectiveTotal}
                    {!isServerMode && normalizedQuery && clientTotal !== safeData.length && (
                        <span className="text-muted-foreground/75">
                            {' '}(filtrados de {safeData.length})
                        </span>
                    )}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    {showAllOption && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleShowAll}
                        >
                            {showingAll ? 'Ver paginado' : 'Ver todos'}
                        </Button>
                    )}
                    {!showingAll && (
                        <>
                            <SelectorPagina
                                value={currentPerPage}
                                onChange={handlePerPageChange}
                            />
                            <span className="min-w-24 text-center">
                                Página {effectiveCurrentPage} de{' '}
                                {effectiveLastPage}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => handlePageChange(1)}
                                    disabled={!canGoPrevious}
                                    title="Primera página"
                                    aria-label="Primera página"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() =>
                                        handlePageChange(
                                            effectiveCurrentPage - 1,
                                        )
                                    }
                                    disabled={!canGoPrevious}
                                    title="Página anterior"
                                    aria-label="Página anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() =>
                                        handlePageChange(
                                            effectiveCurrentPage + 1,
                                        )
                                    }
                                    disabled={!canGoNext}
                                    title="Página siguiente"
                                    aria-label="Página siguiente"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() =>
                                        handlePageChange(effectiveLastPage)
                                    }
                                    disabled={!canGoNext}
                                    title="Última página"
                                    aria-label="Última página"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function renderValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground italic">—</span>;
    }
    return String(value);
}

// Status Badges con colores del tema
export function StatusBadge({
    active,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    className,
}: {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
    className?: string;
}) {
    return (
        <Badge
            className={cn(
                'font-medium',
                active
                    ? 'bg-success text-success-foreground hover:bg-success/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/90',
                className,
            )}
        >
            {active ? activeLabel : inactiveLabel}
        </Badge>
    );
}

export function InfoBadge({ children }: { children: React.ReactNode }) {
    return (
        <Badge className="bg-info font-medium text-info-foreground hover:bg-info/90">
            {children}
        </Badge>
    );
}

export function WarningBadge({ children }: { children: React.ReactNode }) {
    return (
        <Badge className="bg-warning font-medium text-warning-foreground hover:bg-warning/90">
            {children}
        </Badge>
    );
}

export function DangerBadge({ children }: { children: React.ReactNode }) {
    return (
        <Badge className="bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90">
            {children}
        </Badge>
    );
}
