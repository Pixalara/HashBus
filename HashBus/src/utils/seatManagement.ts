import { supabase } from '../lib/supabase';

export const updateSeatStatus = async (
  busId: string,
  seatNumbers: (string | number)[],
  newStatus: 'available' | 'booked' | 'blocked' | 'booked_male' | 'booked_female' = 'booked'
) => {
  try {
    if (!busId || !seatNumbers || seatNumbers.length === 0) {
      console.warn('⚠️ Missing busId or seat numbers');
      return [];
    }

    // ✅ Convert seat numbers to integers for consistency
    const numericSeatNumbers = seatNumbers.map(n => parseInt(String(n)));
    
    console.log('🔄 Updating seat status:', { busId, seatNumbers: numericSeatNumbers, newStatus });

    // Method 1: Try using RPC function
    try {
      const { data, error } = await supabase.rpc('mark_seats_booked', {
        p_bus_id: busId,
        p_seat_numbers: numericSeatNumbers,
        p_new_status: newStatus,
      });

      if (error) {
        console.warn('⚠️ RPC error, trying direct update:', error);
      } else if (data && data.length > 0) {
        console.log('✅ Seats updated via RPC:', data);
        return data;
      }
    } catch (rpcError) {
      console.warn('⚠️ RPC not available, using direct update');
    }

    // Method 2: Direct update if RPC fails
    const { error: updateError, data: updateData } = await supabase
      .from('seats')
      .update({ 
        status: newStatus,
      })
      .eq('bus_id', busId)
      .in('seat_number', numericSeatNumbers)
      .select();

    if (updateError) {
      console.error('❌ Direct update error:', updateError);
      throw updateError;
    }

    console.log('✅ Seats updated successfully:', {
      count: updateData?.length,
      seats: updateData?.map(s => ({ number: s.seat_number, status: s.status })),
    });

    return updateData || [];
  } catch (error) {
    console.error('❌ Fatal error updating seat status:', error);
    throw error;
  }
};

export const getSeatsByBus = async (busId: string) => {
  try {
    console.log('🔍 Fetching seats for bus:', busId);

    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('bus_id', busId)
      .order('seat_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching seats:', error);
      throw error;
    }

    console.log('✅ Seats fetched:', {
      busId,
      total: data?.length,
      available: data?.filter(s => s.status === 'available').length,
      booked: data?.filter(s => s.status === 'booked').length,
    });

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching seats:', error);
    return [];
  }
};

export const verifySeatStatus = async (busId: string, seatNumbers: (string | number)[]) => {
  try {
    // ✅ Convert to integers for consistency
    const numericSeatNumbers = seatNumbers.map(n => parseInt(String(n)));
    
    const { data, error } = await supabase
      .from('seats')
      .select('seat_number, status')
      .eq('bus_id', busId)
      .in('seat_number', numericSeatNumbers);

    if (error) throw error;

    console.log('🔍 Seat status verification:', {
      busId,
      checked: numericSeatNumbers,
      results: data?.map(s => ({ number: s.seat_number, status: s.status }))
    });
    return data || [];
  } catch (error) {
    console.error('❌ Error verifying seat status:', error);
    return [];
  }
};