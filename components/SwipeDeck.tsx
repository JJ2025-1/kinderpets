'use client';

import React, { useState, useEffect } from 'react';
import { EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';

interface SwipeDeckProps {
  pets: EnrichedPet[];
  onSwipeLeft: (petId: number) => void;
  onSwipeRight: (petId: number) => void;
  onViewDetails: (pet: EnrichedPet) => void;
  onResetSwipes: () => void;
}

export default function SwipeDeck({
  pets,
  onSwipeLeft,
  onSwipeRight,
  onViewDetails,
  onResetSwipes,
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pets.length === 0 || currentIndex >= pets.length) return;
      if (e.key === 'ArrowLeft') {
        handleSwipe('LEFT');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('RIGHT');
      } else if (e.key === 'ArrowUp' || e.key === ' ') {
        onViewDetails(pets[currentIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, pets]);

  const handleSwipe = (direction: 'LEFT' | 'RIGHT') => {
    if (currentIndex >= pets.length) return;
    const pet = pets[currentIndex];

    setSwipeDirection(direction === 'LEFT' ? 'left' : 'right');
    setTimeout(() => {
      if (direction === 'LEFT') {
        onSwipeLeft(pet.pet_id);
      } else {
        onSwipeRight(pet.pet_id);
      }
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 250);
  };

  if (pets.length === 0 || currentIndex >= pets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 max-w-md mx-auto my-8">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl mb-4">
          🎉
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">You've Swiped All Nearby Pets!</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          Check out your <b>Matches</b> to submit adoption applications, or reset to swipe through profiles again.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            onResetSwipes();
          }}
          className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-200 transition-all flex items-center space-x-2"
        >
          <span>↺</span>
          <span>Explore Pets Again</span>
        </button>
      </div>
    );
  }

  const currentPet = pets[currentIndex];
  const nextPet = currentIndex + 1 < pets.length ? pets[currentIndex + 1] : null;

  return (
    <div className="max-w-md mx-auto px-4 py-4 select-none">
      {/* Deck Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3 px-1">
        <span>
          Showing <b>{currentIndex + 1}</b> of <b>{pets.length}</b> pets nearby
        </span>
        <span className="hidden sm:inline bg-slate-100 px-2 py-0.5 rounded-md">
          Press ← Skip | → Like | ↑ Info
        </span>
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[480px] sm:h-[530px] w-full">
        {/* Next Card in Stack (Peek background) */}
        {nextPet && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 scale-95 translate-y-3 opacity-60 pointer-events-none transition-all">
            <img
              src={nextPet.primary_photo}
              alt={nextPet.pet_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Current Active Card */}
        <div
          className={`absolute inset-0 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl transition-all duration-300 transform ${
            swipeDirection === 'left'
              ? '-translate-x-48 -rotate-12 opacity-0'
              : swipeDirection === 'right'
              ? 'translate-x-48 rotate-12 opacity-0'
              : 'translate-x-0 rotate-0 opacity-100'
          }`}
        >
          <img
            src={currentPet.primary_photo}
            alt={currentPet.pet_name}
            className="w-full h-full object-cover"
          />

          {/* Swipe Indicator Overlays */}
          {swipeDirection === 'right' && (
            <div className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-4 py-1.5 rounded-2xl rotate-[-15deg] bg-white/40 backdrop-blur-xs">
              INTERESTED
            </div>
          )}
          {swipeDirection === 'left' && (
            <div className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-black text-3xl px-4 py-1.5 rounded-2xl rotate-[15deg] bg-white/40 backdrop-blur-xs">
              PASS
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5">
              <span>📍</span>
              <span>{currentPet.approx_distance_km} km away</span>
            </div>
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              Available
            </div>
          </div>

          {/* Bottom Gradient & Info Details */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-24 pb-6 px-6 text-white">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
                  <span>{currentPet.pet_name}</span>
                  <span className="text-xl font-normal text-slate-300">
                    {formatAge(currentPet.age_months)}
                  </span>
                </h2>
                <p className="text-sm font-medium text-rose-300 flex items-center space-x-1">
                  <span>{currentPet.species === 'Dog' ? '🐶' : '🐱'}</span>
                  <span>{currentPet.breed_name}</span>
                  <span>•</span>
                  <span>{currentPet.gender}</span>
                  <span>•</span>
                  <span>{currentPet.size}</span>
                </p>
              </div>

              <button
                onClick={() => onViewDetails(currentPet)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all"
                title="View full pet details"
              >
                ℹ️
              </button>
            </div>

            {currentPet.behaviour_desc && (
              <p className="text-xs text-slate-200 line-clamp-2 mb-3">
                "{currentPet.behaviour_desc}"
              </p>
            )}

            <div className="text-xs text-slate-300 flex items-center space-x-1.5">
              <span>🏠</span>
              <span className="font-semibold text-white">{currentPet.shelter_name}</span>
              <span>({currentPet.shelter_city})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Action Buttons */}
      <div className="flex items-center justify-center space-x-6 mt-6">
        {/* Pass / Skip (LEFT) */}
        <button
          onClick={() => handleSwipe('LEFT')}
          disabled={swipeDirection !== null}
          className="w-16 h-16 rounded-full bg-white border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-500 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-2xl"
          title="Pass / Skip (Left Swipe)"
        >
          ❌
        </button>

        {/* Info button */}
        <button
          onClick={() => onViewDetails(currentPet)}
          className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg"
          title="More Information"
        >
          🔍
        </button>

        {/* Interested (RIGHT) */}
        <button
          onClick={() => handleSwipe('RIGHT')}
          disabled={swipeDirection !== null}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-3xl"
          title="Express Interest (Right Swipe / Match)"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}
