import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

interface Bus {
  id: string;
  name: string;
  number: string;
  coach_type: string;
  total_seats: number;
  amenities: string[];
  created_at: string;
}

interface Trip {
  id: string;
  bus_id: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  base_price: number;
  journey_date: string;
  status: string;
  pickup_points: any[];
  drop_points: any[];
  buses?: Bus;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  trip_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string;
  booking_status: string;
  passengers: any[];
  created_at: string;
  trips?: Trip;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface Stats {
  totalBuses: number;
  activeTrips: number;
  totalBookings: number;
  revenue: number;
}

export const useAdmin = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBuses: 0,
    activeTrips: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuses(data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch buses', 'error');
    }
  };

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          bus_id,
          from_city,
          to_city,
          departure_time,
          arrival_time,
          duration,
          base_price,
          journey_date,
          status,
          pickup_points,
          drop_points,
          created_at,
          updated_at,
          buses(id, name, number, coach_type, total_seats, amenities)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch trips', 'error');
    }
  };

  const fetchPromos = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch promo codes', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips(from_city, to_city, journey_date, departure_time, buses(name)),
          user_id:profiles(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(booking => ({
        ...booking,
        profiles: booking.user_id
      })) || [];

      setBookings(formattedData);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch bookings', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const [busesRes, tripsRes, bookingsRes] = await Promise.all([
        supabase.from('buses').select('id', { count: 'exact', head: true }),
        supabase
          .from('trips')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'scheduled'),
        supabase.from('bookings').select('final_amount'),
      ]);

      const totalBuses = busesRes.count || 0;
      const activeTrips = tripsRes.count || 0;
      const totalBookings = bookingsRes.data?.length || 0;
      const revenue = bookingsRes.data?.reduce((sum, b) => sum + parseFloat(b.final_amount), 0) || 0;

      setStats({
        totalBuses,
        activeTrips,
        totalBookings,
        revenue,
      });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const createBus = async (busData: Omit<Bus, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('buses').insert({
        ...busData,
        created_by: userData.user?.id,
      });

      if (error) throw error;
      showToast('Bus created successfully', 'success');
      await fetchBuses();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to create bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async (id: string, busData: Partial<Bus>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('buses').update(busData).eq('id', id);

      if (error) throw error;
      showToast('Bus updated successfully', 'success');
      await fetchBuses();
    } catch (error: any) {
      showToast(error.message || 'Failed to update bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('buses').delete().eq('id', id);

      if (error) throw error;
      showToast('Bus deleted successfully', 'success');
      await fetchBuses();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'created_at' | 'buses'>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('trips').insert(tripData);

      if (error) throw error;

      const { data: newTrip } = await supabase
        .from('trips')
        .select('id, bus_id, total_seats:buses(total_seats)')
        .eq('bus_id', tripData.bus_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newTrip) {
        const busData = await supabase
          .from('buses')
          .select('total_seats')
          .eq('id', newTrip.bus_id)
          .single();

        const totalSeats = busData.data?.total_seats || 40;
        const seats = [];

        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 4; col++) {
            const seatNum = row * 4 + col + 1;
            if (seatNum <= totalSeats) {
              seats.push({
                trip_id: newTrip.id,
                seat_number: `${seatNum}`,
                position_row: row,
                position_col: col,
                price: tripData.base_price,
                status: 'available',
              });
            }
          }
        }

        await supabase.from('seats').insert(seats);
      }

      showToast('Trip created successfully', 'success');
      await fetchTrips();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to create trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('trips').update(tripData).eq('id', id);

      if (error) throw error;
      showToast('Trip updated successfully', 'success');
      await fetchTrips();
    } catch (error: any) {
      showToast(error.message || 'Failed to update trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);

      if (error) throw error;
      showToast('Trip deleted successfully', 'success');
      await fetchTrips();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPromo = async (promoData: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('promo_codes').insert({
        ...promoData,
        created_by: userData.user?.id,
      });

      if (error) throw error;
      showToast('Promo code created successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to create promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePromo = async (id: string, promoData: Partial<PromoCode>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('promo_codes').update(promoData).eq('id', id);

      if (error) throw error;
      showToast('Promo code updated successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to update promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePromo = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);

      if (error) throw error;
      showToast('Promo code deleted successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatBlock = async (seatId: string, currentStatus: string) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'blocked' ? 'available' : 'blocked';
      const { error } = await supabase.from('seats').update({ status: newStatus }).eq('id', seatId);

      if (error) throw error;
      showToast(
        `Seat ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to update seat status', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchTrips();
    fetchPromos();
    fetchBookings();
    fetchStats();
  }, []);

  return {
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
    toggleSeatBlock,
    refreshAll: () => {
      fetchBuses();
      fetchTrips();
      fetchPromos();
      fetchBookings();
      fetchStats();
    },
  };
};
