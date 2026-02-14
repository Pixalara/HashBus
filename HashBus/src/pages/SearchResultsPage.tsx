import React, { useState } from 'react';
import { Filter, ArrowLeft } from 'lucide-react';
import { Bus } from '../types';
import { BusCard } from '../components/BusCard';
import { Button } from '../components/Button';
import { formatDate } from '../utils/formatters';

interface SearchResultsPageProps {
  buses: Bus[];
  searchParams: { from: string; to: string; date: string };
  onSelectBus: (bus: Bus) => void;
  onBack: () => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  buses,
  searchParams,
  onSelectBus,
  onBack,
}) => {
  const [coachTypeFilter, setCoachTypeFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBuses = buses.filter((bus) => {
    // Filter by coach type
    if (coachTypeFilter !== 'all' && bus.coachType !== coachTypeFilter) return false;
    
    // Filter by price range
    if (priceFilter !== 'all') {
      const price = bus.basePrice;
      switch (priceFilter) {
        case 'under-2000':
          if (price >= 2000) return false;
          break;
        case '2000-3000':
          if (price < 2000 || price >= 3000) return false;
          break;
        case 'above-3000':
          if (price < 3000) return false;
          break;
      }
    }
    
    return true;
  });

  // Get unique coach types from buses
  const coachTypes = Array.from(new Set(buses.map(bus => bus.coachType)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {searchParams.from} → {searchParams.to}
              </h1>
              <p className="text-slate-400">
                {formatDate(searchParams.date)} • {filteredBuses.length} bus
                {filteredBuses.length !== 1 ? 'es' : ''} available
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-700 space-y-6">
              {/* Coach Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Coach Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="coachType"
                      checked={coachTypeFilter === 'all'}
                      onChange={() => setCoachTypeFilter('all')}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      All Coaches
                    </span>
                  </label>
                  {coachTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="coachType"
                        checked={coachTypeFilter === type}
                        onChange={() => setCoachTypeFilter(type)}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Price Range
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === 'all'}
                      onChange={() => setPriceFilter('all')}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      All Prices
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === 'under-2000'}
                      onChange={() => setPriceFilter('under-2000')}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      Under ₹2,000
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === '2000-3000'}
                      onChange={() => setPriceFilter('2000-3000')}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      ₹2,000 - ₹3,000
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === 'above-3000'}
                      onChange={() => setPriceFilter('above-3000')}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      Above ₹3,000
                    </span>
                  </label>
                </div>
              </div>

              {/* Reset Filters Button */}
              <div>
                <Button
                  onClick={() => {
                    setCoachTypeFilter('all');
                    setPriceFilter('all');
                  }}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bus Results */}
        <div className="space-y-6">
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} onSelect={() => onSelectBus(bus)} />
            ))
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-lg">
                No buses found matching your filters. Try adjusting your selection.
              </p>
              <Button
                onClick={() => {
                  setCoachTypeFilter('all');
                  setPriceFilter('all');
                }}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};