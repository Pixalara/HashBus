import React, { useState } from 'react';
import { Shield, Bus, Calendar, Tag, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'buses' | 'trips' | 'promos' | 'bookings'>('buses');

  if (!profile || !['admin', 'agent'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Buses', value: '0', icon: Bus, color: 'text-blue-500' },
    { label: 'Active Trips', value: '0', icon: Calendar, color: 'text-green-500' },
    { label: 'Total Bookings', value: '0', icon: Users, color: 'text-amber-500' },
    { label: 'Revenue', value: '₹0', icon: TrendingUp, color: 'text-purple-500' },
  ];

  const tabs = [
    { id: 'buses' as const, label: 'Buses', icon: Bus },
    { id: 'trips' as const, label: 'Trips', icon: Calendar },
    { id: 'promos' as const, label: 'Promo Codes', icon: Tag },
    { id: 'bookings' as const, label: 'Bookings', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">Manage your HashBus operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="border-b border-slate-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-amber-500 border-b-2 border-amber-500 bg-slate-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'buses' && (
              <div className="text-center py-12">
                <Bus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Buses Yet</h3>
                <p className="text-slate-400 mb-6">Create your first bus to get started</p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                  Add Bus
                </button>
              </div>
            )}

            {activeTab === 'trips' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Trips Scheduled</h3>
                <p className="text-slate-400 mb-6">Create your first trip to start accepting bookings</p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                  Add Trip
                </button>
              </div>
            )}

            {activeTab === 'promos' && (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Promo Codes</h3>
                <p className="text-slate-400 mb-6">Create promotional codes to offer discounts</p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                  Create Promo Code
                </button>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
                <p className="text-slate-400">Bookings will appear here once customers start booking</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
