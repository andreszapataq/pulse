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
  ventas: number;
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
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
                hideIndicator
              />
            }
          />
          <defs>
            <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#d4d4d4" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            dataKey="ventas"
            type="monotone"
            fill="url(#fillVentas)"
            stroke="#a3a3a3"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
