import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';

interface Bus {
  id: string;
  name: string;
  number: string;
}

interface Location {
  name: string;
  time: string;
  address: string;
}

interface Trip {
  id?: string;
  bus_id: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  base_price: number;
  journey_date: string;
  arrival_date: string;
  status: string;
  pickup_points: Location[];
  drop_points: Location[];
}

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: Omit<Trip, 'id' | 'buses'>) => Promise<void>;
  trip?: Trip | null;
  buses: Bus[];
}

const CITIES = ['Hyderabad', 'Bengaluru'];

export const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, onSubmit, trip, buses }) => {
  const [formData, setFormData] = useState<Omit<Trip, 'id' | 'buses'>>({
    bus_id: '',
    from_city: 'Hyderabad',
    to_city: 'Bengaluru',
    departure_time: '',
    arrival_time: '',
    duration: '',
    base_price: 0,
    journey_date: '',
    arrival_date: '',
    status: 'scheduled',
    pickup_points: [],
    drop_points: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        bus_id: trip.bus_id,
        from_city: trip.from_city,
        to_city: trip.to_city,
        departure_time: trip.departure_time,
        arrival_time: trip.arrival_time,
        duration: trip.duration,
        base_price: trip.base_price,
        journey_date: trip.journey_date,
        arrival_date: trip.arrival_date || trip.journey_date,
        status: trip.status,
        pickup_points: trip.pickup_points || [],
        drop_points: trip.drop_points || [],
      });
    } else {
      setFormData({
        bus_id: buses[0]?.id || '',
        from_city: 'Hyderabad',
        to_city: 'Bengaluru',
        departure_time: '',
        arrival_time: '',
        duration: '',
        base_price: 0,
        journey_date: '',
        arrival_date: '',
        status: 'scheduled',
        pickup_points: [],
        drop_points: [],
      });
    }
  }, [trip, buses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addPickupPoint = () => {
    setFormData({
      ...formData,
      pickup_points: [...formData.pickup_points, { name: '', time: '', address: '' }],
    });
  };

  const updatePickupPoint = (index: number, field: keyof Location, value: string) => {
    const updated = [...formData.pickup_points];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, pickup_points: updated });
  };

  const removePickupPoint = (index: number) => {
    setFormData({
      ...formData,
      pickup_points: formData.pickup_points.filter((_, i) => i !== index),
    });
  };

  const addDropPoint = () => {
    setFormData({
      ...formData,
      drop_points: [...formData.drop_points, { name: '', time: '', address: '' }],
    });
  };

  const updateDropPoint = (index: number, field: keyof Location, value: string) => {
    const updated = [...formData.drop_points];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, drop_points: updated });
  };

  const removeDropPoint = (index: number) => {
    setFormData({
      ...formData,
      drop_points: formData.drop_points.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-white">
            {trip ? 'Edit Trip' : 'Add New Trip'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Bus
            </label>
            <select
              value={formData.bus_id}
              onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              required
            >
              <option value="">Select a bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.name} - {bus.number}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                From City
              </label>
              <select
                value={formData.from_city}
                onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                To City
              </label>
              <select
                value={formData.to_city}
                onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              >
                {CITIES.filter((city) => city !== formData.from_city).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departure Date
              </label>
              <input
                type="date"
                value={formData.journey_date}
                onChange={(e) => setFormData({ ...formData, journey_date: e.target.value, arrival_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departure Time
              </label>
              <input
                type="time"
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Arrival Date
              </label>
              <input
                type="date"
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Arrival Time
              </label>
              <input
                type="time"
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Base Price
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g., 1200"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Pickup Points
              </label>
              <button
                type="button"
                onClick={addPickupPoint}
                className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
              >
                <Plus className="w-4 h-4" />
                Add Pickup Point
              </button>
            </div>
            <div className="space-y-3">
              {formData.pickup_points.map((point, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    value={point.name}
                    onChange={(e) => updatePickupPoint(index, 'name', e.target.value)}
                    placeholder="Location name"
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="time"
                    value={point.time}
                    onChange={(e) => updatePickupPoint(index, 'time', e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={point.address}
                      onChange={(e) => updatePickupPoint(index, 'address', e.target.value)}
                      placeholder="Address"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removePickupPoint(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Drop Points
              </label>
              <button
                type="button"
                onClick={addDropPoint}
                className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
              >
                <Plus className="w-4 h-4" />
                Add Drop Point
              </button>
            </div>
            <div className="space-y-3">
              {formData.drop_points.map((point, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    value={point.name}
                    onChange={(e) => updateDropPoint(index, 'name', e.target.value)}
                    placeholder="Location name"
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="time"
                    value={point.time}
                    onChange={(e) => updateDropPoint(index, 'time', e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={point.address}
                      onChange={(e) => updateDropPoint(index, 'address', e.target.value)}
                      placeholder="Address"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeDropPoint(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
