'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface InventarioRadarDataPoint {
  category: string;
  value: number;
}

function formatCurrency(value: number): string {
  const numberFormatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${numberFormatted}`;
}

const chartConfig = {
  inventario: {
    label: 'Inventario',
    color: '#d4d4d4',
  },
} satisfies ChartConfig;

interface InventarioRadarChartProps {
  data: InventarioRadarDataPoint[];
}

export default function InventarioRadarChart({ data }: InventarioRadarChartProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-8">Inventario</h2>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
                hideIndicator
              />
            }
          />
          <Radar
            dataKey="value"
            name="inventario"
            stroke="#a3a3a3"
            fill="#d4d4d4"
            fillOpacity={0.4}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
