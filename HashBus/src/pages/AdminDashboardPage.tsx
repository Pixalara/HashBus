import React, { useState, useEffect } from 'react';
import { Shield, Bus, Calendar, Tag, Users, TrendingUp, Edit, Trash2, Plus, ArrowLeft, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { BusModal } from '../components/admin/BusModal';
import { TripModal } from '../components/admin/TripModal';
import { PromoModal } from '../components/admin/PromoModal';
import { DuplicateTripModal } from '../components/admin/DuplicateTripModal';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { supabase } from '../lib/supabase';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const {
    buses,
    trips,
    promos,
    bookings,
    stats,
    loading,
    createBus,
    updateBus,
    deleteBus,
    createTrip,
    updateTrip,
    deleteTrip,
    createPromo,
    updatePromo,
    deletePromo,
    refreshAll,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'buses' | 'trips' | 'promos' | 'bookings'>('buses');
  const [busModalOpen, setBusModalOpen] = useState(false);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [duplicateTripModalOpen, setDuplicateTripModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [selectedTripForDuplicate, setSelectedTripForDuplicate] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Check user authorization on component mount
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setAuthLoading(true);

        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log('❌ No authenticated user found');
          setIsAuthorized(false);
          onNavigate('home');
          return;
        }

        // Get user profile with role
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !userProfile) {
          console.log('❌ User profile not found');
          setIsAuthorized(false);
          onNavigate('home');
          return;
        }

        const role = userProfile.role;
        setUserRole(role);

        // ✅ Allow both 'admin' AND 'super_admin' roles
        if (role === 'admin' || role === 'super_admin') {
          console.log(`✅ Authorization granted for role: ${role}`);
          setIsAuthorized(true);
        } else {
          console.log(`❌ Access denied for role: ${role}`);
          setIsAuthorized(false);
          onNavigate('home');
        }
      } catch (error) {
        console.error('❌ Authorization check error:', error);
        setIsAuthorized(false);
        onNavigate('home');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthorization();
  }, [onNavigate]);

  useEffect(() => {
    if (isAuthorized) {
      console.log('📊 Admin Dashboard Loaded:', {
        buses: buses.length,
        trips: trips.length,
        promos: promos.length,
        bookings: bookings.length,
        stats,
        userRole,
      });
    }
  }, [buses, trips, promos, bookings, stats, userRole, isAuthorized]);

  // ✅ Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Shield className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Access</h1>
          <p className="text-slate-400">Please wait...</p>
        </div>
      </div>
    );
  }

  // ✅ Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
          <p className="text-slate-500 text-sm mt-2">Required role: Admin or Super Admin</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onNavigate('home');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const statsData = [
    {
      label: 'Total Buses',
      value: stats.totalBuses.toString(),
      icon: Bus,
      color: 'text-blue-500',
    },
    {
      label: 'Active Trips',
      value: stats.activeTrips.toString(),
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: Users,
      color: 'text-amber-500',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.revenue),
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  const tabs = [
    { id: 'buses' as const, label: 'Buses', icon: Bus },
    { id: 'trips' as const, label: 'Trips', icon: Calendar },
    { id: 'promos' as const, label: 'Promo Codes', icon: Tag },
    { id: 'bookings' as const, label: 'Bookings', icon: Users },
  ];

  const handleEditBus = (bus: any) => {
    setSelectedBus(bus);
    setBusModalOpen(true);
  };

  const handleDeleteBus = async (busId: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await deleteBus(busId);
        await refreshAll();
      } catch (error) {
        console.error('❌ Delete bus failed:', error);
      }
    }
  };

  const handleEditTrip = (trip: any) => {
    setSelectedTrip(trip);
    setTripModalOpen(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(tripId);
        await refreshAll();
      } catch (error) {
        console.error('❌ Delete trip failed:', error);
      }
    }
  };

  const handleDuplicateTrip = (trip: any) => {
    setSelectedTripForDuplicate(trip);
    setDuplicateTripModalOpen(true);
  };

  const handleDuplicateSubmit = async (dates: string[]) => {
    if (!selectedTripForDuplicate) return;

    try {
      console.log('🔄 Duplicating trip for dates:', dates);
      console.log('📋 Selected Trip Data:', selectedTripForDuplicate);

      // ✅ FIX: Parse the original departure and arrival times
      const originalDepartureTime = selectedTripForDuplicate.departure_time;
      const originalArrivalTime = selectedTripForDuplicate.arrival_time;

      console.log('⏰ Original times - Departure:', originalDepartureTime, 'Arrival:', originalArrivalTime);

      const createdTrips = await Promise.all(
        dates.map(async (journeyDate) => {
          // ✅ FIX: Calculate next day for arrival
          const arrivalDateObj = new Date(journeyDate);
          arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
          
          const arrivalYear = arrivalDateObj.getFullYear();
          const arrivalMonth = String(arrivalDateObj.getMonth() + 1).padStart(2, '0');
          const arrivalDay = String(arrivalDateObj.getDate()).padStart(2, '0');
          const arrivalDate = `${arrivalYear}-${arrivalMonth}-${arrivalDay}`;

          // ✅ FIX: Format datetime with T separator that Supabase expects
          // Extract just the time portion if the original is a full datetime
          let depTime = originalDepartureTime;
          let arrTime = originalArrivalTime;

          // If the original times include datetime (YYYY-MM-DDTHH:MM:SS), extract time
          if (originalDepartureTime.includes('T')) {
            depTime = originalDepartureTime.split('T')[1];
          }
          if (originalArrivalTime.includes('T')) {
            arrTime = originalArrivalTime.split('T')[1];
          }

          const departureDateTime = `${journeyDate}T${depTime}`;
          const arrivalDateTime = `${arrivalDate}T${arrTime}`;

          const tripData = {
            bus_id: selectedTripForDuplicate.bus_id,
            source: selectedTripForDuplicate.source,
            destination: selectedTripForDuplicate.destination,
            from_city: selectedTripForDuplicate.from_city,
            to_city: selectedTripForDuplicate.to_city,
            journey_date: journeyDate, // ✅ Just the date part (YYYY-MM-DD)
            departure_time: departureDateTime, // ✅ Full datetime (YYYY-MM-DDTHH:MM:SS)
            arrival_time: arrivalDateTime, // ✅ Next day with same time
            base_price: selectedTripForDuplicate.base_price,
            pricing: selectedTripForDuplicate.pricing,
            pickup_points: selectedTripForDuplicate.pickup_points,
            drop_points: selectedTripForDuplicate.drop_points,
            status: 'scheduled',
          };

          console.log('📝 Creating trip:', {
            journeyDate,
            arrivalDate,
            departureDateTime,
            arrivalDateTime,
            tripData,
          });

          return await createTrip(tripData);
        })
      );

      console.log('✅ Successfully created', createdTrips.length, 'duplicate trips');
      
      // Show success message
      alert(`✅ Successfully created ${createdTrips.length} trips!\nDates: ${dates.join(', ')}`);
      
      setDuplicateTripModalOpen(false);
      setSelectedTripForDuplicate(null);
      await refreshAll();
    } catch (error) {
      console.error('❌ Duplicate trip failed:', error);
      alert(`❌ Failed to duplicate trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditPromo = (promo: any) => {
    setSelectedPromo(promo);
    setPromoModalOpen(true);
  };

  const handleDeletePromo = async (promoId: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await deletePromo(promoId);
        await refreshAll();
      } catch (error) {
        console.error('❌ Delete promo failed:', error);
      }
    }
  };

  const handleBusSubmit = async (busData: any) => {
    try {
      if (selectedBus) {
        await updateBus(selectedBus.id, busData);
      } else {
        await createBus(busData);
      }
      setBusModalOpen(false);
      setSelectedBus(null);
      await refreshAll();
    } catch (error) {
      console.error('❌ Bus operation failed:', error);
    }
  };

  const handleTripSubmit = async (tripData: any) => {
    try {
      if (selectedTrip) {
        await updateTrip(selectedTrip.id, tripData);
      } else {
        await createTrip(tripData);
      }
      setTripModalOpen(false);
      setSelectedTrip(null);
      await refreshAll();
    } catch (error) {
      console.error('❌ Trip operation failed:', error);
    }
  };

  const handlePromoSubmit = async (promoData: any) => {
    try {
      if (selectedPromo) {
        await updatePromo(selectedPromo.id, promoData);
      } else {
        await createPromo(promoData);
      }
      setPromoModalOpen(false);
      setSelectedPromo(null);
      await refreshAll();
    } catch (error) {
      console.error('❌ Promo operation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Role Badge and Logout */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Manage your HashBus operations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Role</p>
                <p className="text-lg font-bold text-amber-500">
                  {userRole === 'super_admin' ? '��� SUPER ADMIN' : '👤 ADMIN'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="border-b border-slate-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-amber-500 border-b-2 border-amber-500 bg-slate-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'buses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Buses {buses.length > 0 && `(${buses.length})`}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedBus(null);
                      setBusModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Bus
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading buses...</p>
                  </div>
                ) : buses.length === 0 ? (
                  <div className="text-center py-12">
                    <Bus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Buses Yet</h3>
                    <p className="text-slate-400 mb-6">Create your first bus to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buses.map((bus) => (
                      <div
                        key={bus.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{bus.name}</h3>
                            <p className="text-slate-400 text-sm">{bus.number}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBus(bus)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit Bus"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBus(bus.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Bus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-300">
                            <span className="text-slate-500">Type:</span> {bus.coach_type}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Seats:</span> {bus.total_seats}
                          </p>
                          {bus.amenities && bus.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {bus.amenities.map((amenity: string) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trips' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Trips {trips.length > 0 && `(${trips.length})`}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedTrip(null);
                      setTripModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={buses.length === 0}
                    title={buses.length === 0 ? 'Create a bus first' : ''}
                  >
                    <Plus className="w-4 h-4" />
                    Add Trip
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading trips...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Trips Scheduled</h3>
                    <p className="text-slate-400 mb-6">
                      Create your first trip to start accepting bookings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {trip.from_city} → {trip.to_city}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  trip.status === 'scheduled'
                                    ? 'bg-green-500/10 text-green-500'
                                    : trip.status === 'ongoing'
                                    ? 'bg-blue-500/10 text-blue-500'
                                    : trip.status === 'completed'
                                    ? 'bg-slate-500/10 text-slate-400'
                                    : 'bg-red-500/10 text-red-500'
                                }`}
                              >
                                {trip.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-slate-500">Bus</p>
                                <p className="text-slate-300">{trip.buses?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Date</p>
                                <p className="text-slate-300">{formatDate(trip.journey_date)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Departure</p>
                                <p className="text-slate-300">{formatTime(trip.departure_time)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Price</p>
                                <p className="text-slate-300">
                                  {formatCurrency(trip.base_price)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleDuplicateTrip(trip)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Duplicate Trip"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit Trip"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'promos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Promo Codes {promos.length > 0 && `(${promos.length})`}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedPromo(null);
                      setPromoModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Promo
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading promo codes...</p>
                  </div>
                ) : promos.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Promo Codes</h3>
                    <p className="text-slate-400 mb-6">
                      Create promotional codes to offer discounts
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promos.map((promo) => (
                      <div
                        key={promo.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white">{promo.code}</h3>
                              {promo.is_active ? (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm">{promo.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPromo(promo)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit Promo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Promo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-300">
                            <span className="text-slate-500">Discount:</span>{' '}
                            {promo.discount_type === 'percentage'
                              ? `${promo.discount_value}%`
                              : formatCurrency(promo.discount_value)}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Min Amount:</span>{' '}
                            {formatCurrency(promo.min_booking_amount)}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Usage:</span> {promo.used_count}
                            {promo.usage_limit ? ` / ${promo.usage_limit}` : ' / Unlimited'}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Valid:</span>{' '}
                            {formatDate(promo.valid_from)} - {formatDate(promo.valid_until)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Bookings {bookings.length > 0 && `(${bookings.length})`}
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
                    <p className="text-slate-400">
                      Bookings will appear here once customers start booking
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {booking.buses?.bus_number || booking.id.substring(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {booking.profiles?.full_name ||
                                booking.profiles?.phone ||
                                booking.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                booking.payment_status === 'completed'
                                  ? 'bg-green-500/10 text-green-500'
                                  : booking.payment_status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {booking.payment_status}
                            </span>
                            <span
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                booking.booking_status === 'confirmed'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Route</p>
                            <p className="text-slate-300">
                              {booking.trips?.from_city} → {booking.trips?.to_city}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Passengers</p>
                            <p className="text-slate-300 font-semibold">
                              {booking.passengers?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Amount</p>
                            <p className="text-slate-300">
                              {formatCurrency(booking.final_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Booked On</p>
                            <p className="text-slate-300">{formatDate(booking.created_at)}</p>
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

      <BusModal
        isOpen={busModalOpen}
        onClose={() => {
          setBusModalOpen(false);
          setSelectedBus(null);
        }}
        onSubmit={handleBusSubmit}
        bus={selectedBus}
      />

      <TripModal
        isOpen={tripModalOpen}
        onClose={() => {
          setTripModalOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleTripSubmit}
        trip={selectedTrip}
        buses={buses}
      />

      <PromoModal
        isOpen={promoModalOpen}
        onClose={() => {
          setPromoModalOpen(false);
          setSelectedPromo(null);
        }}
        onSubmit={handlePromoSubmit}
        promo={selectedPromo}
      />

      <DuplicateTripModal
        isOpen={duplicateTripModalOpen}
        onClose={() => {
          setDuplicateTripModalOpen(false);
          setSelectedTripForDuplicate(null);
        }}
        onSubmit={handleDuplicateSubmit}
        trip={selectedTripForDuplicate}
      />
    </div>
  );
};