/*
 | Gráficas ligeras en SVG (sin dependencias), portadas de control-obra/components/charts.tsx
 | del proyecto appweb_proveedores. Sparkline y Donut.
 */

export function Sparkline({
    data,
    color = '#2563eb',
    width = 120,
    height = 34,
}: {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data
        .map((v, i) => {
            const x = (i / Math.max(1, data.length - 1)) * width;
            const y = height - 3 - ((v - min) / range) * (height - 6);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}

export type DonutSeg = { label: string; value: number; color: string };

export function Donut({
    segments,
    size = 168,
    stroke = 22,
    centerTop,
    centerSub,
}: {
    segments: DonutSeg[];
    size?: number;
    stroke?: number;
    centerTop?: string;
    centerSub?: string;
}) {
    const r = (size - stroke) / 2;
    const c = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={stroke}
            />
            <g transform={`rotate(-90 ${c} ${c})`}>
                {segments.map((s) => {
                    const dash = (s.value / total) * circ;
                    const el = (
                        <circle
                            key={s.label}
                            cx={c}
                            cy={c}
                            r={r}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-offset}
                        />
                    );
                    offset += dash;
                    return el;
                })}
            </g>
            {centerTop && (
                <text
                    x={c}
                    y={c - 4}
                    textAnchor="middle"
                    className="fill-foreground"
                    fontSize={26}
                    fontWeight={700}
                >
                    {centerTop}
                </text>
            )}
            {centerSub && (
                <text
                    x={c}
                    y={c + 16}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize={11}
                >
                    {centerSub}
                </text>
            )}
        </svg>
    );
}
