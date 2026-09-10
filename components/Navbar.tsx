'use client';

import React from 'react';
import { 
  ShieldCheck, 
  User,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

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
  const navItems: { id: 'discover' | 'matches' | 'applications' | 'shelter' | 'sqllab'; label: string; count?: number }[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'matches', label: 'Matches', count: matchCount },
    { id: 'applications', label: 'Applications' },
    { id: 'shelter', label: 'Shelter console', count: pendingAppCount },
    { id: 'sqllab', label: 'Relational schema' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F3F1EA]/85 backdrop-blur-md border-b border-[#DEDAD1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity / Circular Mark */}
          <button 
            type="button"
            onClick={() => onSelectTab('discover')}
            aria-label="KinderPets Home"
            className="flex items-center space-x-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#3E6259] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#F3F1EA] stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-medium text-[#14181A] tracking-tight leading-none">
                KinderPets
              </span>
              <span className="text-[11px] text-[#4B5250] leading-tight">
                Verified shelter records
              </span>
            </div>
          </button>

          {/* Plain Text Navigation Links with 2px Underline */}
          <nav 
            className="flex items-center space-x-6 sm:space-x-8" 
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-5 text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer ${
                    isActive
                      ? 'text-[#14181A]'
                      : 'text-[#4B5250] hover:text-[#14181A]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#3E6259] text-white tabular-nums">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#3E6259]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Persona Switcher & Database Controls */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center">
              <label htmlFor="user-role-select" className="sr-only">Switch Active Profile</label>
              <div className="relative">
                <select
                  id="user-role-select"
                  aria-label="Select active user role or staff member"
                  value={`${currentRole}:${currentRole === 'adopter' ? currentAdopterId : currentStaffId}`}
                  onChange={(e) => {
                    const [role, idStr] = e.target.value.split(':') as ['adopter' | 'staff', string];
                    onSwitchUser(role, Number(idStr));
                  }}
                  className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] text-[#14181A] border border-[#DEDAD1] rounded pl-7 pr-7 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer transition-colors"
                >
                  <optgroup label="Adopters (Public Registrants)">
                    <option value="adopter:1">Rahul Sharma • Bengaluru</option>
                    <option value="adopter:2">Ananya Patel • Mumbai</option>
                    <option value="adopter:3">Karthik Raman • Chennai</option>
                    <option value="adopter:4">Sneha Mukherjee • Bengaluru</option>
                    <option value="adopter:5">Rohan Kapoor • Delhi</option>
                    <option value="adopter:6">Pooja Nair • Pune</option>
                  </optgroup>
                  <optgroup label="Shelter Officers (Caseworkers)">
                    <option value="staff:1">Dr. Rajesh Rao • Paws & Tails</option>
                    <option value="staff:2">Priya Menon • Paws & Tails</option>
                    <option value="staff:3">Vikram Deshmukh • Compassion</option>
                    <option value="staff:4">Kavita Sundaram • Safe Haven</option>
                    <option value="staff:5">Amit Verma • Tails of Joy</option>
                    <option value="staff:6">Sunita Kulkarni • PAWS</option>
                  </optgroup>
                </select>
                <User className="w-3 h-3 text-[#4B5250] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-[#4B5250] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reset Database Trigger */}
            <button
              type="button"
              onClick={onResetDb}
              aria-label="Reset database to seed records"
              title="Reset database to initial seed dataset"
              className="px-2.5 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] text-[#4B5250] hover:text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] transition-colors flex items-center space-x-1 cursor-pointer text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3 text-[#4B5250]" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}


