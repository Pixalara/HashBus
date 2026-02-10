import React, { useState } from 'react';
import { Bus, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'fleet', label: 'Our Fleet' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  };

  return (
    <>
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 group"
            >
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg shadow-lg group-hover:shadow-amber-500/50 transition-all duration-300">
                <Bus className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl font-bold text-white tracking-tight">HashBus</span>
                <span className="text-xs text-amber-500 font-medium">Travel, Upgraded</span>
              </div>
            </button>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'text-amber-500 bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium hidden sm:block">
                      {profile?.full_name || profile?.email || profile?.phone || 'User'}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </button>
                      {profile?.role && ['admin', 'agent'].includes(profile.role) && (
                        <button
                          onClick={() => {
                            onNavigate('admin-dashboard');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-t border-slate-700"
                        >
                          <Shield className="w-5 h-5" />
                          <span className="text-sm font-medium">Admin Dashboard</span>
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors border-t border-slate-700"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-amber-500/50 hidden sm:block"
                >
                  Login
                </button>
              )}

              <button
                className="md:hidden text-slate-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'text-amber-500 bg-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {!user && (
                <button
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                >
                  Login
                </button>
              )}

              {user && (
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </button>
              )}

              {user && profile?.role && ['admin', 'agent'].includes(profile.role) && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </button>
              )}

              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};
