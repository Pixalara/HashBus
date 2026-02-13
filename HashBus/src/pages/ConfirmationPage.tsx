import React from 'react';
import { CheckCircle, Download, Home, Mail, Phone, MapPin, Calendar, Clock, Users, Navigation } from 'lucide-react';
import { Booking } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { downloadTicketAsPDF } from '../utils/generatePDF';
import { Button } from '../components/Button';

interface ConfirmationPageProps {
  booking: Booking;
  onNewBooking: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ booking, onNewBooking }) => {
  const handleDownload = async () => {
    await downloadTicketAsPDF(booking);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Booking Confirmed!</h1>
          <p className="text-xl text-slate-300">
            Your journey with HashBus is all set. Have a luxurious trip!
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-amber-100 text-sm font-medium">Booking ID</p>
                <p className="text-white text-2xl font-bold tracking-wide">{booking.id}</p>
              </div>
              <Button
                onClick={handleDownload}
                data-download-button
                variant="secondary"
                className="sm:w-auto w-full bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Ticket (PDF)
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Journey Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Route</p>
                    <p className="text-white font-semibold">
                      {booking.route.from.name} → {booking.route.to.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Journey Date</p>
                    <p className="text-white font-semibold">{formatDate(booking.journeyDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Departure Time</p>
                    <p className="text-white font-semibold">
                      {formatTime(booking.bus.departureTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Users className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Seat Numbers</p>
                    <p className="text-white font-semibold">
                      {booking.selectedSeats.map((s) => s.number).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Navigation className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Pickup Point</p>
                    <p className="text-white font-semibold">{booking.pickupPoint.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Navigation className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Drop Point</p>
                    <p className="text-white font-semibold">{booking.dropPoint.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-xl font-bold text-white mb-6">Bus Details</h2>
              <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Coach</p>
                  <p className="text-white text-lg font-semibold">{booking.bus.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Type</p>
                  <p className="text-white font-medium">{booking.bus.coachType}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Amenities</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.bus.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-xl font-bold text-white mb-6">Passenger Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Name</p>
                  <p className="text-white font-medium">{booking.passenger.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Age & Gender</p>
                  <p className="text-white font-medium">
                    {booking.passenger.age} years, {booking.passenger.gender}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Mobile</p>
                  <p className="text-white font-medium">{booking.passenger.mobile}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{booking.passenger.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-xl font-bold text-white mb-6">Payment Summary</h2>
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-300 text-sm mb-1">Total Amount Paid</p>
                    <p className="text-white text-3xl font-bold">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                  <div className="bg-green-500/20 px-4 py-2 rounded-lg">
                    <p className="text-green-400 font-semibold">PAID</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Important Information</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span>Please arrive at the boarding point at least 15 minutes before departure time.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span>Carry a valid photo ID proof during your journey.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span>Your ticket has been sent to your registered email address.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <span>For any assistance, contact our support team 24/7.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-amber-500 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+91 80 1234 5678</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-amber-500 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>support@hashbus.com</span>
                </a>
              </div>
            </div>
            <Button onClick={onNewBooking} className="sm:w-auto w-full">
              <Home className="w-4 h-4 mr-2" />
              Book Another Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};