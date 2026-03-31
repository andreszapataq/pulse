'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface MonthPickerProps {
  currentMonth: string;
  displayDate: string;
  isCurrentMonth: boolean;
}

function generateMonthOptions(currentMonth: string) {
  const [year, month] = currentMonth.split('-').map(Number);
  const current = new Date(year, month - 1, 1);
  const start = new Date(2026, 0, 1); // Enero 2026
  const options: { value: string; label: string }[] = [];

  const d = new Date(current);
  while (d >= start) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d
      .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      .replace(/([a-z]+)( \d{4})/, '$1.$2');
    options.push({ value, label });
    d.setMonth(d.getMonth() - 1);
  }

  return options;
}

export default function MonthPicker({ currentMonth, displayDate, isCurrentMonth }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const todayMonth = useRef(currentMonth);
  const months = generateMonthOptions(todayMonth.current);

  const handleSelect = useCallback(
    (month: string) => {
      setIsOpen(false);
      startTransition(() => {
        if (month === todayMonth.current) {
          router.push('/');
        } else {
          router.push(`/?month=${month}`);
        }
      });
    },
    [router]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !isPending && setIsOpen((prev) => !prev)}
        className="text-xs font-normal cursor-pointer flex items-center gap-1"
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <motion.span
                className="text-gray-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {displayDate}
              </motion.span>
              <motion.svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              >
                <path
                  d="M5 1.5a3.5 3.5 0 1 1-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  className="text-gray-400"
                />
              </motion.svg>
            </motion.span>
          ) : (
            <motion.span
              key="date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              {displayDate}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 400, damping: 30 }
            }
            className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xs shadow-sm z-10 max-h-[300px] overflow-y-auto min-w-[140px]"
          >
            {months.map((month) => {
              const isSelected = month.value === currentMonth;
              const isTodayMonth = month.value === todayMonth.current;
              return (
                <button
                  key={month.value}
                  type="button"
                  onClick={() => handleSelect(month.value)}
                  className={`w-full text-left px-4 py-3 text-xs cursor-pointer transition-colors
                    ${isSelected ? 'font-semibold' : 'font-normal'}
                    ${isTodayMonth && !isSelected ? 'text-gray-500' : ''}
                    hover:bg-gray-50 active:bg-gray-100`}
                >
                  {month.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
