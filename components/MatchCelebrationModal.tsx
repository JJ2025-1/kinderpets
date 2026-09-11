'use client';

import React, { useEffect } from 'react';
import { EnrichedPet } from '@/lib/types';
import { Sparkles, Heart, ShieldCheck, ClipboardList, ArrowRight, X, MapPin } from 'lucide-react';

interface MatchCelebrationModalProps {
  pet: EnrichedPet;
  onClose: () => void;
  onApply: (pet: EnrichedPet) => void;
}

export default function MatchCelebrationModal({
  pet,
  onClose,
  onApply,
}: MatchCelebrationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181A]/60 backdrop-blur-sm animate-modal-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
    >
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-[#DEDAD1] rounded-[14px] overflow-hidden shadow-xl p-7 text-center">
        
        {/* Dismiss X button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss celebration"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DEDAD1] bg-[#F3F1EA] hover:bg-[#DEDAD1] text-[#14181A] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm bg-[#FBBF24]/20 border border-[#FBBF24] text-[#B45309] text-[11px] font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mutual connection</span>
        </div>

        <h2 id="match-modal-title" className="font-serif text-3xl font-medium tracking-tight mb-2 text-[#14181A]">
          It's a match.
        </h2>
        <p className="text-xs text-[#4B5250] mb-6 leading-relaxed">
          Mutual interest recorded. You and <span className="font-semibold text-[#14181A]">{pet.pet_name}</span> are compatible.
        </p>

        {/* Pet Avatar */}
        <div className="relative mx-auto w-32 h-32 rounded-full p-1 border-2 border-[#FBBF24] mb-5">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#F3F1EA]">
            <img
              src={pet.primary_photo}
              alt={pet.pet_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FBBF24] text-[#14181A] flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 fill-[#14181A] stroke-[1.5]" />
          </div>
        </div>

        {/* Details snippet */}
        <div className="bg-[#F3F1EA] border border-[#DEDAD1] p-3 mb-6 text-xs text-[#14181A]">
          <p className="font-serif text-lg font-medium text-[#14181A]">{pet.pet_name}</p>
          <p className="text-[11px] text-[#4B5250] mt-0.5">{pet.species} • {pet.breed_name}</p>
          <div className="flex items-center justify-center space-x-1 text-[#4B5250] mt-1.5 text-[11px]">
            <MapPin className="w-3 h-3 text-[#B45309]" />
            <span>{pet.shelter_name} ({pet.shelter_city})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(pet);
            }}
            aria-label={`Submit adoption application for ${pet.pet_name}`}
            className="w-full py-2.5 px-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] font-semibold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Start adoption application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            onClick={onClose}
            aria-label="Keep exploring other companions"
            className="w-full py-2 px-4 border border-[#DEDAD1] bg-[#FFFFFF] text-[#4B5250] hover:text-[#14181A] font-medium text-xs transition-colors cursor-pointer"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

