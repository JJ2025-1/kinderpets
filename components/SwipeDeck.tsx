'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EnrichedPet } from '@/lib/types';
import { formatAge } from './PetCard';
import { 
  Heart, 
  X, 
  FileText, 
  MapPin, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Reset photo index when current card changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [currentIndex]);

  const handleSwipe = useCallback((direction: 'LEFT' | 'RIGHT') => {
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
      setDragOffset({ x: 0, y: 0 });
    }, 240);
  }, [currentIndex, pets, onSwipeLeft, onSwipeRight]);

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = (e.clientY - dragStartRef.current.y) * 0.3; // dampen Y movement
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    setIsDragging(false);
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const elapsed = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(deltaX) / (elapsed || 1);

    // Dismiss if dragged past 110px or flicked with high velocity
    if (deltaX > 110 || (deltaX > 40 && velocity > 0.45)) {
      handleSwipe('RIGHT');
    } else if (deltaX < -110 || (deltaX < -40 && velocity > 0.45)) {
      handleSwipe('LEFT');
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
    }
    dragStartRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pets.length === 0 || currentIndex >= pets.length) return;
      if (e.key === 'ArrowLeft') {
        handleSwipe('LEFT');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('RIGHT');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onViewDetails(pets[currentIndex]);
      } else if (e.key === ' ') {
        e.preventDefault();
        const photos = pets[currentIndex]?.photos || [pets[currentIndex]?.primary_photo];
        setActivePhotoIndex((prev) => (prev + 1) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, pets, onViewDetails, handleSwipe]);

  if (pets.length === 0 || currentIndex >= pets.length) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="p-8 sm:p-10 text-center bg-[#FFFFFF] border border-[#DEDAD1]">
          <div className="w-12 h-12 rounded-full bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center mx-auto mb-4 text-[#3E6259]">
            <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="font-serif text-3xl font-medium tracking-tight text-[#14181A] mb-2">
            Sanctuary queue complete
          </h3>
          <p className="text-xs text-[#4B5250] leading-relaxed mb-6 max-w-xs mx-auto">
            You have evaluated all verified companions currently available in your sanctuary region.
          </p>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              onResetSwipes();
            }}
            aria-label="Restart companion discovery queue"
            className="px-4 py-2 bg-[#3E6259] hover:bg-[#2E4A43] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart discovery</span>
          </button>
        </div>
      </div>
    );
  }

  const currentPet = pets[currentIndex];
  const nextPet = currentIndex + 1 < pets.length ? pets[currentIndex + 1] : null;
  const currentPhotos: string[] = (currentPet.photos && currentPet.photos.length > 0)
    ? currentPet.photos.map((p) => typeof p === 'string' ? p : p.photo_url)
    : [currentPet.primary_photo];

  const rotationDeg = isDragging ? dragOffset.x * 0.08 : 0;
  const likeOpacity = Math.min(Math.max(dragOffset.x / 90, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragOffset.x / 90, 0), 1);

  return (
    <div className="max-w-md mx-auto px-4 py-2 select-none">
      
      {/* Header Census Strip */}
      <div className="flex items-center justify-between text-xs text-[#4B5250] mb-3 px-1">
        <span>
          Record <b className="text-[#14181A]">{currentIndex + 1}</b> of <b className="text-[#14181A]">{pets.length}</b>
        </span>
        <span className="hidden sm:inline bg-[#FFFFFF] border border-[#DEDAD1] px-2 py-0.5 text-[11px] text-[#4B5250]">
          [←] Skip • [→] Like • [Space] Photo • [↑] Dossier
        </span>
      </div>

      {/* Physical Tactile Card Stack */}
      <div className="relative h-[530px] sm:h-[570px] w-full">
        
        {/* Next Card in Stack (Depth Illusion) */}
        {nextPet && (
          <div 
            className="absolute inset-0 overflow-hidden bg-[#14181A] border border-[#DEDAD1] scale-[0.96] translate-y-3 opacity-50 pointer-events-none transition-transform duration-300"
            aria-hidden="true"
          >
            <img
              src={nextPet.primary_photo}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Current Active Swipable Card */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: swipeDirection === 'left'
              ? 'translateX(-120%) rotate(-18deg)'
              : swipeDirection === 'right'
              ? 'translateX(120%) rotate(18deg)'
              : `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotationDeg}deg)`,
            transition: isDragging ? 'none' : 'transform 0.25s var(--ease-out-expo), opacity 0.25s ease-out',
            touchAction: 'none',
          }}
          className={`absolute inset-0 overflow-hidden bg-[#14181A] border border-[#DEDAD1] shadow-lg cursor-grab active:cursor-grabbing ${
            swipeDirection ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Active Photo */}
          <img
            src={currentPhotos[activePhotoIndex]}
            alt={currentPet.pet_name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Vignette Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14181A] via-[#14181A]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none h-24" />

          {/* Story Bar Photo Indicators */}
          {currentPhotos.length > 1 && (
            <div className="absolute top-3 inset-x-3 flex items-center space-x-1.5 z-20 pointer-events-none">
              {currentPhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                    idx === activePhotoIndex
                      ? 'bg-white shadow-xs'
                      : 'bg-white/35'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Left/Right Photo Tap Zones */}
          {currentPhotos.length > 1 && (
            <div className="absolute inset-0 flex z-10">
              <button
                type="button"
                aria-label="Previous photograph"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
                }}
                className="w-1/3 h-2/3 cursor-pointer focus:outline-none"
              />
              <div className="w-1/3 h-2/3 pointer-events-none" />
              <button
                type="button"
                aria-label="Next photograph"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev + 1) % currentPhotos.length);
                }}
                className="w-1/3 h-2/3 cursor-pointer focus:outline-none"
              />
            </div>
          )}

          {/* Dynamic Drag Stamp Badges */}
          <div 
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-6 border-2 border-[#3E6259] bg-[#3E6259] text-white font-bold text-base px-4 py-1 rotate-[-10deg] tracking-wider uppercase pointer-events-none z-30 transition-opacity"
          >
            CONNECT
          </div>
          <div 
            style={{ opacity: nopeOpacity }}
            className="absolute top-10 right-6 border-2 border-[#A2453A] bg-[#A2453A] text-white font-bold text-base px-4 py-1 rotate-[10deg] tracking-wider uppercase pointer-events-none z-30 transition-opacity"
          >
            PASS
          </div>

          {/* Top Status Indicators */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="bg-[#14181A]/80 backdrop-blur-md text-white px-2.5 py-1 text-[11px] flex items-center space-x-1.5 border border-white/10">
              <MapPin className="w-3 h-3 text-[#3E6259]" />
              <span>{currentPet.approx_distance_km} km away</span>
            </div>
            <div className="bg-[#14181A]/80 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#3E6259]" />
              <span>Verified shelter</span>
            </div>
          </div>

          {/* Bottom Card Content & Editorial Typography */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white z-20 pointer-events-none">
            
            {/* Title & Age */}
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
                {currentPet.pet_name}
              </h2>
              <span className="text-xs text-[#F3F1EA] px-2 py-0.5 bg-white/10 border border-white/15">
                {formatAge(currentPet.age_months)}
              </span>
            </div>

            {/* Spec Pedigree Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs text-[#DEDAD1]">
              <span>{currentPet.species}</span>
              <span>•</span>
              <span>{currentPet.breed_name}</span>
              <span>•</span>
              <span>{currentPet.gender}</span>
              <span>•</span>
              <span>{currentPet.size}</span>
            </div>

            {/* Behaviour Quotation */}
            {currentPet.behaviour_desc && (
              <p className="text-xs text-[#DEDAD1] line-clamp-2 leading-relaxed mb-3 italic border-l-2 border-[#3E6259] pl-2.5">
                "{currentPet.behaviour_desc}"
              </p>
            )}

            {/* Shelter Facility */}
            <div className="text-xs text-[#DEDAD1]/80 flex items-center justify-between border-t border-white/10 pt-2.5">
              <div className="flex items-center space-x-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-white/60" />
                <span className="font-medium text-white truncate">{currentPet.shelter_name}</span>
              </div>
              <span className="text-[11px] text-[#DEDAD1]/80">{currentPet.shelter_city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center space-x-4 mt-6" role="toolbar" aria-label="Companion Action Controls">
        
        {/* Pass Action */}
        <button
          type="button"
          onClick={() => handleSwipe('LEFT')}
          disabled={swipeDirection !== null}
          aria-label={`Pass on ${currentPet.pet_name}`}
          className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#DEDAD1] hover:border-[#4B5250] hover:bg-[#F3F1EA] text-[#4B5250] hover:text-[#14181A] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
          title="Pass / Skip (Left arrow)"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Inspect Dossier Action */}
        <button
          type="button"
          onClick={() => onViewDetails(currentPet)}
          aria-label={`Inspect ${currentPet.pet_name} dossier`}
          className="px-4 py-2.5 bg-[#FFFFFF] border border-[#DEDAD1] hover:border-[#4B5250] text-[#14181A] text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
          title="Inspect Complete Clinical Dossier"
        >
          <FileText className="w-3.5 h-3.5 text-[#4B5250]" />
          <span>Inspect dossier</span>
        </button>

        {/* Connect Action */}
        <button
          type="button"
          onClick={() => handleSwipe('RIGHT')}
          disabled={swipeDirection !== null}
          aria-label={`Express interest in ${currentPet.pet_name}`}
          className="w-12 h-12 rounded-full bg-[#3E6259] hover:bg-[#2E4A43] text-white transition-colors flex items-center justify-center cursor-pointer shadow-xs"
          title="Connect / Express Interest (Right arrow)"
        >
          <Heart className="w-5 h-5 fill-white stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}

