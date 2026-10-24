import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

interface Column {
    key: string;
    label: string;
}

interface EmptyTableProps {
    columns: Column[];
    title: string;
    description?: string;
    onAdd?: () => void;
    addLabel?: string;
}

export function EmptyTable({
    columns,
    title,
    description = 'No hay registros disponibles',
    onAdd,
    addLabel = 'Agregar',
}: EmptyTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {onAdd && (
                    <Button onClick={onAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        {addLabel}
                    </Button>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key}>
                                    {column.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Sin registros
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
