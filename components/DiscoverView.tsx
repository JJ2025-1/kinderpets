'use client';

import React, { useState } from 'react';
import { EnrichedPet, Breed, Adopter } from '@/lib/types';
import PetCard from './PetCard';
import SwipeDeck from './SwipeDeck';

interface DiscoverViewProps {
  pets: EnrichedPet[];
  allBreeds: Breed[];
  currentAdopter: Adopter | null;
  loading: boolean;
  onSwipeLeft: (petId: number) => void;
  onSwipeRight: (petId: number) => void;
  onViewDetails: (pet: EnrichedPet) => void;
  onFilterChange: (filters: {
    species: string;
    breed: string;
    size: string;
    maxDistanceKm?: number;
  }) => void;
  onResetSwipes: () => void;
}

export default function DiscoverView({
  pets,
  allBreeds,
  currentAdopter,
  loading,
  onSwipeLeft,
  onSwipeRight,
  onViewDetails,
  onFilterChange,
  onResetSwipes,
}: DiscoverViewProps) {
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [breedFilter, setBreedFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');

  const filteredBreeds = allBreeds.filter((b) =>
    speciesFilter === 'All' ? true : b.species === speciesFilter
  );

  const handleSpeciesChange = (val: string) => {
    setSpeciesFilter(val);
    setBreedFilter('All');
    onFilterChange({
      species: val,
      breed: 'All',
      size: sizeFilter,
      maxDistanceKm: distanceFilter === 'nearby' ? 50 : undefined,
    });
  };

  const handleBreedChange = (val: string) => {
    setBreedFilter(val);
    onFilterChange({
      species: speciesFilter,
      breed: val,
      size: sizeFilter,
      maxDistanceKm: distanceFilter === 'nearby' ? 50 : undefined,
    });
  };

  const handleSizeChange = (val: string) => {
    setSizeFilter(val);
    onFilterChange({
      species: speciesFilter,
      breed: breedFilter,
      size: val,
      maxDistanceKm: distanceFilter === 'nearby' ? 50 : undefined,
    });
  };

  const handleDistanceChange = (val: string) => {
    setDistanceFilter(val);
    onFilterChange({
      species: speciesFilter,
      breed: breedFilter,
      size: sizeFilter,
      maxDistanceKm: val === 'nearby' ? 50 : undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-200">
              📍 Current City: {currentAdopter?.city || 'Bangalore'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {pets.length} available companions found
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Discover Pets Near You
          </h1>
        </div>

        {/* View Mode Switcher (Deck vs Grid) */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('deck')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'deck'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🃏</span>
            <span>Tinder Swipe</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔲</span>
            <span>Browse Grid</span>
          </button>
        </div>
      </div>

      {/* Discovery Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Species */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Species
            </label>
            <select
              value={speciesFilter}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="All">All Species (Dogs & Cats)</option>
              <option value="Dog">🐶 Dogs Only</option>
              <option value="Cat">🐱 Cats Only</option>
            </select>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Breed
            </label>
            <select
              value={breedFilter}
              onChange={(e) => handleBreedChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="All">All Breeds</option>
              {filteredBreeds.map((b) => (
                <option key={b.breed_name} value={b.breed_name}>
                  {b.breed_name}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Size
            </label>
            <select
              value={sizeFilter}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="All">All Sizes</option>
              <option value="Small">Small (Lap & Toy)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="Large">Large (Active)</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Location / Radius
            </label>
            <select
              value={distanceFilter}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="all">Anywhere in India</option>
              <option value="nearby">📍 Nearby (Within 50 km)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area: Swipe Deck or Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading pet profiles...</div>
      ) : viewMode === 'deck' ? (
        <SwipeDeck
          pets={pets}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          onViewDetails={onViewDetails}
          onResetSwipes={onResetSwipes}
        />
      ) : (
        <div>
          {pets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="font-bold text-slate-800">No pets match your filter criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Try broadening your species or size filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <PetCard
                  key={pet.pet_id}
                  pet={pet}
                  onSelect={onViewDetails}
                  onSwipeLeft={onSwipeLeft}
                  onSwipeRight={onSwipeRight}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
