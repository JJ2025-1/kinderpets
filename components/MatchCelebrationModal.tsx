'use client';

import React from 'react';
import { EnrichedPet } from '@/lib/types';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-rose-500 via-pink-600 to-slate-900 rounded-3xl overflow-hidden shadow-2xl p-6 text-white text-center">
        {/* Animated Celebration Hearts */}
        <div className="text-5xl animate-bounce mb-2">🎉</div>

        <h2 className="text-3xl font-black tracking-tight mb-1 text-white drop-shadow-sm">
          It's a Match!
        </h2>
        <p className="text-sm text-rose-100 mb-6">
          You and <span className="font-bold underline">{pet.pet_name}</span> showed mutual interest!
        </p>

        {/* Pet Avatar Circle */}
        <div className="relative mx-auto w-36 h-36 rounded-full p-1.5 bg-white/30 backdrop-blur-md mb-6 shadow-inner">
          <img
            src={pet.primary_photo}
            alt={pet.pet_name}
            className="w-full h-full object-cover rounded-full shadow-lg"
          />
          <div className="absolute bottom-1 right-2 text-2xl">❤️</div>
        </div>

        {/* Details snippet */}
        <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md mb-6 text-xs text-rose-100">
          <p className="font-semibold text-white text-sm">{pet.pet_name}</p>
          <p>{pet.breed_name} • {pet.shelter_name}</p>
          <p className="text-slate-300 mt-1">📍 {pet.shelter_city} ({pet.approx_distance_km} km away)</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onApply(pet);
            }}
            className="w-full py-3 px-4 rounded-xl bg-white text-rose-600 font-bold text-sm shadow-lg hover:bg-rose-50 active:scale-95 transition-all"
          >
            📋 Apply for Adoption Now
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md transition-all"
          >
            Keep Exploring Pets
          </button>
        </div>
      </div>
    </div>
  );
}
