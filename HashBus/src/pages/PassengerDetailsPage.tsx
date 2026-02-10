import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Bus, Seat, Passenger } from '../types';
import { BookingSummary } from '../components/BookingSummary';
import { Button } from '../components/Button';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface PassengerDetailsPageProps {
  bus: Bus;
  selectedSeats: Seat[];
  onContinue: (passenger: Passenger) => void;
  onBack: () => void;
  searchParams: { from: string; to: string; date: string };
}

export const PassengerDetailsPage: React.FC<PassengerDetailsPageProps> = ({
  bus,
  selectedSeats,
  onContinue,
  onBack,
  searchParams,
}) => {
  const { pickupPoint, dropPoint } = useBooking();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          age: '',
          gender: data.gender || 'Male',
          mobile: data.phone || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Valid age is required';
    }

    if (!formData.mobile.match(/^[0-9]{10}$/)) {
      newErrors.mobile = 'Valid 10-digit mobile number is required';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Valid email address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onContinue({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        mobile: formData.mobile,
        email: formData.email,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Seats
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Passenger Details</h1>
          <p className="text-slate-400">Enter your information to complete the booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                      errors.name ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full px-4 py-3.5 bg-slate-900 border ${
                      errors.age ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                    placeholder="Enter age"
                  />
                  {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                      errors.mobile ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-sm text-red-400">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                      errors.email ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full">
                  Proceed to Payment
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <BookingSummary
              bus={bus}
              selectedSeats={selectedSeats}
              journeyDate={searchParams.date}
              from={searchParams.from}
              to={searchParams.to}
              pickupPoint={pickupPoint || undefined}
              dropPoint={dropPoint || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
