'use client';

// Estado controlado desde el componente padre
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface BreakdownItem {
  name: string;
  value: number;
  date?: string;
  quantity?: number;
  unitCost?: number;
  unit?: string;
}

// Funciones locales para formatear valores (evitan imports problemáticos)
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

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Función para formatear fecha sin año (ej: "9 sep.")
function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    });
    // Asegurar que termine con punto
    return formatted.endsWith('.') ? formatted : formatted + '.';
  } catch (error) {
    return dateString; // Si falla, devolver el string original
  }
}

interface AccordionMetricCardProps {
  title: string;
  value: string;
  percentage?: string;
  showProgressBar?: boolean;
  breakdown?: BreakdownItem[];
  unit?: string;
  listStyle?: 'numbers' | 'bullets';
  isExpanded?: boolean;
  onToggle?: () => void;
  target?: number;
}

export default function AccordionMetricCard({ 
  title, 
  value, 
  percentage, 
  showProgressBar = false, 
  breakdown,
  unit,
  listStyle = 'numbers',
  isExpanded = false,
  onToggle,
  target
}: AccordionMetricCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [revealedQuantities, setRevealedQuantities] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isExpanded) {
      setRevealedQuantities({});
    }
  }, [isExpanded]);

  const getProgressWidth = () => {
    if (!percentage) return '0%';
    // Extraer el número del porcentaje y limitar a 100%
    const percentageNumber = parseInt(percentage.replace(/[+%]/g, ''));
    return `${Math.min(percentageNumber, 100)}%`;
  };

  const breakdownItems = breakdown ?? [];
  const hasBreakdown = breakdownItems.length > 0;
  const hasDetails = target !== undefined || hasBreakdown;

  const handleBreakdownToggle = (index: number) => {
    setRevealedQuantities((currentState) => ({
      ...currentState,
      [index]: !currentState[index],
    }));
  };

  return (
    <motion.div layout className="mb-10">
      <div 
        className={`${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && onToggle && onToggle()}
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

      {/* Details section */}
      {hasDetails && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="details"
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0, y: -4 }}
              animate={shouldReduceMotion ? { height: 'auto', opacity: 1, y: 0 } : { height: 'auto', opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0, y: -4 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.01 }
                  : { type: 'spring', stiffness: 320, damping: 30, mass: 0.55 }
              }
              className="overflow-hidden"
            >
              <div className="mt-4 text-xs">
                {target !== undefined && (
                  <div className="mb-2 text-sm">
                    🏁 Meta: {formatValue(target, unit)}
                  </div>
                )}
                {hasBreakdown &&
                  breakdownItems.map((item, index) => (
                    <div key={index} className="py-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-700">
                          {listStyle === 'bullets' ? '•' : `${index + 1}.`} {item.date ? `${formatDateShort(item.date)} ` : ''}{item.name}:
                        </span>
                        {item.quantity !== undefined ? (
                          <button
                            type="button"
                            onClick={() => handleBreakdownToggle(index)}
                            className="min-w-[92px] font-medium cursor-pointer text-right underline decoration-gray-300 underline-offset-3"
                            aria-pressed={Boolean(revealedQuantities[index])}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span
                                key={revealedQuantities[index] ? 'quantity' : 'value'}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0.01 }
                                    : { duration: 0.18, ease: 'easeOut' }
                                }
                                className="inline-block"
                              >
                                {revealedQuantities[index]
                                  ? `${formatNumber(item.quantity)} und.`
                                  : formatValue(item.value, item.unit ?? unit)}
                              </motion.span>
                            </AnimatePresence>
                          </button>
                        ) : (
                          <span className="font-medium">
                            {formatValue(item.value, item.unit ?? unit)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
