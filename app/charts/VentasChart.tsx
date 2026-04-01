'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface ChartDataPoint {
  month: string;
  monthLabel: string;
  ventas?: number;
  ventasCurrent?: number;
}

function formatCurrency(value: number): string {
  const numberFormatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${numberFormatted}`;
}

const chartConfig = {
  ventas: {
    label: 'Ventas',
    color: '#d4d4d4',
  },
  ventasCurrent: {
    label: 'Ventas (en curso)',
    color: '#d4d4d4',
  },
} satisfies ChartConfig;

interface VentasChartProps {
  data: ChartDataPoint[];
}

export default function VentasChart({ data }: VentasChartProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-8">Ventas</h2>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <XAxis
            dataKey="monthLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            fontSize={11}
            tickFormatter={(value: number) => {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
              return String(value);
            }}
          />
          <ChartTooltip
            content={(props) => {
              if (!props.active || !props.payload?.length) return null;
              const data = props.payload[0].payload as ChartDataPoint;
              // On bridge month both series have values — show only one
              const filtered = props.payload.filter(
                (p) =>
                  !(
                    p.dataKey === 'ventasCurrent' &&
                    data.ventas !== undefined &&
                    data.ventasCurrent !== undefined
                  )
              );
              const { content: _, ...rest } = props;
              return (
                <ChartTooltipContent
                  {...rest}
                  payload={filtered}
                  formatter={(value) => formatCurrency(Number(value))}
                  hideIndicator
                />
              );
            }}
          />
          <defs>
            <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#d4d4d4" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillVentasCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#d4d4d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            dataKey="ventas"
            type="monotone"
            fill="url(#fillVentas)"
            stroke="#a3a3a3"
            strokeWidth={1.5}
            connectNulls={false}
          />
          <Area
            dataKey="ventasCurrent"
            type="monotone"
            fill="url(#fillVentasCurrent)"
            stroke="#a3a3a3"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            connectNulls={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
