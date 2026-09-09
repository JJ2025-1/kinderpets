'use client';

import React from 'react';
import { EnrichedMatch, EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';

interface MatchesViewProps {
  matches: EnrichedMatch[];
  loading: boolean;
  onApply: (pet: EnrichedPet, matchId: number) => void;
  onViewPet: (pet: EnrichedPet) => void;
}

export default function MatchesView({
  matches,
  loading,
  onApply,
  onViewPet,
}: MatchesViewProps) {
  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading your matches...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 my-8">
        <span className="text-5xl block mb-3">💔</span>
        <h3 className="text-xl font-bold text-slate-800 mb-1">No Matches Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
          Swipe right (❤️ Interested) on pets in the Discover feed to generate matches here!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <span>💖 Your Pet Matches</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
            {matches.length} Total
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Mutual interest recorded in the <code className="font-mono text-rose-600">MATCH</code> table. Submit an application to schedule a home visit!
        </p>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.match_id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Pet Image Banner */}
              <div
                onClick={() => onViewPet(match.pet)}
                className="relative h-48 w-full cursor-pointer bg-slate-100 overflow-hidden group"
              >
                <img
                  src={match.pet.primary_photo}
                  alt={match.pet.pet_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                  Match #{match.match_id}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      match.has_application
                        ? 'bg-amber-500 text-white'
                        : match.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {match.has_application ? 'Application Submitted' : match.status}
                  </span>
                </div>
              </div>

              {/* Match Card Body */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    onClick={() => onViewPet(match.pet)}
                    className="text-xl font-bold text-slate-900 hover:text-rose-600 cursor-pointer transition-colors"
                  >
                    {match.pet.pet_name}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {formatAge(match.pet.age_months)}
                  </span>
                </div>

                <p className="text-xs font-semibold text-rose-500 mb-2">
                  {match.pet.species === 'Dog' ? '🐶' : '🐱'} {match.pet.breed_name} • {match.pet.size}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  "{match.pet.behaviour_desc}"
                </p>

                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span>🏠 {match.pet.shelter_name}</span>
                  <span className="text-indigo-600 font-semibold">📍 {match.pet.shelter_city}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              {match.has_application ? (
                <div className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center flex items-center justify-center space-x-1">
                  <span>⏳</span>
                  <span>Review Status: {match.application_status || 'Pending'}</span>
                </div>
              ) : (
                <button
                  onClick={() => onApply(match.pet, match.match_id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>📋</span>
                  <span>Apply for Adoption</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
