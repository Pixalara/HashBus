import React, { useState } from 'react';
import { Shield, Star, Clock, Award, ArrowRight } from 'lucide-react';
import { SearchForm } from '../components/SearchForm';

interface HomePageProps {
  onSearch: (from: string, to: string, date: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSearch }) => {
  const hashtags = [
    '#Travel',
    '#LuxuryBus',
    '#ComfortJourney',
    '#ExplorMore',
    '#TravelUpgraded',
    '#SafeTrips',
    '#PremiumBus',
    '#AdventureAwaits',
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with your bus image */}
        <div className="absolute inset-0">
          <img
            src="/hashbus-preview-2.png"
            alt="HashBus Fleet"
            className="w-full h-full object-cover"
          />
          {/* Lighter overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/40 to-slate-900/50" />
          {/* Additional gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center w-full flex flex-col items-center justify-center h-full">
          <div className="mb-12 space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              Luxurious Intercity
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Travel
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl text-amber-500 font-semibold tracking-wide drop-shadow-md">
              #HashBus – Travel, Upgraded!
            </p>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Experience premium comfort with our fleet of Bharat Benz and Volvo coaches.
              Your journey deserves an upgrade.
            </p>
          </div>

          {/* ==================== HASHTAG TICKER - FULL SCREEN WIDTH ====================*/}
          <div className="w-screen -mx-4 sm:-mx-6 lg:-mx-8 mb-8 relative">
            {/* Gradient overlays for edges only */}
            <div className="absolute left-0 top-0 bottom-0 w-40 md:w-64 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent z-50 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-40 md:w-64 bg-gradient-to-l from-slate-900 via-slate-900/40 to-transparent z-50 pointer-events-none"></div>

            {/* Scrolling container */}
            <div className="relative overflow-hidden py-3 md:py-4">
              <div className="flex gap-6 md:gap-10 whitespace-nowrap overflow-hidden group px-6 md:px-8">
                <div className="flex gap-6 md:gap-10 animate-scroll-slow">
                  {[...hashtags, ...hashtags, ...hashtags, ...hashtags, ...hashtags].map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 md:gap-3 text-amber-400 font-bold text-base md:text-lg lg:text-xl hover:text-white transition-colors duration-300 cursor-pointer flex-shrink-0 drop-shadow-md hover:drop-shadow-lg"
                    >
                      <span className="text-amber-500 text-xs md:text-sm">●</span>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SearchForm onSearch={onSearch} />
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose HashBus?</h2>
            <p className="text-slate-400 text-lg">Excellence in every journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Safe & Secure</h3>
              <p className="text-slate-400">
                Travel with confidence. Our coaches meet the highest safety standards with experienced drivers.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Comfort</h3>
              <p className="text-slate-400">
                Luxury seating, ample legroom, and world-class amenities for an exceptional journey.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">On-Time Guarantee</h3>
              <p className="text-slate-400">
                Punctuality is our promise. Arrive at your destination right on schedule.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Award Winning</h3>
              <p className="text-slate-400">
                Recognized for excellence in luxury travel and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Premium Fleet</h2>
            <p className="text-slate-400 text-lg">Travel in style with industry-leading coaches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 group">
              <div className="p-8">
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-amber-500 text-white text-sm font-semibold rounded-full mb-4">
                    FLAGSHIP
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-2">Volvo Coaches</h3>
                  <p className="text-slate-400">
                    Experience unmatched luxury with our Volvo fleet featuring premium recline seats,
                    personal entertainment, and gourmet refreshments.
                  </p>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Premium Reclining Seats
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Personal Entertainment System
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Complimentary Refreshments
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 group">
              <div className="p-8">
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full mb-4">
                    LUXURY
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-2">Bharat Benz</h3>
                  <p className="text-slate-400">
                    Modern comfort meets reliability with our Bharat Benz coaches, offering spacious
                    seating and premium amenities for every traveler.
                  </p>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Spacious Comfortable Seats
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Modern Amenities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Superior Build Quality
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STYLES ====================*/}
      <style>{`
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - 2.5rem));
          }
        }

        .animate-scroll-slow {
          animation: scroll-slow 80s linear infinite;
        }

        .group:hover .animate-scroll-slow {
          animation-play-state: paused;
        }

        /* Smooth scrolling */
        .animate-scroll-slow {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};