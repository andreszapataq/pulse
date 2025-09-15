'use client';

import { useState } from 'react';

interface BreakdownItem {
  name: string;
  value: number;
}

// Función local para formatear moneda (evita imports problemáticos)
function formatCurrency(value: number): string {
  const numberFormatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${numberFormatted}`;
}

interface AccordionMetricCardProps {
  title: string;
  value: string;
  percentage?: string;
  showProgressBar?: boolean;
  breakdown?: BreakdownItem[];
}

export default function AccordionMetricCard({ 
  title, 
  value, 
  percentage, 
  showProgressBar = false, 
  breakdown 
}: AccordionMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProgressWidth = () => {
    if (!percentage) return '0%';
    return percentage;
  };

  const hasBreakdown = breakdown && breakdown.length > 0;

  return (
    <div className="mb-10">
      <div 
        className={`${hasBreakdown ? 'cursor-pointer' : ''}`}
        onClick={() => hasBreakdown && setIsExpanded(!isExpanded)}
      >
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

      {/* Breakdown section */}
      {hasBreakdown && (
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mt-4 text-xs">
            <div className="mb-2">
              🏁 {formatCurrency(breakdown.reduce((sum, item) => sum + item.value, 0))}
            </div>
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="text-gray-700">
                  {index + 1}. {item.name}:
                </span>
                <span className="font-medium">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
