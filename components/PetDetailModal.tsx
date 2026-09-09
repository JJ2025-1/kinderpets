'use client';

import React, { useState } from 'react';
import { EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
        >
          ✕
        </button>

        {/* Hero Photo Gallery */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={activePhoto}
            alt={pet.pet_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-medium mr-2">
                  {pet.species === 'Dog' ? '🐶 Canine' : '🐱 Feline'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                  {pet.status}
                </span>
                <h2 className="text-3xl font-extrabold mt-1">{pet.pet_name}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-300">📍 {pet.approx_distance_km} km away</p>
                <p className="text-xs text-slate-300">{pet.shelter_city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector (Conceptual Multi-photo PET_PHOTO support) */}
        {pet.photos.length > 1 && (
          <div className="flex items-center space-x-2 px-6 py-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1">Photos:</span>
            {pet.photos.map((photo, idx) => (
              <button
                key={photo.photo_id || idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activePhotoIdx === idx ? 'border-rose-500 ring-2 ring-rose-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          {/* Key Traits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Breed</span>
              <span className="text-sm font-bold text-slate-900">{pet.breed_name}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Gender</span>
              <span className="text-sm font-bold text-slate-900">{pet.gender}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Age</span>
              <span className="text-sm font-bold text-slate-900">{formatAge(pet.age_months)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Size Category</span>
              <span className="text-sm font-bold text-slate-900">{pet.size}</span>
            </div>
          </div>

          {/* Behavior Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <span>🎭</span>
              <span>Temperament & Behaviour</span>
            </h4>
            <p className="text-sm text-slate-600 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
              {pet.behaviour_desc || 'Very friendly, sociable, and affectionate companion.'}
            </p>
          </div>

          {/* Lifestyle Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <span>🏡</span>
              <span>Ideal Home & Lifestyle</span>
            </h4>
            <p className="text-sm text-slate-600 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
              {pet.lifestyle_desc || 'Suitable for apartments and family environments.'}
            </p>
          </div>

          {/* Shelter Details (SHELTER Table) */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <span>🏥</span>
              <span>Shelter Information</span>
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1 sm:space-y-0">
              <div>
                <p className="font-bold text-slate-900 text-sm">{pet.shelter_name}</p>
                <p>Location: {pet.shelter_city} • Approx {pet.approx_distance_km} km away</p>
              </div>
              <div className="sm:text-right">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-500">
                  ID: #{pet.shelter_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-3">
            {isMatched ? (
              <button
                onClick={() => {
                  onClose();
                  onApply && onApply(pet);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:from-rose-600 hover:to-pink-600 transition-all flex items-center space-x-1.5"
              >
                <span>📋</span>
                <span>Submit Adoption Application</span>
              </button>
            ) : (
              <>
                {onSwipeLeft && (
                  <button
                    onClick={() => {
                      onClose();
                      onSwipeLeft(pet.pet_id);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors"
                  >
                    ❌ Pass
                  </button>
                )}
                {onSwipeRight && (
                  <button
                    onClick={() => {
                      onClose();
                      onSwipeRight(pet.pet_id);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    ❤️ Interested
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
