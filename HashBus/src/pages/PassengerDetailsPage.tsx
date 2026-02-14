import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Users } from 'lucide-react';
import { Bus, Seat, Passenger } from '../types';
import { BookingSummary } from '../components/BookingSummary';
import { Button } from '../components/Button';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface PassengerDetailsPageProps {
  bus: Bus;
  selectedSeats: Seat[];
  onContinue: (passengers: Passenger | Passenger[]) => void;
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

  // Initialize passengers array based on number of selected seats
  const [passengers, setPassengers] = useState<Passenger[]>(
    selectedSeats.map(() => ({
      name: '',
      age: 0,
      gender: 'Male' as 'Male' | 'Female' | 'Other',
      mobile: '',
      email: '',
    }))
  );

  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && selectedSeats.length > 0) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const updatedPassengers = [...passengers];
        updatedPassengers[0] = {
          name: data.full_name || '',
          age: 0,
          gender: data.gender || 'Male',
          mobile: data.phone || '',
          email: data.email || '',
        };
        setPassengers(updatedPassengers);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};

    passengers.forEach((passenger, index) => {
      const passengerErrors: Record<string, string> = {};

      if (!passenger.name.trim()) {
        passengerErrors.name = 'Name is required';
      }

      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        passengerErrors.age = 'Valid age is required';
      }

      if (!passenger.mobile.match(/^[0-9]{10}$/)) {
        passengerErrors.mobile = 'Valid 10-digit mobile number is required';
      }

      if (!passenger.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        passengerErrors.email = 'Valid email address is required';
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: any
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: field === 'age' ? (parseInt(value) || 0) : value,
    };
    setPassengers(updatedPassengers);

    if (errors[index]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
        setErrors(updatedErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submitting passenger form...');
    console.log('Number of passengers:', passengers.length);

    if (validateForm()) {
      console.log('✅ Validation passed');
      setIsSubmitting(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('✅ Calling onContinue with passengers');
        
        // ✅ KEY FIX: Check if single or multiple passengers
        if (selectedSeats.length === 1) {
          // Single passenger - pass just one passenger
          console.log('📌 Single passenger mode');
          onContinue(passengers[0]);
        } else {
          // Multiple passengers - pass array
          console.log('📌 Multiple passengers mode');
          onContinue(passengers);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('❌ Validation failed');
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
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Passenger Details</h1>
              <p className="text-slate-400">
                Enter information for all {selectedSeats.length} passenger{selectedSeats.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white">Passenger {index + 1}</h3>
                    <span className="ml-auto text-amber-500 text-sm font-medium">
                      Seat {selectedSeats[index]?.number}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, 'name', e.target.value)
                        }
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                          errors[index]?.name ? 'border-red-500' : 'border-slate-700'
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {errors[index]?.name && (
                      <p className="mt-1 text-sm text-red-400">{errors[index].name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={passenger.age || ''}
                        onChange={(e) =>
                          handlePassengerChange(index, 'age', e.target.value)
                        }
                        className={`w-full px-4 py-3.5 bg-slate-900 border ${
                          errors[index]?.age ? 'border-red-500' : 'border-slate-700'
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                        placeholder="Enter age"
                      />
                      {errors[index]?.age && (
                        <p className="mt-1 text-sm text-red-400">{errors[index].age}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            'gender',
                            e.target.value as 'Male' | 'Female' | 'Other'
                          )
                        }
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
                        value={passenger.mobile}
                        onChange={(e) =>
                          handlePassengerChange(index, 'mobile', e.target.value)
                        }
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                          errors[index]?.mobile ? 'border-red-500' : 'border-slate-700'
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                    {errors[index]?.mobile && (
                      <p className="mt-1 text-sm text-red-400">{errors[index].mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) =>
                          handlePassengerChange(index, 'email', e.target.value)
                        }
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${
                          errors[index]?.email ? 'border-red-500' : 'border-slate-700'
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors[index]?.email && (
                      <p className="mt-1 text-sm text-red-400">{errors[index].email}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={onBack}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Back to Seats
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
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
              pickupPoint={pickupPoint?.name || undefined}
              dropPoint={dropPoint?.name || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};