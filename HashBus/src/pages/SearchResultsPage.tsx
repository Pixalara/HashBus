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
  const [showFilters, setShowFilters] = useState(false);

  const filteredBuses = buses.filter((bus) => {
    if (coachTypeFilter !== 'all' && bus.coachType !== coachTypeFilter) return false;
    return true;
  });

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
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Coach Type
                </label>
                <div className="space-y-2">
                  {['all', 'Volvo', 'Bharat Benz'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="coachType"
                        checked={coachTypeFilter === type}
                        onChange={() => setCoachTypeFilter(type)}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        {type === 'all' ? 'All Coaches' : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
