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
    const formatted = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
    return `${formatted}%`;
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
        unit={metricsData.metrics.ventas.unit}
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
        unit={metricsData.metrics.recaudo.unit}
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
        unit={metricsData.metrics.inventario.unit}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'inventario'}
        onToggle={() => handleAccordionToggle('inventario')}
        target={metricsData.metrics.inventario.target}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.margen.title}
        value={formatValue(metricsData.metrics.margen.value, metricsData.metrics.margen.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.margen.value, metricsData.metrics.margen.target))}
        showProgressBar={metricsData.metrics.margen.showProgressBar}
        breakdown={metricsData.metrics.margen.breakdown}
        unit={metricsData.metrics.margen.unit}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'margen'}
        onToggle={() => handleAccordionToggle('margen')}
        target={metricsData.metrics.margen.target}
      />
      
      <AccordionMetricCard
        title={metricsData.metrics.caja.title}
        value={formatValue(metricsData.metrics.caja.value, metricsData.metrics.caja.unit)}
        percentage={formatPercentageDisplay(calculatePercentage(metricsData.metrics.caja.value, metricsData.metrics.caja.target))}
        showProgressBar={metricsData.metrics.caja.showProgressBar}
        breakdown={metricsData.metrics.caja.breakdown}
        unit={metricsData.metrics.caja.unit}
        listStyle="numbers"
        isExpanded={expandedAccordion === 'caja'}
        onToggle={() => handleAccordionToggle('caja')}
        target={metricsData.metrics.caja.target}
      />
    </div>
  );
}
