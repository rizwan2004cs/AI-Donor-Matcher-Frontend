import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createCategoryIcon } from '../CategoryPin';
import TrustShield from '../ui/TrustShield';
import { formatDistance } from '../../utils/distance';

/**
 * Custom NGO marker for Leaflet map
 */
const MapMarker = ({ ngo, onDetailsClick }) => {
  if (!ngo.lat || !ngo.lng) return null;

  return (
    <Marker 
      position={[ngo.lat, ngo.lng]} 
      icon={createCategoryIcon(ngo.topNeedCategory)}
    >
      <Popup className="custom-popup">
        <div className="p-1 min-w-[200px]">
          <h4 className="font-bold text-slate-800 text-sm mb-1">{ngo.name}</h4>
          
          <div className="flex items-center gap-2 mb-2 scale-90 origin-left">
            <TrustShield score={ngo.trustScore} tier={ngo.trustTier} />
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-medium">📍 {formatDistance(ngo.distanceKm)}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-0.5">Top Need</p>
              <p className="text-xs font-semibold text-slate-700 underline decoration-teal-400 underline-offset-2">
                {ngo.topNeedItem}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDetailsClick(ngo.id)}
            className="w-full py-1.5 bg-teal-600 text-white text-[11px] font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            Open Profile
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
