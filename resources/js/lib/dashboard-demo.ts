import { type DonutSeg } from '@/components/noil/charts';
import { type Badge } from '@/components/ui/badge';
import {
    ClipboardList,
    FileText,
    Receipt,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { type ComponentProps } from 'react';

export const COLORES = {
    azul: '#3b82f6',
    verde: '#10b981',
    ambar: '#f59e0b',
    violeta: '#8b5cf6',
    cian: '#0ea5e9',
    rojo: '#ef4444',
};

export interface Kpi {
    title: string;
    total: number;
    esteMes: number;
    spark: number[];
    color: string;
    icon: LucideIcon;
}

export const KPIS: Kpi[] = [
    {
        title: 'Solicitudes',
        total: 128,
        esteMes: 14,
        spark: [8, 12, 9, 15, 11, 14],
        color: COLORES.azul,
        icon: ClipboardList,
    },
    {
        title: 'Clientes activos',
        total: 42,
        esteMes: 3,
        spark: [30, 33, 35, 38, 40, 42],
        color: COLORES.verde,
        icon: Users,
    },
    {
        title: 'Documentos',
        total: 316,
        esteMes: 27,
        spark: [20, 25, 22, 30, 24, 27],
        color: COLORES.violeta,
        icon: FileText,
    },
    {
        title: 'Facturado (k)',
        total: 587,
        esteMes: 96,
        spark: [70, 85, 60, 90, 80, 96],
        color: COLORES.ambar,
        icon: Receipt,
    },
];

export const BARRAS = {
    labels: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
    datasets: [
        {
            label: 'Terminadas',
            data: [9, 12, 10, 14, 11, 15],
            backgroundColor: COLORES.verde,
            borderRadius: 4,
        },
        {
            label: 'En proceso',
            data: [4, 3, 6, 5, 7, 6],
            backgroundColor: COLORES.azul,
            borderRadius: 4,
        },
        {
            label: 'Pendientes',
            data: [2, 4, 3, 2, 5, 3],
            backgroundColor: COLORES.ambar,
            borderRadius: 4,
        },
    ],
};

export const BARRAS_OPCIONES = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        datalabels: {
            color: '#fff',
            font: { size: 11, weight: 'bold' as const },
        },
    },
    scales: {
        x: { stacked: true, grid: { display: false } },
        y: {
            stacked: true,
            ticks: { precision: 0 },
            grid: { color: 'hsl(214 32% 89%)' },
        },
    },
};

export const DONA: DonutSeg[] = [
    { label: 'Terminado', value: 71, color: COLORES.verde },
    { label: 'En proceso', value: 31, color: COLORES.azul },
    { label: 'Pendiente', value: 19, color: COLORES.ambar },
    { label: 'Cancelado', value: 7, color: COLORES.rojo },
];

export interface Reciente {
    codigo: string;
    nombre: string;
    estatus: string;
    variant: ComponentProps<typeof Badge>['variant'];
}

export const RECIENTES: Reciente[] = [
    {
        codigo: 'SOL-00128',
        nombre: 'Mantenimiento preventivo',
        estatus: 'Pendiente',
        variant: 'warning',
    },
    {
        codigo: 'SOL-00127',
        nombre: 'Capacitación NOM-035',
        estatus: 'En proceso',
        variant: 'info',
    },
    {
        codigo: 'SOL-00126',
        nombre: 'Auditoría interna',
        estatus: 'Terminado',
        variant: 'success',
    },
    {
        codigo: 'SOL-00125',
        nombre: 'Instalación de equipo',
        estatus: 'Cancelado',
        variant: 'danger',
    },
    {
        codigo: 'SOL-00124',
        nombre: 'Servicio correctivo',
        estatus: 'Terminado',
        variant: 'success',
    },
];
