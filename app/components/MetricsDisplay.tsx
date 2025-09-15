'use client';

import { useState } from 'react';
import type { MetricsData } from '@/lib/metrics';
import AccordionMetricCard from './AccordionMetricCard';

// Funciones utilitarias locales (evitan imports problemáticos con 'fs')
function formatCurrency(value: number): string {
  const numberFormatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${numberFormatted}`;
}

function formatValue(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value}%`;
  }
  return formatCurrency(value);
}

function calculatePercentage(value: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((value / target) * 100);
}

interface MetricCardProps {
  title: string;
  value: string;
  percentage?: string;
  showProgressBar?: boolean;
}

function MetricCard({ title, value, percentage, showProgressBar = false }: MetricCardProps) {
  const getProgressWidth = () => {
    if (!percentage) return '0%';
    return percentage;
  };

  return (
    <div className="mb-10">
      <h2 className="text-base font-medium leading-tight">
        {title}
      </h2>
      <div className="flex justify-between items-baseline mb-[3px]">
        <div className="text-xl font-normal">
          {value}
        </div>
        {percentage && (
          <span className="text-sm font-normal text-gray-500">
            {percentage}
          </span>
        )}
      </div>
      {showProgressBar && (
        <div className="w-full h-[10px]">
          <div 
            className="bg-linear-to-r from-background to-foreground h-full" 
            style={{ width: getProgressWidth() }}
          />
        </div>
      )}
    </div>
  );
}

interface MetricsDisplayProps {
  metricsData: MetricsData;
}

export default function MetricsDisplay({ metricsData }: MetricsDisplayProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const handleAccordionToggle = (accordionId: string) => {
    setExpandedAccordion(expandedAccordion === accordionId ? null : accordionId);
  };

  return (
    <div>
      <AccordionMetricCard
        title={metricsData.metrics.ventas.title}
        value={formatValue(metricsData.metrics.ventas.value, metricsData.metrics.ventas.unit)}
        percentage={`${calculatePercentage(metricsData.metrics.ventas.value, metricsData.metrics.ventas.target)}%`}
        showProgressBar={metricsData.metrics.ventas.showProgressBar}
        breakdown={metricsData.metrics.ventas.breakdown}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'ventas'}
        onToggle={() => handleAccordionToggle('ventas')}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.recaudo.title}
        value={formatValue(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.unit)}
        percentage={`${calculatePercentage(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.target)}%`}
        showProgressBar={metricsData.metrics.recaudo.showProgressBar}
        breakdown={metricsData.metrics.recaudo.breakdown}
        listStyle="bullets"
        isExpanded={expandedAccordion === 'recaudo'}
        onToggle={() => handleAccordionToggle('recaudo')}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.inventario.title}
        value={formatValue(metricsData.metrics.inventario.value, metricsData.metrics.inventario.unit)}
        percentage={`${calculatePercentage(metricsData.metrics.inventario.value, metricsData.metrics.inventario.target)}%`}
        showProgressBar={metricsData.metrics.inventario.showProgressBar}
        breakdown={metricsData.metrics.inventario.breakdown}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'inventario'}
        onToggle={() => handleAccordionToggle('inventario')}
      />
      
      <MetricCard
        title={metricsData.metrics.margen.title}
        value={formatValue(metricsData.metrics.margen.value, metricsData.metrics.margen.unit)}
        percentage={`${calculatePercentage(metricsData.metrics.margen.value, metricsData.metrics.margen.target)}%`}
        showProgressBar={metricsData.metrics.margen.showProgressBar}
      />
      
      <MetricCard
        title={metricsData.metrics.caja.title}
        value={formatValue(metricsData.metrics.caja.value, metricsData.metrics.caja.unit)}
        percentage={`${calculatePercentage(metricsData.metrics.caja.value, metricsData.metrics.caja.target)}%`}
        showProgressBar={metricsData.metrics.caja.showProgressBar}
      />
    </div>
  );
}
