import { useState, useEffect } from 'react';
import { User, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
}

interface Booking {
  id: string;
  booking_reference: string;
  passenger_name: string;
  seats: string[];
  pickup_point: string;
  drop_point: string;
  total_amount: number;
  journey_date: string;
  payment_status: string;
  bus_number?: string;
  from_city?: string;
  to_city?: string;
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    phone: '',
    email: user?.email || '',
    gender: 'Male',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          name: data.name,
          phone: data.phone,
          email: data.email,
          gender: data.gender,
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          buses (bus_number),
          trips (source, destination)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBookings = data?.map((booking: any) => ({
        id: booking.id,
        booking_reference: booking.booking_reference,
        passenger_name: booking.passenger_name,
        seats: booking.seats,
        pickup_point: booking.pickup_point,
        drop_point: booking.drop_point,
        total_amount: booking.total_amount,
        journey_date: booking.journey_date,
        payment_status: booking.payment_status,
        bus_number: booking.buses?.bus_number,
        from_city: booking.trips?.source,
        to_city: booking.trips?.destination,
      })) || [];

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.phone || !profile.email) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          gender: profile.gender,
        });

      if (error) throw error;

      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-white">My Dashboard</h1>

        {/* Tabs */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={20} />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar size={20} />
                My Bookings
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Booking History</h2>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400 mb-2">No bookings yet</p>
                  <p className="text-sm text-slate-500">Your ticket history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg text-white">
                            {booking.from_city} → {booking.to_city}
                          </p>
                          <p className="text-sm text-slate-400">
                            Booking Reference: <span className="font-medium text-amber-500">{booking.booking_reference}</span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.payment_status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : booking.payment_status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Bus Number</p>
                          <p className="font-medium text-slate-200">{booking.bus_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Journey Date</p>
                          <p className="font-medium text-slate-200">{new Date(booking.journey_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Seats</p>
                          <p className="font-medium text-slate-200">{booking.seats.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Total Amount</p>
                          <p className="font-medium text-amber-500">₹{booking.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Pickup Point</p>
                          <p className="font-medium text-slate-200">{booking.pickup_point}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Drop Point</p>
                          <p className="font-medium text-slate-200">{booking.drop_point}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}