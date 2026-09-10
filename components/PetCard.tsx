'use client';

import React from 'react';
import { EnrichedPet } from '@/lib/types';
import { Check, ArrowRight, Building2, MapPin } from 'lucide-react';

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
  return (
    <article className="group bg-[#FFFFFF] border border-[#DEDAD1] overflow-hidden flex flex-col transition-colors hover:border-[#C9C4B8]">
      
      {/* 4:5 Photo Bleed Container (Zero Border Radius) */}
      <button 
        type="button"
        aria-label={`View record for ${pet.pet_name}`}
        className="relative aspect-[4/5] w-full overflow-hidden text-left bg-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer"
        onClick={() => onSelect(pet)}
      >
        <img
          src={pet.primary_photo}
          alt={pet.pet_name}
          className="w-full h-full object-cover quiet-image-hover"
          loading="lazy"
        />

        {/* Distance Badge Top Left (Rounded, Translucent Dark) */}
        <div className="absolute top-3 left-3 bg-[#14181A]/80 backdrop-blur-xs text-[#F3F1EA] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#DEDAD1]" />
          <span>{pet.approx_distance_km} km</span>
        </div>

        {/* Circular Verified Check Mark Top Right */}
        <div 
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3E6259] text-white flex items-center justify-center shadow-xs"
          title="Verified Shelter Record"
          aria-label="Verified record"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </button>

      {/* Companion Details Body (Clean & Editorial) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Pet Name in Fraunces Serif + Age in Sans on Same Line */}
          <div className="flex items-baseline justify-between gap-2">
            <button 
              type="button"
              onClick={() => onSelect(pet)}
              className="text-left font-serif text-2xl font-medium text-[#14181A] hover:text-[#3E6259] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] transition-colors cursor-pointer"
            >
              {pet.pet_name}
            </button>
            <span className="text-xs font-semibold text-[#4B5250] shrink-0">
              {formatAge(pet.age_months)}
            </span>
          </div>

          {/* Breed & Size Plain Sentence */}
          <p className="text-xs text-[#4B5250] leading-snug">
            {pet.breed_name}, {pet.size.toLowerCase()} size. {pet.gender.toLowerCase()}.
          </p>

          {/* Italic Behavioral Pull-Quote in Fraunces */}
          {pet.behaviour_desc && (
            <p className="font-serif italic text-xs text-[#14181A] border-l-2 border-[#3E6259] pl-3 py-0.5 my-2 leading-relaxed">
              "{pet.behaviour_desc}"
            </p>
          )}

          {/* Shelter Credentials */}
          <div className="text-[11px] text-[#4B5250] flex items-center justify-between border-t border-[#DEDAD1] pt-3 mt-3">
            <div className="flex items-center space-x-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#4B5250] shrink-0" />
              <span className="font-medium text-[#14181A] truncate">{pet.shelter_name}</span>
            </div>
            <span className="text-[11px] text-[#4B5250] shrink-0">{pet.shelter_city}</span>
          </div>
        </div>

        {/* Footer Link & Actions */}
        <div className="pt-2 border-t border-[#DEDAD1] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelect(pet)}
            className="group/btn text-xs font-semibold text-[#3E6259] hover:text-[#2E4A43] flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259]"
          >
            <span>View record</span>
            <ArrowRight className="w-3.5 h-3.5 transform transition-transform duration-150 ease-out group-hover/btn:translate-x-[3px]" />
          </button>

          {showActions && pet.status === 'Available' && onSwipeRight && (
            <button
              type="button"
              onClick={() => onSwipeRight(pet.pet_id)}
              className="text-xs px-3 py-1 bg-[#3E6259] hover:bg-[#2E4A43] text-white font-medium rounded transition-colors cursor-pointer"
            >
              Express interest
            </button>
          )}
        </div>

      </div>
    </article>
  );
}


