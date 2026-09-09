'use client';

import React from 'react';
import { EnrichedPet } from '@/lib/types';

interface PetCardProps {
  pet: EnrichedPet;
  onSelect: (pet: EnrichedPet) => void;
  onSwipeLeft?: (petId: number) => void;
  onSwipeRight?: (petId: number) => void;
  showActions?: boolean;
}

export function formatAge(months: number): string {
  if (months < 12) {
    return `${months} mo${months === 1 ? '' : 's'}`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) {
    return `${years} yr${years === 1 ? '' : 's'}`;
  }
  return `${years}y ${remMonths}m`;
}

export default function PetCard({
  pet,
  onSelect,
  onSwipeLeft,
  onSwipeRight,
  showActions = true,
}: PetCardProps) {
  const genderIcon = pet.gender === 'Male' ? '♂' : pet.gender === 'Female' ? '♀' : '⚧';
  const genderColor =
    pet.gender === 'Male' ? 'text-blue-600 bg-blue-50' : 'text-pink-600 bg-pink-50';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div 
        className="relative h-64 sm:h-72 w-full overflow-hidden cursor-pointer bg-slate-100"
        onClick={() => onSelect(pet)}
      >
        <img
          src={pet.primary_photo}
          alt={pet.pet_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
          <span>📍</span>
          <span>{pet.approx_distance_km} km away</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
              pet.status === 'Available'
                ? 'bg-emerald-500 text-white'
                : pet.status === 'Pending'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {pet.status}
          </span>
        </div>

        {/* Photo count indicator */}
        {pet.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center space-x-1">
            <span>📷</span>
            <span>{pet.photos.length} photos</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Name & Gender */}
          <div className="flex items-center justify-between mb-1.5">
            <h3 
              onClick={() => onSelect(pet)}
              className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors cursor-pointer"
            >
              {pet.pet_name}
            </h3>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${genderColor}`}>
              {genderIcon} {pet.gender}
            </span>
          </div>

          {/* Breed & Species Tag */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              {pet.species === 'Dog' ? '🐶' : '🐱'} {pet.breed_name}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-medium">
              ⏳ {formatAge(pet.age_months)}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
              📏 {pet.size}
            </span>
          </div>

          {/* Behaviour Excerpt */}
          {pet.behaviour_desc && (
            <p className="text-xs text-slate-600 line-clamp-2 mb-3">
              "{pet.behaviour_desc}"
            </p>
          )}

          {/* Shelter & City */}
          <div className="text-xs text-slate-500 flex items-center space-x-1 border-t border-slate-100 pt-2.5">
            <span>🏠</span>
            <span className="font-medium text-slate-700">{pet.shelter_name}</span>
            <span>•</span>
            <span>{pet.shelter_city}</span>
          </div>
        </div>

        {/* Action Buttons for Discover Grid */}
        {showActions && pet.status === 'Available' && (
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSwipeLeft && onSwipeLeft(pet.pet_id)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center space-x-1"
            >
              <span>❌</span>
              <span>Pass</span>
            </button>
            <button
              onClick={() => onSwipeRight && onSwipeRight(pet.pet_id)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1"
            >
              <span>❤️</span>
              <span>Interested</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
