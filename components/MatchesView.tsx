'use client';

import React from 'react';
import { EnrichedMatch, EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';
import { Heart, Building2, Clock, ArrowRight } from 'lucide-react';

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
    return (
      <div className="py-24 text-center text-[#4B5250] text-xs" aria-live="polite">
        <span>Loading mutual matches…</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="p-8 text-center bg-[#FFFFFF] border border-[#DEDAD1]">
          <div className="w-10 h-10 rounded-full bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center mx-auto mb-4 text-[#4B5250]">
            <Heart className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-[#14181A] mb-2">
            No mutual matches yet
          </h3>
          <p className="text-xs text-[#4B5250] leading-relaxed max-w-xs mx-auto">
            When you express interest in an animal and a shelter confirms compatibility, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-page-in space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEDAD1] pb-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#14181A] tracking-tight">
            Mutual matches
          </h1>
          <p className="text-sm text-[#4B5250] max-w-xl leading-relaxed">
            Verified matches between you and shelter companions. You can start an adoption application for any match below.
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-[#DEDAD1] pt-2 md:pt-0 md:pl-4 text-xs text-[#4B5250]">
          <span className="font-semibold text-[#14181A]">{matches.length} active match{matches.length === 1 ? '' : 'es'}</span>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.match_id}
            className="bg-[#FFFFFF] border border-[#DEDAD1] overflow-hidden flex flex-col justify-between hover:border-[#C9C4B8] transition-colors"
          >
            <div>
              {/* Pet Image Banner (Zero Border Radius) */}
              <button
                type="button"
                aria-label={`View record for ${match.pet.pet_name}`}
                onClick={() => onViewPet(match.pet)}
                className="relative aspect-[16/10] w-full text-left bg-[#14181A] overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer"
              >
                <img
                  src={match.pet.primary_photo}
                  alt={match.pet.pet_name}
                  className="w-full h-full object-cover quiet-image-hover"
                />
                <div className="absolute top-3 left-3 bg-[#14181A]/80 backdrop-blur-xs text-[#F3F1EA] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                  Match #{match.match_id}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      match.has_application
                        ? 'bg-[#B98A34] text-white'
                        : 'bg-[#3E6259] text-white'
                    }`}
                  >
                    {match.has_application ? 'Application active' : 'Ready to apply'}
                  </span>
                </div>
              </button>

              {/* Match Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <button
                    type="button"
                    onClick={() => onViewPet(match.pet)}
                    className="text-left font-serif text-2xl font-medium text-[#14181A] hover:text-[#3E6259] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer transition-colors"
                  >
                    {match.pet.pet_name}
                  </button>
                  <span className="text-xs font-semibold text-[#4B5250]">
                    {formatAge(match.pet.age_months)}
                  </span>
                </div>

                <p className="text-xs text-[#4B5250]">
                  {match.pet.breed_name}, {match.pet.size.toLowerCase()} size. {match.pet.gender.toLowerCase()}.
                </p>

                {match.pet.behaviour_desc && (
                  <p className="font-serif italic text-xs text-[#14181A] border-l-2 border-[#3E6259] pl-3 py-0.5 leading-relaxed">
                    "{match.pet.behaviour_desc}"
                  </p>
                )}

                <div className="text-[11px] text-[#4B5250] border-t border-[#DEDAD1] pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#4B5250] shrink-0" />
                    <span className="font-medium text-[#14181A] truncate">{match.pet.shelter_name}</span>
                  </div>
                  <span className="text-[11px] text-[#4B5250] shrink-0">
                    {match.pet.shelter_city}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-[#F3F1EA] border-t border-[#DEDAD1]">
              {match.has_application ? (
                <div className="w-full py-2 px-3 bg-[#FFFFFF] border border-[#B98A34]/40 text-[#14181A] text-xs font-medium flex items-center justify-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#B98A34]" />
                  <span>Application status: {match.application_status || 'Under review'}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onApply(match.pet, match.match_id)}
                  aria-label={`Start adoption application for ${match.pet.pet_name}`}
                  className="w-full py-2 px-3 rounded bg-[#3E6259] hover:bg-[#2E4A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Start adoption application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


