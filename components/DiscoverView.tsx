'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EnrichedPet, Breed, Adopter } from '@/lib/types';
import PetCard from '@/components/PetCard';
import SwipeDeck from '@/components/SwipeDeck';
import { 
  Search, 
  ChevronDown, 
  Layers, 
  LayoutGrid, 
  SearchX,
  Sparkles,
  Network
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
  const [engineMode, setEngineMode] = useState<'relational' | 'graph'>('relational');
  const [graphRecs, setGraphRecs] = useState<any[]>([]);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [breedFilter, setBreedFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch graph recommendations when adopter changes
  useEffect(() => {
    const fetchGraphRecs = async () => {
      if (!currentAdopter) return;
      setLoadingGraph(true);
      try {
        const res = await fetch(`/api/graph/recommendations?adopterId=${currentAdopter.adopter_id}`);
        const data = await res.json();
        setGraphRecs(data.recommendations || []);
      } catch (err) {
        console.error('Failed to load graph recommendations:', err);
      } finally {
        setLoadingGraph(false);
      }
    };
    fetchGraphRecs();
  }, [currentAdopter?.adopter_id]);

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

  // When engineMode === 'graph', rank and enrich pets with collaborative filtering graph scores
  const processedPets = useMemo(() => {
    if (engineMode === 'graph' && graphRecs.length > 0) {
      const recMap = new Map(graphRecs.map((r) => [r.petId, r]));

      const enriched = pets.map((p) => {
        const rec = recMap.get(p.pet_id);
        if (rec) {
          return {
            ...p,
            graphRecommendation: {
              matchScore: rec.matchScore,
              reason: rec.reason,
              graphTraversalPath: rec.graphTraversalPath,
            },
          };
        }
        return p;
      });

      return [...enriched].sort((a, b) => {
        const scoreA = a.graphRecommendation?.matchScore ?? 0;
        const scoreB = b.graphRecommendation?.matchScore ?? 0;
        return scoreB - scoreA;
      });
    }

    return pets;
  }, [pets, engineMode, graphRecs]);

  const displayedPets = processedPets.filter((p) => {
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
                  ? 'bg-[#FBBF24] text-[#14181A]'
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
                  ? 'bg-[#FBBF24] text-[#14181A]'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tactile deck</span>
            </button>
          </div>
        </div>
      </section>

      {/* Engine Switcher Bar & Graph Status */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] border border-[#DEDAD1] p-3 rounded-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#14181A]">Discovery Engine:</span>
          <div className="flex items-center space-x-1 p-0.5 bg-[#F3F1EA] border border-[#DEDAD1] rounded">
            <button
              type="button"
              onClick={() => setEngineMode('relational')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                engineMode === 'relational'
                  ? 'bg-[#FFFFFF] text-[#14181A] shadow-xs'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              Relational SQL
            </button>
            <button
              type="button"
              onClick={() => setEngineMode('graph')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
                engineMode === 'graph'
                  ? 'bg-[#FBBF24] text-[#14181A] shadow-xs'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Neo4j Graph Engine</span>
            </button>
          </div>
        </div>

        {engineMode === 'graph' ? (
          <div className="flex items-center space-x-1.5 text-xs text-[#92400E]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-semibold">Collaborative Filtering Active</span>
            <span className="text-[#4B5250] text-[11px] hidden md:inline">• Bipartite Walk</span>
          </div>
        ) : (
          <div className="text-xs text-[#4B5250]">
            Standard 3NF relational query filtering
          </div>
        )}
      </section>

      {/* Graph Engine Callout Banner when Active */}
      {engineMode === 'graph' && (
        <div className="bg-[#FEF9C3] border-l-4 border-l-[#F59E0B] p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#92400E]">
                Personalized Graph Affinity Rankings for {currentAdopter?.full_name || 'Rahul Sharma'}
              </span>
              <p className="text-xs text-[#78350F] leading-relaxed">
                Pets sorted by graph path recommendations using mutual swiped-right projections: (Adopter) ➔ [:SWIPED_RIGHT] ➔ (Shared) ➔ (Peer) ➔ [:SWIPED_RIGHT] ➔ (Rec).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-semibold rounded shrink-0 self-start sm:self-center">
            DA3 Recommendation Engine
          </span>
        </div>
      )}

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
                  ? 'bg-[#FBBF24] text-[#14181A]'
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
            className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded pl-9 pr-3 py-1.5 text-xs text-[#14181A] placeholder-[#4B5250]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] transition-colors"
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
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] cursor-pointer transition-colors"
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
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] cursor-pointer transition-colors"
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
              className="appearance-none text-xs font-medium bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] rounded pl-3 pr-7 py-1.5 text-[#14181A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] cursor-pointer transition-colors"
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


