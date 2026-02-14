import React from 'react';
import { Award, Heart, Shield, Target, Users, TrendingUp } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">About HashBus</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Redefining luxury intercity travel with uncompromising comfort, safety, and service excellence.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 sm:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
          <div className="space-y-4 text-lg text-slate-300 leading-relaxed">
            <p>
              HashBus was born from a simple belief: every journey deserves to be an experience,
              not just transportation. We recognized that intercity travel in India needed an upgrade,
              a transformation that would elevate comfort, reliability, and luxury to unprecedented levels.
            </p>
            <p>
              Today, we operate a premium fleet of Bharat Benz and Volvo coaches, carefully selected
              and maintained to provide you with the finest travel experience. Our commitment goes beyond
              just getting you from point A to point B. We create journeys where every mile matters,
              every moment is comfortable, and every passenger feels valued.
            </p>
            <p>
              With thousands of satisfied travelers and counting, HashBus has become synonymous with
              luxury intercity travel. Our tagline says it all: <span className="text-amber-400 font-semibold">#HashBus – Travel, Upgraded!</span>
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Safety First</h3>
              <p className="text-slate-300 leading-relaxed">
                Your safety is our top priority. We maintain the highest standards in vehicle maintenance,
                driver training, and safety protocols.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Customer Delight</h3>
              <p className="text-slate-300 leading-relaxed">
                We go above and beyond to ensure every passenger has a delightful experience from
                booking to destination.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Excellence</h3>
              <p className="text-slate-300 leading-relaxed">
                We constantly strive for excellence in every aspect of our service, from our fleet to
                our customer support.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Reliability</h3>
              <p className="text-slate-300 leading-relaxed">
                Count on us for punctual departures, on-time arrivals, and consistent service quality
                every single time.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community</h3>
              <p className="text-slate-300 leading-relaxed">
                We believe in building lasting relationships with our passengers and being a responsible
                corporate citizen.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
              <p className="text-slate-300 leading-relaxed">
                We embrace technology and innovation to continuously improve the travel experience for
                our passengers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-8 text-center">
            <div className="text-5xl font-bold text-amber-500 mb-2">10,000+</div>
            <p className="text-slate-300 text-lg">Happy Passengers</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-8 text-center">
            <div className="text-5xl font-bold text-amber-500 mb-2">1,000+</div>
            <p className="text-slate-300 text-lg">Journeys and Counting</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-8 text-center">
            <div className="text-5xl font-bold text-amber-500 mb-2">4.8/5</div>
            <p className="text-slate-300 text-lg">Customer Rating</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Our Commitment</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            At HashBus, we are committed to making luxury travel accessible and delightful for everyone.
            Every decision we make, every service we introduce, and every route we operate is designed
            with one goal in mind: to upgrade your travel experience. Join us on this journey, and
            discover what it truly means to travel in comfort and style.
          </p>
          <div className="mt-8 inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-lg">
            #HashBus – Travel, Upgraded!
          </div>
        </div>
      </div>
    </div>
  );
};