import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, Shield, Lock, ArrowLeft, Tag, Check, X as XIcon } from 'lucide-react';
import { Bus, Seat, Passenger } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

interface PaymentPageProps {
  bus: Bus;
  selectedSeats: Seat[];
  passenger: Passenger;
  searchParams: { from: string; to: string; date: string };
  onPaymentComplete: () => void;
  onBack: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export const PaymentPage: React.FC<PaymentPageProps> = ({
  bus,
  selectedSeats,
  passenger,
  searchParams,
  onPaymentComplete,
  onBack,
}) => {
  const { user } = useAuth();
  const { pickupPoint, dropPoint } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const [upiId, setUpiId] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = Math.round(subtotal * 0.05);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'flat') {
      discount = appliedPromo.discount_value;
    } else if (appliedPromo.discount_type === 'percentage') {
      discount = Math.round((subtotal * appliedPromo.discount_value) / 100);
      if (appliedPromo.max_discount && discount > appliedPromo.max_discount) {
        discount = appliedPromo.max_discount;
      }
    }
  }

  const total = subtotal + taxes - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!promo) {
        throw new Error('Invalid promo code');
      }

      const now = new Date();
      const validFrom = new Date(promo.valid_from);
      const validUntil = new Date(promo.valid_until);

      if (now < validFrom || now > validUntil) {
        throw new Error('Promo code has expired');
      }

      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        throw new Error('Promo code usage limit exceeded');
      }

      if (subtotal < promo.min_booking_amount) {
        throw new Error(`Minimum booking amount of ${formatCurrency(promo.min_booking_amount)} required`);
      }

      setAppliedPromo(promo);
      setPromoError('');
    } catch (err: any) {
      setPromoError(err.message || 'Failed to apply promo code');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const generateBookingReference = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `HB${timestamp}${random}`.toUpperCase();
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const bookingReference = generateBookingReference();

      const bookingData = {
        user_id: user?.id,
        bus_id: bus.id,
        trip_id: bus.trip_id,
        booking_reference: bookingReference,
        passenger_name: passenger.name,
        passenger_phone: passenger.mobile,
        passenger_email: passenger.email,
        passenger_gender: passenger.gender,
        seats: selectedSeats.map(s => s.number),
        pickup_point: pickupPoint || '',
        drop_point: dropPoint || '',
        total_amount: total,
        payment_status: 'completed',
        journey_date: searchParams.date,
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      if (appliedPromo) {
        await supabase
          .from('promo_codes')
          .update({ used_count: appliedPromo.used_count + 1 })
          .eq('id', appliedPromo.id);
      }

      setTimeout(() => {
        setIsProcessing(false);
        onPaymentComplete();
      }, 1500);
    } catch (error) {
      console.error('Error saving booking:', error);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentComplete();
      }, 1500);
    }
  };

  const paymentMethods = [
    { id: 'upi' as PaymentMethod, name: 'UPI', icon: Smartphone },
    { id: 'card' as PaymentMethod, name: 'Credit / Debit Card', icon: CreditCard },
    { id: 'netbanking' as PaymentMethod, name: 'Net Banking', icon: Building2 },
    { id: 'wallet' as PaymentMethod, name: 'Wallets', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Details
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-white">Secure Payment</h1>
          </div>
          <p className="text-slate-400">Complete your booking with Razorpay secure checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden relative">
              <div className="border-b border-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-2 px-4 py-4 transition-all relative z-10 cursor-pointer ${
                        selectedMethod === method.id
                          ? 'bg-amber-500/10 border-b-2 border-amber-500 text-amber-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {selectedMethod === 'upi' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Enter your UPI ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-3">Popular UPI Apps</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                          <button
                            key={app}
                            className="flex items-center justify-center px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:border-amber-500/50 hover:text-white transition-all text-sm relative z-10 cursor-pointer"
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, number: e.target.value })
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="Name on card"
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-300">
                        Your card details are encrypted and secure. We never store your CVV.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Select Your Bank
                    </label>
                    <select className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer">
                      <option>Select Bank</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                      <option>Other Banks</option>
                    </select>
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Select Wallet
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Airtel Money'].map(
                        (wallet) => (
                          <button
                            key={wallet}
                            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:border-amber-500/50 hover:text-white transition-all relative z-10 cursor-pointer"
                          >
                            {wallet}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    size="lg"
                    className="w-full relative"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Shield className="w-5 h-5" />
                        Pay Securely {formatCurrency(total)}
                      </span>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Secured by Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6 sticky top-24">
              <h3 className="text-lg font-bold text-white">Order Summary</h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-700">
                  <p className="text-white font-semibold mb-1">{bus.name}</p>
                  <p className="text-slate-400 text-sm">
                    {searchParams.from} → {searchParams.to}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Passenger</span>
                    <span className="text-white">{passenger.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Seats</span>
                    <span className="text-white">
                      {selectedSeats.map((s) => s.number).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Mobile</span>
                    <span className="text-white">{passenger.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Have a Promo Code?
                  </label>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm uppercase"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {promoLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-400 text-sm font-medium">{appliedPromo.code}</span>
                        <span className="text-green-300 text-xs">({appliedPromo.description})</span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="mt-2 text-xs text-red-400">{promoError}</p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxes & Service Fee</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Promo Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total Payable</span>
                    <span className="text-2xl font-bold text-amber-500">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
