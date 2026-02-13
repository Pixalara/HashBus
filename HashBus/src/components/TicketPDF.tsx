import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import QRCode from 'qrcode';

interface TicketPDFProps {
  booking: Booking;
}

export const TicketPDF = React.forwardRef<HTMLDivElement, TicketPDFProps>(
  ({ booking }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isReady, setIsReady] = useState(false);

    const generateTicketNumber = () => {
      return `HB${booking.id.substring(0, 12).toUpperCase()}`;
    };

    useEffect(() => {
      // Generate QR code
      const qrData = JSON.stringify({
        ticketId: generateTicketNumber(),
        bookingId: booking.id,
        passenger: booking.passenger.name,
        route: `${booking.route.from.name} to ${booking.route.to.name}`,
        date: booking.journeyDate,
        seats: booking.selectedSeats.map(s => s.number).join(', ')
      });

      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 200,
      })
        .then(url => {
          setQrCodeUrl(url);
          setIsReady(true);
          console.log('QR Code generated successfully');
        })
        .catch(err => {
          console.error('QR Code error:', err);
          setIsReady(true); // Continue without QR code
        });
    }, [booking]);

    if (!isReady) {
      return <div>Preparing ticket...</div>;
    }

    return (
      <div
        ref={ref}
        className="w-full bg-white p-0"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Premium Ticket Design */}
        <div className="relative h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
          {/* Top Gradient Bar */}
          <div className="relative h-32 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-2 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
            </div>

            <div className="relative h-full flex items-center justify-between px-8 py-6">
              <div>
                <h1 className="text-4xl font-black text-white">HASHBUS</h1>
                <p className="text-amber-100 font-semibold">Travel. Upgraded.</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm mb-1">TICKET ID</p>
                <p className="text-white text-2xl font-bold tracking-widest">{generateTicketNumber()}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-8 py-6 space-y-6">
            {/* Journey Section */}
            <div className="border-2 border-amber-600 rounded-lg p-6" style={{ backgroundColor: '#fffbeb' }}>
              <div className="grid grid-cols-3 gap-8">
                {/* From */}
                <div className="text-center">
                  <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">From</p>
                  <p className="text-3xl font-black" style={{ color: '#111827' }}>
                    {booking.route.from.name.substring(0, 3).toUpperCase()}
                  </p>
                  <p className="text-slate-600 text-sm mt-2">{booking.route.from.name}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="text-amber-600 text-4xl">→</div>
                </div>

                {/* To */}
                <div className="text-center">
                  <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">To</p>
                  <p className="text-3xl font-black" style={{ color: '#111827' }}>
                    {booking.route.to.name.substring(0, 3).toUpperCase()}
                  </p>
                  <p className="text-slate-600 text-sm mt-2">{booking.route.to.name}</p>
                </div>
              </div>
            </div>

            {/* Journey Details Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg p-4 border border-slate-200" style={{ backgroundColor: '#f8fafc' }}>
                <p className="text-slate-500 text-xs uppercase font-bold mb-2">Date</p>
                <p className="text-xl font-bold" style={{ color: '#111827' }}>
                  {formatDate(booking.journeyDate)}
                </p>
              </div>
              <div className="rounded-lg p-4 border border-slate-200" style={{ backgroundColor: '#f8fafc' }}>
                <p className="text-slate-500 text-xs uppercase font-bold mb-2">Departure</p>
                <p className="text-xl font-bold" style={{ color: '#111827' }}>
                  {formatTime(booking.bus.departureTime)}
                </p>
              </div>
              <div className="rounded-lg p-4 border border-slate-200" style={{ backgroundColor: '#f8fafc' }}>
                <p className="text-slate-500 text-xs uppercase font-bold mb-2">Duration</p>
                <p className="text-xl font-bold" style={{ color: '#111827' }}>
                  {booking.bus.duration}
                </p>
              </div>
              <div className="rounded-lg p-4 border-2 border-amber-600" style={{ backgroundColor: '#fffbeb' }}>
                <p className="text-amber-600 text-xs uppercase font-bold mb-2">Seats</p>
                <p className="text-xl font-bold text-amber-700">
                  {booking.selectedSeats.map(s => s.number).join(', ')}
                </p>
              </div>
            </div>

            {/* Pickup & Drop */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <p className="text-green-700 text-sm font-bold uppercase mb-2">📍 Pickup Point</p>
                <p className="font-semibold" style={{ color: '#111827' }}>
                  {booking.pickupPoint.name}
                </p>
              </div>
              <div className="rounded-lg p-4 border border-red-200" style={{ backgroundColor: '#fef2f2' }}>
                <p className="text-red-700 text-sm font-bold uppercase mb-2">📍 Drop Point</p>
                <p className="font-semibold" style={{ color: '#111827' }}>
                  {booking.dropPoint.name}
                </p>
              </div>
            </div>

            {/* Passenger & Bus Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border border-blue-200" style={{ backgroundColor: '#eff6ff' }}>
                <p className="text-blue-700 text-xs font-bold uppercase mb-2">Passenger</p>
                <p className="font-bold text-lg" style={{ color: '#111827' }}>
                  {booking.passenger.name}
                </p>
                <p className="text-slate-600 text-sm">{booking.passenger.age} years, {booking.passenger.gender}</p>
                <p className="text-slate-600 text-sm mt-1">{booking.passenger.mobile}</p>
              </div>
              <div className="rounded-lg p-4 border border-purple-200" style={{ backgroundColor: '#faf5ff' }}>
                <p className="text-purple-700 text-xs font-bold uppercase mb-2">Bus Details</p>
                <p className="font-bold" style={{ color: '#111827' }}>
                  {booking.bus.name}
                </p>
                <p className="text-slate-600 text-sm">{booking.bus.coachType}</p>
                <p className="text-slate-600 text-sm">AC • Luxury Sleeper</p>
              </div>
            </div>

            {/* QR Code & Price Section */}
            <div className="flex items-center justify-between rounded-lg p-6 text-white" style={{ backgroundColor: '#0f172a' }}>
              <div>
                <p className="text-slate-400 text-sm mb-2">TOTAL FARE</p>
                <p className="text-5xl font-black text-amber-400">{formatCurrency(booking.totalAmount)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{ width: '120px', height: '120px', display: 'block' }}
                  />
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="rounded-lg p-4 text-xs space-y-1" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
              <p className="font-bold" style={{ color: '#111827', marginBottom: '0.5rem' }}>
                Important Terms & Conditions:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Arrive at pickup point 15 minutes before scheduled departure time</li>
                <li>Carry a valid photo ID proof during your journey</li>
                <li>This is a non-transferable ticket and is valid only for the mentioned journey and date</li>
                <li>In case of cancellation, refund will be processed as per our cancellation policy</li>
                <li>For assistance, contact: support@hashbus.com | +91 1800-HASHBUS</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center pt-4" style={{ borderTopWidth: '2px', borderTopColor: '#d1d5db' }}>
              <p className="text-slate-600 text-xs">
                Thank you for booking with HashBus. Have a comfortable and safe journey!
              </p>
              <p className="text-slate-400 text-xs mt-2">Booking Date: {formatDate(booking.bookingDate)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TicketPDF.displayName = 'TicketPDF';