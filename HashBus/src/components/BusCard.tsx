import React from 'react';
import { Bus, Clock, Star, Wifi, Zap, Coffee, Users } from 'lucide-react';
import { Bus as BusType } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Button } from './Button';

interface BusCardProps {
  bus: BusType;
  onSelect: () => void;
}

export const BusCard: React.FC<BusCardProps> = ({ bus, onSelect }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-amber-500/50 transition-all duration-300 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{bus.name}</h3>
                  {bus.coachType === 'Volvo' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Bus className="w-4 h-4" />
                  <span>{bus.coachType}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-green-500 fill-green-500" />
                <span className="text-green-400 font-semibold text-sm">{bus.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">Departure</p>
                <p className="text-2xl font-bold text-white">{formatTime(bus.departureTime)}</p>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-slate-700">
                <Clock className="w-4 h-4 text-amber-500 mb-1" />
                <p className="text-slate-300 text-sm font-medium">{bus.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Arrival</p>
                <p className="text-2xl font-bold text-white">{formatTime(bus.arrivalTime)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {bus.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 rounded-lg text-slate-300 text-xs"
                >
                  {amenity === 'WiFi' && <Wifi className="w-3.5 h-3.5 text-amber-500" />}
                  {amenity === 'Charging Point' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  {amenity.includes('Snack') && <Coffee className="w-3.5 h-3.5 text-amber-500" />}
                  {amenity}
                </span>
              ))}
              {bus.amenities.length > 4 && (
                <span className="px-3 py-1.5 bg-slate-900/50 rounded-lg text-slate-400 text-xs">
                  +{bus.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className="lg:border-l lg:border-slate-700 lg:pl-8 flex flex-col items-start lg:items-end gap-4">
            <div className="text-left lg:text-right">
              <p className="text-slate-400 text-sm mb-1">Starting from</p>
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(bus.basePrice)}</p>
              <p className="text-slate-400 text-xs">per person</p>
            </div>

            {/* ✅ FIXED: Show total and available seats */}
            <div className="space-y-2 w-full lg:w-auto">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium">Total Seats</p>
                  <p className="text-white font-bold text-lg">{bus.totalSeats}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Available</p>
                  <p className={`font-bold text-lg ${bus.availableSeats > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {bus.availableSeats}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSelect} 
              className="w-full lg:w-auto px-8"
              disabled={bus.availableSeats === 0}
            >
              {bus.availableSeats > 0 ? 'Select Seats' : 'No Seats Available'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};