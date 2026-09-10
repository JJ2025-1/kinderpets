'use client';

import React, { useState } from 'react';
import { EnrichedPet, Breed, Adopter } from '@/lib/types';
import PetCard from '@/components/PetCard';
import SwipeDeck from '@/components/SwipeDeck';
import { 
  Search, 
  ChevronDown, 
  Layers, 
  LayoutGrid, 
  SearchX
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'deck'>('grid');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [breedFilter, setBreedFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const displayedPets = pets.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.pet_name.toLowerCase().includes(query) ||
      p.breed_name.toLowerCase().includes(query) ||
      p.shelter_name.toLowerCase().includes(query) ||
      p.shelter_city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-page-in space-y-8">
      
      {/* Asymmetric Hero: Large Serif Headline + Single Real Statistic */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-b border-[#DEDAD1] pb-8">
        <div className="md:col-span-7 space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#14181A] tracking-tight leading-[1.15] max-w-md">
            Meet the animals who need a home.
          </h1>
          <p className="text-sm text-[#4B5250] max-w-lg leading-relaxed">
            Direct records from certified shelters in {currentAdopter?.city || 'Bengaluru'} and nationwide. Every profile is verified by shelter staff.
          </p>
        </div>

        <div className="md:col-span-5 flex flex-col md:items-end justify-between space-y-4">
          {/* Statistic with plain language label under hairline rule */}
          <div className="w-full max-w-xs border-t border-[#DEDAD1] pt-3 text-left md:text-right">
            <span className="font-serif text-3xl font-medium text-[#14181A] block tabular-nums">
              {pets.length}
            </span>
            <span className="text-xs text-[#4B5250] block mt-0.5">
              animals currently in care across 6 verified shelters
            </span>
          </div>

          {/* View Mode Switcher */}
          <div 
            className="flex items-center space-x-1 p-0.5 bg-[#FFFFFF] border border-[#DEDAD1] rounded self-start md:self-end" 
            role="group" 
            aria-label="View Mode Switcher"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Switch to grid view"
              aria-pressed={viewMode === 'grid'}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-tight transition-colors flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#3E6259] text-white'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid view</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('deck')}
              aria-label="Switch to deck swipe view"
              aria-pressed={viewMode === 'deck'}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-tight transition-colors flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'deck'
                  ? 'bg-[#3E6259] text-white'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tactile deck</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Row (Bordered Rectangles with 4px Radius) */}
      <section 
        className="bg-[#FFFFFF] border border-[#DEDAD1] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" 
        aria-label="Filter companions"
      >
        {/* Species Segmented Toggle (4px radius) */}
        <div className="flex items-center space-x-1 p-0.5 bg-[#F3F1EA] border border-[#DEDAD1] rounded self-start">
          {['All', 'Dog', 'Cat'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeciesChange(s)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                speciesFilter === s
                  ? 'bg-[#3E6259] text-white'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              {s === 'All' ? 'All species' : s === 'Dog' ? 'Dogs' : 'Cats'}
            </button>
          ))}
        </div>

        {/* Search Input (4px radius) */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#4B5250] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, breed, or shelter…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded pl-9 pr-3 py-1.5 text-xs text-[#14181A] placeholder-[#4B5250]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] transition-colors"
          />
        </div>

        {/* Two Dropdown Style Filters (4px radius) */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Breed Select */}
          <div className="relative">
            <select
              id="filter-breed"
              aria-label="Filter by breed"
              value={breedFilter}
              onChange={(e) => handleBreedChange(e.target.value)}
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer transition-colors"
            >
              <option value="All">All breeds</option>
              {filteredBreeds.map((b) => (
                <option key={b.breed_name} value={b.breed_name}>
                  {b.breed_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Size Select */}
          <div className="relative">
            <select
              id="filter-size"
              aria-label="Filter by size"
              value={sizeFilter}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer transition-colors"
            >
              <option value="All">All sizes</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra large</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Radius Select */}
          <div className="relative">
            <select
              id="filter-distance"
              aria-label="Filter by distance"
              value={distanceFilter}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E6259] cursor-pointer transition-colors"
            >
              <option value="all">All locations</option>
              <option value="nearby">Nearby (within 50 km)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 text-center text-[#4B5250] text-xs" aria-live="polite">
          <span>Loading animal records…</span>
        </div>
      ) : viewMode === 'deck' ? (
        <SwipeDeck
          pets={displayedPets}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          onViewDetails={onViewDetails}
          onResetSwipes={onResetSwipes}
        />
      ) : (
        <div>
          {displayedPets.length === 0 ? (
            <div className="text-center py-20 bg-[#FFFFFF] border border-[#DEDAD1] max-w-lg mx-auto p-8">
              <div className="w-10 h-10 rounded-full bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center mx-auto mb-3 text-[#4B5250]">
                <SearchX className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-medium text-[#14181A]">No animals matched</p>
              <p className="text-xs text-[#4B5250] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Try widening your species, breed, or location filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedPets.map((pet) => (
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


