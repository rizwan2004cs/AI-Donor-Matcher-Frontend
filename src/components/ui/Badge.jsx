import React from 'react';

/**
 * Reusable Badge component for urgency and status
 */
const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-amber-100 text-amber-600',
    low: 'bg-emerald-100 text-emerald-600',
    info: 'bg-teal-100 text-teal-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  const currentVariant = variants[variant.toLowerCase()] || variants.info;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentVariant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
