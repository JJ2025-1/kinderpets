'use client';

import React from 'react';

interface NavbarProps {
  currentRole: 'adopter' | 'staff';
  currentAdopterId: number;
  currentStaffId: number;
  activeTab: 'discover' | 'matches' | 'applications' | 'shelter' | 'sqllab';
  matchCount: number;
  pendingAppCount: number;
  onSelectTab: (tab: 'discover' | 'matches' | 'applications' | 'shelter' | 'sqllab') => void;
  onSwitchUser: (role: 'adopter' | 'staff', id: number) => void;
  onResetDb: () => void;
}

export default function Navbar({
  currentRole,
  currentAdopterId,
  currentStaffId,
  activeTab,
  matchCount,
  pendingAppCount,
  onSelectTab,
  onSwitchUser,
  onResetDb,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab('discover')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <span className="text-xl">🐾</span>
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                Kinder Pets
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold border border-rose-200">
                DA2 DBMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectTab('discover')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'discover'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <span>🔥</span>
              <span className="hidden md:inline">Discover</span>
            </button>

            <button
              onClick={() => onSelectTab('matches')}
              className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'matches'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <span>💖</span>
              <span className="hidden md:inline">Matches</span>
              {matchCount > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'matches' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                }`}>
                  {matchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('applications')}
              className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'applications'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <span>📋</span>
              <span className="hidden md:inline">My Apps</span>
            </button>

            <button
              onClick={() => onSelectTab('shelter')}
              className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'shelter'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <span>🏢</span>
              <span className="hidden md:inline">Shelter Hub</span>
              {pendingAppCount > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'shelter' ? 'bg-white text-rose-600' : 'bg-amber-500 text-white'
                }`}>
                  {pendingAppCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('sqllab')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'sqllab'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100/70'
              }`}
            >
              <span>⚡</span>
              <span className="hidden lg:inline">SQL Lab (14 Queries)</span>
              <span className="lg:hidden">SQL</span>
            </button>
          </nav>

          {/* User Switcher & Reset Button */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={`${currentRole}:${currentRole === 'adopter' ? currentAdopterId : currentStaffId}`}
                onChange={(e) => {
                  const [role, idStr] = e.target.value.split(':') as ['adopter' | 'staff', string];
                  onSwitchUser(role, Number(idStr));
                }}
                className="text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer transition-colors"
              >
                <optgroup label="👤 Adopter Profiles">
                  <option value="adopter:1">Rahul Sharma (Bangalore)</option>
                  <option value="adopter:2">Priya Patel (Mumbai)</option>
                  <option value="adopter:3">Ananya Iyer (Chennai)</option>
                  <option value="adopter:4">Rohan Kapoor (Delhi)</option>
                  <option value="adopter:5">Sneha Deshpande (Pune)</option>
                  <option value="adopter:6">Aditya Verma (Bangalore)</option>
                </optgroup>
                <optgroup label="🏢 Shelter Staff">
                  <option value="staff:1">Dr. Rajesh Rao (Paws & Tails, BLR)</option>
                  <option value="staff:2">Priya Menon (Paws & Tails, BLR)</option>
                  <option value="staff:3">Vikram Deshmukh (Compassion, MUM)</option>
                  <option value="staff:4">Kavita Sundaram (Safe Haven, CHN)</option>
                  <option value="staff:5">Amit Verma (Tails of Joy, DEL)</option>
                  <option value="staff:6">Sunita Kulkarni (PAWS, PUN)</option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={onResetDb}
              title="Reset database to initial seed dataset"
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors flex items-center space-x-1"
            >
              <span>↺</span>
              <span className="hidden sm:inline">Reset DB</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
