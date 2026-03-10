import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

/**
 * TrustShield component to display NGO trust tier and score
 * @param {Object} props - { score, tier }
 */
const TrustShield = ({ score, tier }) => {
  const getTierConfig = (tierName) => {
    const normalized = (tierName || 'NEW').toUpperCase();
    switch (normalized) {
      case 'TRUSTED':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
          label: 'Trusted',
          color: 'text-emerald-700',
          bg: 'bg-emerald-50'
        };
      case 'ESTABLISHED':
        return {
          icon: <Shield className="w-4 h-4 text-teal-500" />,
          label: 'Established',
          color: 'text-teal-700',
          bg: 'bg-teal-50'
        };
      default:
        return {
          icon: <ShieldAlert className="w-4 h-4 text-slate-400" />,
          label: 'New',
          color: 'text-slate-600',
          bg: 'bg-slate-50'
        };
    }
  };

  const config = getTierConfig(tier);

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${config.bg} border border-black/5`}>
      {config.icon}
      <span className={`text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
      <span className="text-[10px] text-slate-400 font-medium border-l border-slate-200 pl-2">
        Score: {score || 0}
      </span>
    </div>
  );
};

export default TrustShield;
