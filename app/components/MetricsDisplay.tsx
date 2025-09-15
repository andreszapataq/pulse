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

// Nueva función para formatear porcentaje con "+" cuando supera 100%
function formatPercentageDisplay(percentage: number): string {
  if (percentage > 100) {
    return '+100%';
  }
  return `${percentage}%`;
}

// Nueva función para obtener el ancho de la barra (máximo 100%)
function getProgressBarWidth(percentage: number): string {
  return `${Math.min(percentage, 100)}%`;
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
    // Extraer el número del porcentaje y limitar a 100%
    const percentageNumber = parseInt(percentage.replace('%', ''));
    return getProgressBarWidth(percentageNumber);
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
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.ventas.value, metricsData.metrics.ventas.target))}
        showProgressBar={metricsData.metrics.ventas.showProgressBar}
        breakdown={metricsData.metrics.ventas.breakdown}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'ventas'}
        onToggle={() => handleAccordionToggle('ventas')}
        target={metricsData.metrics.ventas.target}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.recaudo.title}
        value={formatValue(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.target))}
        showProgressBar={metricsData.metrics.recaudo.showProgressBar}
        breakdown={metricsData.metrics.recaudo.breakdown}
        listStyle="bullets"
        isExpanded={expandedAccordion === 'recaudo'}
        onToggle={() => handleAccordionToggle('recaudo')}
        target={metricsData.metrics.recaudo.target}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.inventario.title}
        value={formatValue(metricsData.metrics.inventario.value, metricsData.metrics.inventario.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.inventario.value, metricsData.metrics.inventario.target))}
        showProgressBar={metricsData.metrics.inventario.showProgressBar}
        breakdown={metricsData.metrics.inventario.breakdown}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'inventario'}
        onToggle={() => handleAccordionToggle('inventario')}
        target={metricsData.metrics.inventario.target}
      />
      
      <MetricCard
        title={metricsData.metrics.margen.title}
        value={formatValue(metricsData.metrics.margen.value, metricsData.metrics.margen.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.margen.value, metricsData.metrics.margen.target))}
        showProgressBar={metricsData.metrics.margen.showProgressBar}
      />
      
      <MetricCard
        title={metricsData.metrics.caja.title}
        value={formatValue(metricsData.metrics.caja.value, metricsData.metrics.caja.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.caja.value, metricsData.metrics.caja.target))}
        showProgressBar={metricsData.metrics.caja.showProgressBar}
      />
    </div>
  );
}
