import React, { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Location } from '../types';
import { Button } from '../components/Button';

interface PickupDropPageProps {
  from: string;
  to: string;
  onContinue: (pickupPoint: Location, dropPoint: Location) => void;
  onBack: () => void;
}

const locationData: Record<string, Location[]> = {
  Bengaluru: [
    { id: 'blr-majestic', name: 'Majestic', city: 'Bengaluru' },
    { id: 'blr-madiwala', name: 'Madiwala', city: 'Bengaluru' },
    { id: 'blr-silk-board', name: 'Silk Board', city: 'Bengaluru' },
    { id: 'blr-electronic-city', name: 'Electronic City', city: 'Bengaluru' },
    { id: 'blr-hebbal', name: 'Hebbal', city: 'Bengaluru' },
  ],
  Hyderabad: [
    { id: 'hyd-ameerpet', name: 'Ameerpet', city: 'Hyderabad' },
    { id: 'hyd-kukatpally', name: 'Kukatpally', city: 'Hyderabad' },
    { id: 'hyd-miyapur', name: 'Miyapur', city: 'Hyderabad' },
    { id: 'hyd-gachibowli', name: 'Gachibowli', city: 'Hyderabad' },
    { id: 'hyd-lb-nagar', name: 'LB Nagar', city: 'Hyderabad' },
  ],
};

export const PickupDropPage: React.FC<PickupDropPageProps> = ({
  from,
  to,
  onContinue,
  onBack,
}) => {
  const [selectedPickup, setSelectedPickup] = useState<Location | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<Location | null>(null);

  const pickupLocations = locationData[from] || [];
  const dropLocations = locationData[to] || [];

  const handleContinue = () => {
    if (selectedPickup && selectedDrop) {
      onContinue(selectedPickup, selectedDrop);
    }
  };

  const LocationCard = ({
    location,
    isSelected,
    onSelect,
  }: {
    location: Location;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-400 shadow-lg shadow-amber-500/20'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-5 h-5 text-slate-400" />
          <span className="text-white font-medium text-lg">{location.name}</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Results
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Select Pickup & Drop Point
          </h1>
          <p className="text-slate-400">
            Choose your boarding and deboarding locations
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Pickup Point - {from}
            </h2>
            <div className="space-y-3">
              {pickupLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isSelected={selectedPickup?.id === location.id}
                  onSelect={() => setSelectedPickup(location)}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Drop Point - {to}
            </h2>
            <div className="space-y-3">
              {dropLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isSelected={selectedDrop?.id === location.id}
                  onSelect={() => setSelectedDrop(location)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 sticky bottom-4 sm:relative sm:bottom-0">
          <Button
            onClick={handleContinue}
            disabled={!selectedPickup || !selectedDrop}
            className="w-full"
            size="lg"
          >
            Continue to Seat Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
