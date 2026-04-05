import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <motion.div
        className="loading-spinner__ring"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      {label && <span className="loading-spinner__label">{label}</span>}
    </div>
  );
}
