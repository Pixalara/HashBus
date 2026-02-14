import React from 'react';
import { Shield, Star, Zap, Coffee, Music, Tv, Wind } from 'lucide-react';

export const FleetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Our Premium Fleet</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience luxury travel with our world-class fleet of Bharat Benz and Volvo coaches,
            designed for your ultimate comfort and convenience.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-2 border-amber-500/30 rounded-2xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-6 left-6 z-10">
                <span className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold rounded-full shadow-lg">
                  FLAGSHIP LUXURY
                </span>
              </div>
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 h-64 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-6xl font-bold text-white mb-2">Volvo</h2>
                  <p className="text-xl text-amber-400">Ultra Premium Coaches</p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <p className="text-lg text-slate-300 leading-relaxed mb-6">
                  Our Volvo fleet represents the pinnacle of luxury bus travel. With cutting-edge
                  technology, premium interiors, and unmatched comfort, these coaches redefine what
                  it means to travel by road. Every journey becomes an experience to remember.
                </p>
                <div className="flex items-center gap-2 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <Star className="w-5 h-5 fill-amber-400" />
                  <Star className="w-5 h-5 fill-amber-400" />
                  <Star className="w-5 h-5 fill-amber-400" />
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="ml-2 text-white font-semibold">5.0 Average Rating</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Premium Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Premium Sleeper Bunks</h4>
                      <p className="text-slate-400 text-sm">
                        Extra-wide beds with adjustable leg rest for ultimate comfort
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Tv className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Personal Entertainment</h4>
                      <p className="text-slate-400 text-sm">
                        Individual screens with movies, music, and games
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">USB Charging Ports</h4>
                      <p className="text-slate-400 text-sm">
                        Keep your devices charged throughout
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Coffee className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Gourmet Refreshments</h4>
                      <p className="text-slate-400 text-sm">
                        Complimentary snacks and beverages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Wind className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Climate Control</h4>
                      <p className="text-slate-400 text-sm">
                        Individual AC vents for personalized comfort
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                      <Shield className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Advanced Safety</h4>
                      <p className="text-slate-400 text-sm">
                        Multiple safety systems and emergency exits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-6 left-6 z-10">
                <span className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                  PREMIUM COMFORT
                </span>
              </div>
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 h-64 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-6xl font-bold text-white mb-2">Bharat Benz</h2>
                  <p className="text-xl text-blue-400">Luxury Coaches</p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <p className="text-lg text-slate-300 leading-relaxed mb-6">
                  Our Bharat Benz coaches combine reliability with modern luxury. Built with precision
                  engineering and designed for comfort, these coaches offer a superior travel experience
                  with spacious interiors and premium amenities at exceptional value.
                </p>
                <div className="flex items-center gap-2 text-blue-400">
                  <Star className="w-5 h-5 fill-blue-400" />
                  <Star className="w-5 h-5 fill-blue-400" />
                  <Star className="w-5 h-5 fill-blue-400" />
                  <Star className="w-5 h-5 fill-blue-400" />
                  <Star className="w-5 h-5 fill-blue-400 opacity-50" />
                  <span className="ml-2 text-white font-semibold">4.7 Average Rating</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Comfortable Sleeper Bunks</h4>
                      <p className="text-slate-400 text-sm">
                        Spacious beds with ample legroom for restful sleep
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">USB Charging Ports</h4>
                      <p className="text-slate-400 text-sm">
                        Keep your devices charged throughout
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Music className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Entertainment System</h4>
                      <p className="text-slate-400 text-sm">
                        Music and video entertainment onboard
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Wind className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Air Conditioning</h4>
                      <p className="text-slate-400 text-sm">
                        Powerful AC system for optimal temperature
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Coffee className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Complimentary Snacks</h4>
                      <p className="text-slate-400 text-sm">
                        Refreshments and beverages onboard
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Safety First</h4>
                      <p className="text-slate-400 text-sm">
                        Comprehensive safety features and trained drivers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Why Our Fleet Stands Out</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Every coach in our fleet undergoes rigorous maintenance and quality checks to ensure your
            journey is safe, comfortable, and memorable. We invest in the best to give you the best.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">100%</div>
              <p className="text-slate-300">Safety Compliance</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">24/7</div>
              <p className="text-slate-300">Support Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">10K+</div>
              <p className="text-slate-300">Happy Travelers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};