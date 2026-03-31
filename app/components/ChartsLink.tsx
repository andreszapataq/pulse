'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function ChartsLink() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (isPending) return;
    startTransition(() => {
      router.push('/charts');
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute right-0 text-gray-500 cursor-pointer"
      aria-label="Ver gráfico de ventas"
    >
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.svg
            key="loading"
            width="20"
            height="20"
            viewBox="0 0 10 10"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.15 },
              rotate: { duration: 0.8, repeat: Infinity, ease: 'linear' },
            }}
          >
            <path
              d="M5 1.5a3.5 3.5 0 1 1-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="text-gray-400"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M3 21h18" />
            <path d="M7 16l4-8 4 4 5-6" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
