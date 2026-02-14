import React from 'react';
import { Bus, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (page: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">HashBus</span>
                <p className="text-xs text-amber-500">Travel, Upgraded</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Luxurious intercity travel experience with premium Bharat Benz and Volvo coaches.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={(e) => handleNavClick('home', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('fleet', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Our Fleet
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('about', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('contact', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Bus Booking
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('contact', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Corporate Travel
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('contact', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Group Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick('contact', e)}
                  className="text-slate-400 hover:text-amber-500 transition-colors text-left bg-none border-none cursor-pointer"
                >
                  Customer Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-slate-400">
                <Phone className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <a href="tel:+919107168168" className="hover:text-amber-500 transition-colors">
                  +91 91071 68168
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <a href="mailto:support@hashbus.in" className="hover:text-amber-500 transition-colors">
                  support@hashbus.in
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <span>Bengaluru, Karnataka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2026 HashBus. All rights reserved. Crafted with excellence for luxury travel.
          </p>
        </div>
      </div>
    </footer>
  );
};