'use client';

import { motion } from 'framer-motion';

interface PageDecorProps {
  variant?: 'runner' | 'walker' | 'car';
}

export function PageDecor({ variant = 'runner' }: PageDecorProps) {
  if (variant === 'runner') {
    return (
      <motion.div
        className="fixed bottom-8 right-8 opacity-10 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2" className="fill-primary" />
          <path
            d="M13 7L11 8L8 9L9 12L7 15L9 16L11 14L13 15V18L11 20L13 21L16 19L18 16L16 14L15 11L17 9L15 7H13Z"
            className="fill-primary"
          />
        </svg>
      </motion.div>
    );
  }

  if (variant === 'walker') {
    return (
      <motion.div
        className="fixed bottom-8 left-8 opacity-10 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2" className="fill-accent" />
          <path
            d="M11 7V9L9 10V14L11 15V19L9 21H11L13 19V15L15 14V10L13 9V7H11Z"
            className="fill-accent"
          />
        </svg>
      </motion.div>
    );
  }

  if (variant === 'car') {
    return (
      <motion.div
        className="fixed top-32 right-16 opacity-10 pointer-events-none"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 0.1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 11L6.5 6.5H17.5L19 11M5 11V16H19V11M5 11H19M7 16V17.5M17 16V17.5"
            className="stroke-secondary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="14" r="1.5" className="fill-secondary" />
          <circle cx="17" cy="14" r="1.5" className="fill-secondary" />
        </svg>
      </motion.div>
    );
  }

  return null;
}
