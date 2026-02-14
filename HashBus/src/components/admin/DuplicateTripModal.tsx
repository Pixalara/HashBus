import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface DuplicateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dates: string[]) => Promise<void>;
  trip: any;
}

export const DuplicateTripModal: React.FC<DuplicateTripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trip,
}) => {
  const [startDate, setStartDate] = useState('2026-02-15');
  const [endDate, setEndDate] = useState('2026-02-21');
  const [loading, setLoading] = useState(false);

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    
    // ✅ FIX: Parse dates correctly
    const startParts = start.split('-');
    const endParts = end.split('-');
    
    const current = new Date(
      parseInt(startParts[0]),
      parseInt(startParts[1]) - 1,
      parseInt(startParts[2])
    );
    
    const finalDate = new Date(
      parseInt(endParts[0]),
      parseInt(endParts[1]) - 1,
      parseInt(endParts[2])
    );

    while (current <= finalDate) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push(dateStr);
      console.log('📅 Generated date:', dateStr);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dates = generateDateRange(startDate, endDate);
      console.log('🔄 Total dates to create:', dates.length);
      console.log('📅 All dates:', dates);
      
      if (dates.length === 0) {
        alert('Please select a valid date range');
        setLoading(false);
        return;
      }
      
      await onSubmit(dates);
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error duplicating trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dateCount = generateDateRange(startDate, endDate).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Duplicate Trip</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {trip && (
          <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Trip to duplicate:</p>
            <p className="text-lg font-semibold text-white">
              {trip.from_city} → {trip.to_city}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Bus: {trip.buses?.name || 'N/A'} 
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Original Date: {trip.journey_date}
            </p>
            <p className="text-sm text-slate-400">
              Departure: {trip.departure_time} | Arrival: {trip.arrival_time}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              min="2026-02-15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              min={startDate}
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-2">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Arrival dates will be:</p>
                <p>Journey date + 1 day with same timings</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-400">
              This will create <span className="font-bold">{dateCount}</span> trips
            </p>
            <p className="text-xs text-amber-300 mt-1">
              From: {startDate} To: {endDate}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || dateCount === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Duplicating...' : `Duplicate (${dateCount} trips)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};