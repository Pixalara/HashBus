import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, User, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

interface PassengerDetailsPageProps {
  bus: any;
  selectedSeats: any[];
  searchParams: { from: string; to: string; date: string };
  onPaymentClick: () => void;
  onBack: () => void;
}

type Step = 'contact' | 'passenger';
type Gender = 'male' | 'female' | 'other';

interface ContactDetails {
  email: string;
  mobile: string;
  otpSent: boolean;
  otp: string;
  otpVerified: boolean;
}

interface PassengerDetail {
  fullName: string;
  gender: Gender;
  age: string;
}

interface GSTDetails {
  gstNumber: string;
  gstState: string;
  companyName: string;
}

export const PassengerDetailsPage: React.FC<PassengerDetailsPageProps> = ({
  bus,
  selectedSeats,
  searchParams,
  onPaymentClick,
  onBack,
}) => {
  const { user } = useAuth();
  const { setPassenger, setPassengers } = useBooking();
  const [step, setStep] = useState<Step>('contact');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [contact, setContact] = useState<ContactDetails>({
    email: '',
    mobile: '',
    otpSent: false,
    otp: '',
    otpVerified: false,
  });

  const [passengers, setPassengersLocal] = useState<PassengerDetail[]>(
    selectedSeats.map(() => ({ fullName: '', gender: 'male' as Gender, age: '' }))
  );

  const [gstDetails, setGstDetails] = useState<GSTDetails>({
    gstNumber: '',
    gstState: '',
    companyName: '',
  });

  const [showGST, setShowGST] = useState(false);

  // ==================== CHECK AUTHENTICATION & LOAD PROFILE ====================

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      try {
        setLoadingProfile(true);
        console.log('🚀 Starting profile load...');

        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        console.log('👤 Current User ID:', currentUser?.id);
        console.log('📧 Auth Email:', currentUser?.email);

        if (!currentUser) {
          console.log('❌ No authenticated user found');
          setIsAuthenticated(false);
          setLoadingProfile(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch profile by EMAIL instead of ID
        console.log('🔍 Fetching profile for email:', currentUser.email);
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', currentUser.email)
          .single();

        console.log('📊 Supabase Response:');
        console.log('   Error:', profileError);
        console.log('   Data:', profile);

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError.message);
          setContact({
            email: currentUser.email || '',
            mobile: '',
            otpSent: false,
            otp: '',
            otpVerified: true,
          });
          setLoadingProfile(false);
          return;
        }

        if (!profile) {
          console.log('⚠️ Profile is null/undefined - User may not have a profile record yet');
          setContact({
            email: currentUser.email || '',
            mobile: '',
            otpSent: false,
            otp: '',
            otpVerified: true,
          });
          setLoadingProfile(false);
          return;
        }

        console.log('✅ Profile Found:');
        console.log('   Name:', profile.name);
        console.log('   Phone:', profile.phone);
        console.log('   Email:', profile.email);
        console.log('   Gender:', profile.gender);

        // Extract phone
        const phoneNumber = profile.phone || '';
        console.log('📱 Raw phone value:', phoneNumber);
        console.log('📱 Phone type:', typeof phoneNumber);

        let cleanPhone = '';
        if (phoneNumber) {
          cleanPhone = phoneNumber.toString().replace(/\D/g, '').slice(0, 10);
          console.log('✂️ Cleaned phone:', cleanPhone);
          console.log('📏 Phone length:', cleanPhone.length);
        } else {
          console.log('⚠️ Phone is empty/null');
        }

        setContact({
          email: profile.email || currentUser.email || '',
          mobile: cleanPhone,
          otpSent: false,
          otp: '',
          otpVerified: true,
        });

        console.log('✅ Contact state updated with:', { email: profile.email, mobile: cleanPhone });

      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setIsAuthenticated(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkAuthAndLoadProfile();
  }, []);

  // ==================== CONTACT DETAILS SECTION ====================

  const handleSendOTP = async () => {
    setError('');
    setSuccess('');

    if (!contact.email.trim()) {
      setError('Please enter email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!contact.mobile.trim() || contact.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: contact.email.trim(),
      });

      if (otpError) throw otpError;

      setContact({ ...contact, otpSent: true });
      setSuccess('OTP sent to your email! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');

    if (!contact.otp.trim() || contact.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: contact.email.trim(),
        token: contact.otp.trim(),
        type: 'email',
      });

      if (verifyError) throw verifyError;

      setContact({ ...contact, otpVerified: true });
      setSuccess('✓ Email verified! Now enter passenger details.');
      
      setTimeout(() => {
        setStep('passenger');
      }, 800);
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmContact = async () => {
    setError('');
    setSuccess('');

    if (!contact.email.trim()) {
      setError('Please enter email address');
      return;
    }
    if (!contact.mobile.trim() || contact.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      if (isAuthenticated && user) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            phone: contact.mobile.trim(),
          })
          .eq('email', user.email);

        if (updateError) throw updateError;
      }

      setStep('passenger');
    } catch (err: any) {
      setError(err.message || 'Failed to update contact details.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PASSENGER DETAILS SECTION ====================

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengersLocal(updated);
  };

  const handleGSTChange = (field: string, value: string) => {
    setGstDetails({ ...gstDetails, [field]: value });
  };

  const validateGSTNumber = (gstNumber: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  };

  const validatePassengers = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      
      if (!p.fullName.trim()) {
        setError(`Please enter full name for Passenger ${i + 1}`);
        return false;
      }
      
      if (!p.age.trim()) {
        setError(`Please enter age for Passenger ${i + 1}`);
        return false;
      }
      
      const ageNum = parseInt(p.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setError(`Please enter valid age (1-120) for Passenger ${i + 1}`);
        return false;
      }
      
      if (!p.gender) {
        setError(`Please select gender for Passenger ${i + 1}`);
        return false;
      }
    }

    if (showGST) {
      if (gstDetails.gstNumber.trim() && !validateGSTNumber(gstDetails.gstNumber.trim())) {
        setError('Please enter a valid 15-digit GST number');
        return false;
      }
      
      if (gstDetails.gstNumber.trim() && !gstDetails.gstState.trim()) {
        setError('Please select GST state');
        return false;
      }
      
      if (gstDetails.gstNumber.trim() && !gstDetails.companyName.trim()) {
        setError('Please enter company name');
        return false;
      }
    }

    return true;
  };

  const handleProceedToPayment = async () => {
    setError('');

    if (!validatePassengers()) {
      return;
    }

    try {
      setLoading(true);

      // ✅ IMPORTANT: Save passenger data to context BEFORE navigating
      const passengerData = {
        name: passengers[0].fullName,
        email: contact.email,
        mobile: contact.mobile,
        gender: passengers[0].gender,
        age: parseInt(passengers[0].age),
      };

      console.log('💾 Saving passenger data to context:', passengerData);
      
      // Set single passenger to context
      setPassenger(passengerData);
      
      // Set all passengers to context
      const allPassengersData = passengers.map((p, index) => ({
        name: p.fullName,
        email: contact.email,
        mobile: contact.mobile,
        gender: p.gender,
        age: parseInt(p.age),
      }));
      setPassengers(allPassengersData);

      const bookingData = {
        contact,
        passengers,
        gstDetails: showGST ? gstDetails : null,
        bus,
        selectedSeats,
        searchParams,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('bookingDetails', JSON.stringify(bookingData));

      console.log('✅ Booking data saved:', bookingData);
      console.log('🔄 Calling onPaymentClick...');

      // Now navigate to payment page
      onPaymentClick();
      
    } catch (err: any) {
      console.error('❌ Payment proceed error:', err);
      setError(err.message || 'Failed to proceed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Ladakh',
    'Puducherry', 'Andaman and Nicobar Islands', 'Chandigarh', 'Daman and Diu',
    'Lakshadweep', 'Dadra and Nagar Haveli'
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Seats
          </button>
        </div>

        {/* Authentication Status */}
        {isAuthenticated && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-300">Authenticated User</p>
              <p className="text-sm text-green-400">Your contact details are pre-filled</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
              step === 'contact' || contact.otpVerified
                ? 'bg-amber-500 text-white'
                : 'bg-slate-600 text-slate-300'
            }`}>
              1
            </div>
            <div>
              <p className="font-bold text-white text-lg">Contact Details</p>
              <p className="text-sm text-slate-400">
                {isAuthenticated ? 'Confirm Details' : 'Email & Mobile verification'}
              </p>
            </div>
          </div>

          <div className="flex-1 h-1 mx-6 bg-slate-700"></div>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
              step === 'passenger' && contact.otpVerified
                ? 'bg-amber-500 text-white'
                : contact.otpVerified
                ? 'bg-slate-600 text-slate-300'
                : 'bg-slate-700 text-slate-500'
            }`}>
              2
            </div>
            <div>
              <p className="font-bold text-white text-lg">Passenger Details</p>
              <p className="text-sm text-slate-400">Name, Age, Gender</p>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 1: CONTACT DETAILS ====================*/}
        {step === 'contact' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-2">Contact Details</h2>
            <p className="text-slate-300 mb-8 text-base">
              {isAuthenticated 
                ? 'Please confirm your contact details to proceed'
                : 'Your ticket will be sent to these details'
              }
            </p>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Email ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => {
                    setContact({ ...contact, email: e.target.value });
                    setError('');
                  }}
                  placeholder="Enter your email address"
                  disabled={isAuthenticated}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-white placeholder-slate-500 ${
                    isAuthenticated ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                />
              </div>
            </div>

            {/* Mobile Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={contact.mobile}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setContact({ ...contact, mobile: cleaned });
                    setError('');
                  }}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-white placeholder-slate-500"
                />
              </div>
              {contact.mobile && (
                <p className="text-xs text-green-400 mt-2">✓ {contact.mobile.length}/10 digits</p>
              )}
            </div>

            {/* Actions based on authentication */}
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleConfirmContact}
                  disabled={loading || !contact.email.trim() || contact.mobile.length !== 10}
                  size="lg"
                  className="w-full mb-4"
                >
                  {loading ? 'Confirming...' : 'Confirm Contact Details'}
                </Button>
              </>
            ) : (
              <>
                {!contact.otpSent && !contact.otpVerified && (
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || !contact.email.trim() || contact.mobile.length !== 10}
                    size="lg"
                    className="w-full mb-4"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                )}

                {contact.otpSent && !contact.otpVerified && (
                  <>
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <p className="text-sm text-blue-300">
                        We've sent a 6-digit OTP to <strong>{contact.email}</strong>
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Enter OTP <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={contact.otp}
                        onChange={(e) => {
                          setContact({ ...contact, otp: e.target.value.replace(/\D/g, '').slice(0, 6) });
                          setError('');
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl text-center text-3xl tracking-widest focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-white placeholder-slate-500"
                      />
                    </div>

                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading || contact.otp.length !== 6}
                      size="lg"
                      className="w-full mb-3"
                    >
                      {loading ? 'Verifying OTP...' : 'Verify OTP'}
                    </Button>

                    <button
                      onClick={() => setContact({ ...contact, otpSent: false, otp: '' })}
                      className="w-full py-3 text-slate-300 hover:text-white font-medium transition-colors text-base"
                    >
                      Back to Email
                    </button>
                  </>
                )}
              </>
            )}

            {/* OTP Verified Success */}
            {contact.otpVerified && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-300">Contact details confirmed!</p>
                  <p className="text-sm text-green-400">Now enter passenger details to proceed</p>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 mt-4">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-300 font-medium">{success}</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== SECTION 2: PASSENGER DETAILS ====================*/}
        {step === 'passenger' && contact.otpVerified && (
          <div className="space-y-6">
            {/* Journey Info Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-white text-lg mb-4">
                {searchParams.from} → {searchParams.to}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 font-medium">Date</p>
                  <p className="font-bold text-white text-base">{searchParams.date}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Bus</p>
                  <p className="font-bold text-white text-base">{bus.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Seats</p>
                  <p className="font-bold text-white text-base">{selectedSeats.map(s => s.number).join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Passenger Details Forms */}
            <div className="space-y-5">
              {passengers.map((passenger, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Passenger {index + 1}</h3>
                    <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30">
                      Seat {selectedSeats[index]?.number}
                    </span>
                  </div>

                  {/* Full Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={passenger.fullName}
                        onChange={(e) => {
                          handlePassengerChange(index, 'fullName', e.target.value);
                          setError('');
                        }}
                        placeholder="Enter full name"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Age and Gender Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Age */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Age <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) => {
                          handlePassengerChange(index, 'age', e.target.value);
                          setError('');
                        }}
                        placeholder="Enter age"
                        min="1"
                        max="120"
                        className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-white placeholder-slate-500"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Gender <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => {
                          handlePassengerChange(index, 'gender', e.target.value);
                          setError('');
                        }}
                        className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none text-white font-medium"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ==================== GST DETAILS SECTION (OPTIONAL) ====================*/}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg">
              {/* GST Toggle */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
                <input
                  type="checkbox"
                  id="gstToggle"
                  checked={showGST}
                  onChange={(e) => {
                    setShowGST(e.target.checked);
                    if (!e.target.checked) {
                      setGstDetails({ gstNumber: '', gstState: '', companyName: '' });
                    }
                    setError('');
                  }}
                  className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                />
                <label htmlFor="gstToggle" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">GST Details</p>
                    <p className="text-sm text-slate-400">(Optional - For invoice with GST)</p>
                  </div>
                </label>
              </div>

              {/* GST Fields */}
              {showGST && (
                <div className="space-y-6">
                  {/* GST Registration Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      GST Registration Number
                    </label>
                    <input
                      type="text"
                      value={gstDetails.gstNumber}
                      onChange={(e) => {
                        handleGSTChange('gstNumber', e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="e.g., 27AABCT1234H1Z0"
                      maxLength={15}
                      className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white font-mono uppercase placeholder-slate-500"
                    />
                    <p className="text-xs text-slate-400 mt-2">Format: 15 alphanumeric characters</p>
                  </div>

                  {/* GST State and Company Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* GST State */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        GST State
                      </label>
                      <select
                        value={gstDetails.gstState}
                        onChange={(e) => {
                          handleGSTChange('gstState', e.target.value);
                          setError('');
                        }}
                        className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none text-white"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={gstDetails.companyName}
                        onChange={(e) => {
                          handleGSTChange('companyName', e.target.value);
                          setError('');
                        }}
                        placeholder="Enter company name"
                        className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-300">
                      ℹ️ GST details will be included in your invoice. Leave blank if not applicable.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={() => {
                  setStep('contact');
                  setError('');
                }}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Back to Contact
              </Button>
              <Button
                onClick={handleProceedToPayment}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};