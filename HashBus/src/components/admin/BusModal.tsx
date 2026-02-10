import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';

interface Bus {
  id?: string;
  name: string;
  number: string;
  coach_type: string;
  total_seats: number;
  amenities: string[];
}

interface BusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bus: Bus) => Promise<void>;
  bus?: Bus | null;
}

export const BusModal: React.FC<BusModalProps> = ({ isOpen, onClose, onSubmit, bus }) => {
  const [formData, setFormData] = useState<Bus>({
    name: '',
    number: '',
    coach_type: 'Luxury Sleeper',
    total_seats: 40,
    amenities: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bus) {
      setFormData(bus);
    } else {
      setFormData({
        name: '',
        number: '',
        coach_type: 'Luxury Sleeper',
        total_seats: 40,
        amenities: [],
      });
    }
  }, [bus, isOpen]);

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

  const amenitiesList = [
    'WiFi',
    'AC',
    'Charging Point',
    'Reading Light',
    'Water Bottle',
    'Blanket',
    'TV',
    'GPS',
  ];

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {bus ? 'Edit Bus' : 'Add New Bus'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bus Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g., Volvo Multi-Axle"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bus Number
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                placeholder="e.g., HR55AB1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Coach Type
              </label>
              <select
                value={formData.coach_type}
                onChange={(e) => setFormData({ ...formData, coach_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Luxury Sleeper">Luxury Sleeper</option>
                <option value="Semi Sleeper">Semi Sleeper</option>
                <option value="Seater">Seater</option>
                <option value="AC Sleeper">AC Sleeper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                value={formData.total_seats}
                onChange={(e) =>
                  setFormData({ ...formData, total_seats: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                min="20"
                max="60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-amber-500'
                  }`}
                >
                  {amenity}
                </button>
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
              {loading ? 'Saving...' : bus ? 'Update Bus' : 'Create Bus'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
