import { exportCsv } from '@/components/noil/export-csv';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/noil/empty-state';
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
import { router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowDownAZ,
    ArrowUpAZ,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
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
import { useState } from 'react';

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
    pagination: PaginationData;
    searchValue?: string;
    searchPlaceholder?: string;
    baseUrl: string;
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
    emptyAction?: React.ReactNode;
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
}

const ALL_PER_PAGE = 100000;

export function DataTable<T extends object>({
    data,
    columns,
    pagination,
    searchValue = '',
    searchPlaceholder = 'Buscar por código o descripción...',
    baseUrl,
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
    emptyAction,
    customActions,
    sortColumn,
    sortDirection = 'asc',
    onSort,
    filters,
    onFilterRemove,
    extraParams,
    reloadOnly,
    filaMarcada = null,
    loading = false,
    showAllOption = false,
    exportar = baseUrl?.split('/').filter(Boolean).pop() ?? 'tabla',
}: DataTableProps<T>) {
    const safeData = data || [];
    const safeColumns = columns || [];

    const [search, setSearch] = useState(searchValue);
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

    const getItemId = (item: T): string | number =>
        (item as Record<string, unknown>)[idKey] as string | number;

    const showingAll = pagination.per_page >= ALL_PER_PAGE;

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            baseUrl,
            {
                search: value,
                page: 1,
                sort_column: sortColumn,
                sort_direction: sortDirection,
                per_page: pagination.per_page,
                ...extraParams,
            },
            {
                preserveState: true,
                replace: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            baseUrl,
            {
                search,
                page,
                sort_column: sortColumn,
                sort_direction: sortDirection,
                per_page: pagination.per_page,
                ...extraParams,
            },
            {
                preserveState: true,
                replace: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            baseUrl,
            {
                search,
                page: 1,
                sort_column: sortColumn,
                sort_direction: sortDirection,
                ...extraParams,
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
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
        const filas = safeData.map((item) =>
            Object.fromEntries(
                safeColumns.map((col) => [
                    String(col.key),
                    getValue(item, String(col.key)),
                ]),
            ),
        );
        exportCsv(exportar, visibleCols.map(aCol), filas, {
            todasColumnas: safeColumns.map(aCol),
        });
    };

    const handleToggleShowAll = () => {
        router.get(
            baseUrl,
            {
                search,
                page: 1,
                sort_column: sortColumn,
                sort_direction: sortDirection,
                ...extraParams,
                per_page: showingAll ? 10 : ALL_PER_PAGE,
            },
            {
                preserveState: true,
                replace: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
    };

    const handleSort = (column: string) => {
        if (!onSort) return;
        const newDir =
            sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(column, newDir);
    };

    const getValue = (item: T, key: string): unknown => {
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
        if (selectedRows.size === safeData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(safeData.map((item) => getItemId(item))));
        }
    };

    const visibleCols = safeColumns.filter((col) =>
        visibleColumns.has(String(col.key)),
    );
    const hideableColumns = safeColumns.filter((col) => col.hideable !== false);
    const hasActions =
        onEdit || onDelete || onView || editUrl || viewUrl || customActions;
    const canGoPrevious = pagination.current_page > 1;
    const canGoNext = pagination.current_page < pagination.last_page;

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) {
            return <ArrowDown className="ml-1 h-3 w-3 opacity-30" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUpAZ className="ml-1 h-3 w-3 text-primary" />
        ) : (
            <ArrowDownAZ className="ml-1 h-3 w-3 text-primary" />
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
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-8 pl-8"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {exportar && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={safeData.length === 0}
                            title="Exportar lo que se está viendo"
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
                                            safeData.length > 0 &&
                                            selectedRows.size ===
                                                safeData.length
                                        }
                                        onCheckedChange={toggleAllRows}
                                    />
                                </TableHead>
                            )}
                            {visibleCols.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={cn(
                                        column.sortable &&
                                            'cursor-pointer select-none hover:text-foreground',
                                        column.className,
                                    )}
                                    onClick={
                                        column.sortable
                                            ? () =>
                                                  handleSort(String(column.key))
                                            : undefined
                                    }
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {column.label}
                                        {column.sortable && (
                                            <SortIcon
                                                column={String(column.key)}
                                            />
                                        )}
                                    </span>
                                </TableHead>
                            ))}
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
                        ) : safeData.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={
                                        visibleCols.length +
                                        (selectable ? 1 : 0) +
                                        (hasActions ? 1 : 0)
                                    }
                                    className="h-48"
                                >
                                    <EmptyState
                                        icon={emptyIcon}
                                        title={emptyTitle}
                                        description={emptyDescription}
                                        action={emptyAction}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            safeData.map((item) => (
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
                    Mostrando {pagination.from ?? 0}-{pagination.to ?? 0} de{' '}
                    {pagination.total}
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
                                value={pagination.per_page}
                                onChange={handlePerPageChange}
                            />
                            <span className="min-w-24 text-center">
                                Página {pagination.current_page} de{' '}
                                {pagination.last_page}
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
                                            pagination.current_page - 1,
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
                                            pagination.current_page + 1,
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
                                        handlePageChange(pagination.last_page)
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
