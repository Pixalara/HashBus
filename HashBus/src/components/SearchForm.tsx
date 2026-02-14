import React, { useState } from 'react';
import { ArrowRightLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from './Button';
import { cities } from '../data/mockData';

interface SearchFormProps {
  onSearch: (from: string, to: string, date: string) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [from, setFrom] = useState(cities[0].name);
  const [to, setTo] = useState(cities[1].name);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(from, to, date);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      {/* Premium glass-morphism container with blend effects */}
      <div className="relative group">
        {/* Gradient blur background for premium effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/5 via-orange-500/3 to-amber-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
        
        {/* Main container - TRANSPARENT WITH LIGHT BACKDROP */}
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-8 overflow-hidden hover:bg-white/8 transition-all duration-300">
          {/* Minimal gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent pointer-events-none rounded-2xl"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            {/* From, Swap, To Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* From Input */}
              <div className="relative group/input">
                <label className="block text-sm font-semibold text-white mb-3 drop-shadow-md">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 z-10" />
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/60 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-slate-800/70 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/70 hover:border-white/30 group-hover/input:shadow-lg group-hover/input:shadow-amber-500/20 placeholder-white/50"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.name} className="bg-slate-900 text-white">
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {/* Input glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-focus-within/input:from-amber-500/10 group-focus-within/input:via-transparent group-focus-within/input:to-amber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="relative flex items-end justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 rounded-full text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-500/40 hover:scale-110 active:scale-95 border border-amber-400/40 backdrop-blur-sm group/btn"
                >
                  <ArrowRightLeft className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* To Input */}
              <div className="relative group/input">
                <label className="block text-sm font-semibold text-white mb-3 drop-shadow-md">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 z-10" />
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/60 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-slate-800/70 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/70 hover:border-white/30 group-hover/input:shadow-lg group-hover/input:shadow-amber-500/20 placeholder-white/50"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.name} className="bg-slate-900 text-white">
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {/* Input glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-focus-within/input:from-amber-500/10 group-focus-within/input:via-transparent group-focus-within/input:to-amber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Date and Search Button Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {/* Date Input */}
              <div className="relative group/input">
                <label className="block text-sm font-semibold text-white mb-3 drop-shadow-md">
                  Journey Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 z-10" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/60 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-slate-800/70 transition-all duration-300 hover:bg-slate-800/70 hover:border-white/30 group-hover/input:shadow-lg group-hover/input:shadow-amber-500/20 placeholder-white/50"
                  />
                  {/* Input glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-focus-within/input:from-amber-500/10 group-focus-within/input:via-transparent group-focus-within/input:to-amber-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Search Button */}
              <div className="relative group/btn h-full flex items-end">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="relative w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-amber-500/30 border border-amber-400/40 transition-all duration-300 group-hover/btn:border-amber-300 py-4"
                >
                  Search Buses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated styles */}
      <style>{`
        /* Custom select styling */
        select::-webkit-scrollbar {
          width: 8px;
        }

        select::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        select::-webkit-scrollbar-thumb {
          background: rgba(217, 119, 6, 0.5);
          border-radius: 4px;
        }

        select::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 119, 6, 0.8);
        }

        /* Smooth transitions */
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.8) brightness(1.2);
        }

        /* Focus glow animation */
        @keyframes focusGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(251, 146, 60, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(251, 146, 60, 0);
          }
        }
      `}</style>
    </form>
  );
};