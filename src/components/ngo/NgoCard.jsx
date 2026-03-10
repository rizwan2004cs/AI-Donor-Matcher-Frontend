import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';
import TrustShield from '../ui/TrustShield';
import { formatDistance } from '../../utils/distance';
import { CATEGORY_COLORS } from '../../utils/categoryColors';

/**
 * NGO Card component for the list view
 */
const NgoCard = ({ ngo, onClick }) => {
  const urgencyVariant = ngo.topNeedUrgency === 'HIGH' || ngo.topNeedUrgency === 'URGENT' ? 'high' : 
                         ngo.topNeedUrgency === 'MEDIUM' ? 'medium' : 'low';

  return (
    <div 
      onClick={() => onClick(ngo.id)}
      className="glass group p-4 rounded-2xl cursor-pointer hover:bg-white/50 transition-all duration-300 border border-white/20 mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
          {ngo.name}
        </h3>
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-white/50 px-1.5 py-0.5 rounded-md">
          <MapPin className="w-3 h-3" />
          {formatDistance(ngo.distanceKm)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <TrustShield score={ngo.trustScore} tier={ngo.trustTier} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: CATEGORY_COLORS[ngo.topNeedCategory] || '#64748b' }}
            />
            <span className="font-medium">{ngo.topNeedItem}</span>
          </div>
          <Badge variant={urgencyVariant}>{ngo.topNeedUrgency}</Badge>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-teal-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (ngo.topNeedQuantityPledged / ngo.topNeedQuantityRequired) * 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span>{ngo.topNeedQuantityRemaining} items remaining</span>
          <div className="flex items-center gap-1 text-teal-600 font-bold group-hover:translate-x-1 transition-transform">
            Details <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoCard;
