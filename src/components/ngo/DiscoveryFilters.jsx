import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Map } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../../utils/categoryColors';

/**
 * Filters component for NGO Discovery
 */
const DiscoveryFilters = ({ filters, setFilters }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  return (
    <div className="glass-subtle p-4 rounded-2xl space-y-4 border border-white/30 mb-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by NGO name or keyword..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Category
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none text-sm appearance-none"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Radius Filter */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Search Radius
            </label>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md">
              {filters.radius} km
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Map className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={filters.radius}
              onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="flex-1 accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryFilters;
