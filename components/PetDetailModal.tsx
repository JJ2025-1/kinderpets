'use client';

import React, { useState, useEffect } from 'react';
import { EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';
import { 
  X, 
  MapPin, 
  Building2, 
  Check, 
  ArrowRight,
  Heart,
  Bookmark
} from 'lucide-react';

interface PetDetailModalProps {
  pet: EnrichedPet;
  onClose: () => void;
  onSwipeLeft?: (petId: number) => void;
  onSwipeRight?: (petId: number) => void;
  isMatched?: boolean;
  onApply?: (pet: EnrichedPet) => void;
}

export default function PetDetailModal({
  pet,
  onClose,
  onSwipeLeft,
  onSwipeRight,
  isMatched,
  onApply,
}: PetDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const activePhoto = pet.photos[activePhotoIdx]?.photo_url || pet.primary_photo;

  // ESC key listener
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#14181A]/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pet-modal-title"
    >
      {/* 14px Rounded Modal Dialog (The only element with corner rounding) */}
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] rounded-[14px] overflow-hidden shadow-xl my-6 border border-[#DEDAD1] animate-modal-in">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close record"
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-[#14181A]/70 hover:bg-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* 50/50 Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Full-Bleed Media Gallery */}
          <div className="md:col-span-6 bg-[#14181A] relative flex flex-col justify-between min-h-[340px] md:min-h-[540px]">
            <div className="relative flex-1 w-full overflow-hidden">
              <img
                src={activePhoto}
                alt={pet.pet_name}
                className="w-full h-full object-cover"
              />

              {/* Distance Pill Top Left */}
              <div className="absolute top-4 left-4 bg-[#14181A]/80 backdrop-blur-xs text-[#F3F1EA] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#DEDAD1]" />
                <span>{pet.approx_distance_km} km away</span>
              </div>
            </div>

            {/* Thin Progress / Thumbnail Selector Strip */}
            {pet.photos.length > 1 && (
              <div className="p-3 bg-[#14181A]/80 border-t border-[#DEDAD1]/20 flex items-center space-x-2 overflow-x-auto z-10" aria-label="Photo thumbnails">
                {pet.photos.map((photo, idx) => (
                  <button
                    key={photo.photo_id || idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className={`w-10 h-10 overflow-hidden border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] transition-opacity shrink-0 cursor-pointer ${
                      activePhotoIdx === idx ? 'border-white opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Structured Record Content */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#FFFFFF] space-y-6">
            <div className="space-y-5">
              
              {/* Name & Meta Row */}
              <div className="space-y-1 border-b border-[#DEDAD1] pb-4">
                <h2 id="pet-modal-title" className="font-serif text-3xl sm:text-4xl font-medium text-[#14181A] tracking-tight">
                  {pet.pet_name}
                </h2>
                <p className="text-xs text-[#4B5250]">
                  {pet.breed_name} • {formatAge(pet.age_months)} • {pet.gender} • {pet.size}
                </p>
              </div>

              {/* Health Checklist (Plain Rows, Not Chips) */}
              <div className="space-y-2 border-b border-[#DEDAD1] pb-4">
                <span className="text-xs font-semibold text-[#14181A] block">
                  Health & Medical Verification
                </span>
                <div className="space-y-1.5 text-xs text-[#4B5250]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#B45309] stroke-[2.5]" />
                    <span>Vaccinated — Confirmed by veterinarian</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#B45309] stroke-[2.5]" />
                    <span>Neutered / Spayed — Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#B45309] stroke-[2.5]" />
                    <span>Microchipped — Registered in sanctuary database</span>
                  </div>
                </div>
              </div>

              {/* Behavioral Notes: Italic Pull-Quote in Fraunces */}
              {pet.behaviour_desc && (
                <div className="space-y-1.5 border-b border-[#DEDAD1] pb-4">
                  <span className="text-xs font-semibold text-[#14181A] block">
                    Temperament & Behaviour
                  </span>
                  <p className="font-serif italic text-xs text-[#14181A] border-l-2 border-[#FBBF24] pl-3 py-0.5 leading-relaxed">
                    "{pet.behaviour_desc}"
                  </p>
                </div>
              )}

              {/* Lifestyle / Housing */}
              {pet.lifestyle_desc && (
                <div className="space-y-1 border-b border-[#DEDAD1] pb-4">
                  <span className="text-xs font-semibold text-[#14181A] block">
                    Ideal Home Environment
                  </span>
                  <p className="text-xs text-[#4B5250] leading-relaxed">
                    {pet.lifestyle_desc}
                  </p>
                </div>
              )}

              {/* Bordered Shelter Credential Box */}
              <div className="p-3.5 bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#14181A]">{pet.shelter_name}</p>
                  <p className="text-[11px] text-[#4B5250] mt-0.5">
                    Location: {pet.shelter_city} • Shelter License #{pet.shelter_id}
                  </p>
                </div>
                <Building2 className="w-4 h-4 text-[#4B5250] shrink-0" />
              </div>

            </div>

            {/* Action Bar (Active Voice Buttons) */}
            <div className="pt-4 border-t border-[#DEDAD1] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                aria-label="Save for later"
                className="px-3.5 py-2 rounded border border-[#DEDAD1] bg-[#FFFFFF] hover:bg-[#F3F1EA] text-[#4B5250] hover:text-[#14181A] text-xs font-medium transition-colors cursor-pointer"
              >
                Save for later
              </button>

              <div className="flex items-center space-x-2">
                {isMatched ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onApply) onApply(pet);
                    }}
                    aria-label={`Start adoption application for ${pet.pet_name}`}
                    className="px-4 py-2 rounded bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Start adoption application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    {onSwipeRight && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSwipeRight(pet.pet_id);
                        }}
                        aria-label={`Express interest in ${pet.pet_name}`}
                        className="px-4 py-2 rounded bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-[#14181A] text-[#14181A]" />
                        <span>Express interest</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}


