'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import DiscoverView from '@/components/DiscoverView';
import MatchesView from '@/components/MatchesView';
import ApplicationsView from '@/components/ApplicationsView';
import ShelterDashboard from '@/components/ShelterDashboard';
import SqlLab from '@/components/SqlLab';
import PetDetailModal from '@/components/PetDetailModal';
import MatchCelebrationModal from '@/components/MatchCelebrationModal';
import ApplicationModal from '@/components/ApplicationModal';
import {
  EnrichedPet,
  EnrichedMatch,
  EnrichedApplication,
  Shelter,
  Breed,
  ShelterStaff,
  Adopter,
} from '@/lib/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    'discover' | 'matches' | 'applications' | 'shelter' | 'sqllab'
  >('discover');

  // User switcher state
  const [currentRole, setCurrentRole] = useState<'adopter' | 'staff'>('adopter');
  const [currentAdopterId, setCurrentAdopterId] = useState(1);
  const [currentStaffId, setCurrentStaffId] = useState(1);

  // Metadata
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [staffList, setStaffList] = useState<ShelterStaff[]>([]);
  const [adopters, setAdopters] = useState<Adopter[]>([]);

  // State collections
  const [pets, setPets] = useState<EnrichedPet[]>([]);
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  // Active Modals
  const [detailModalPet, setDetailModalPet] = useState<EnrichedPet | null>(null);
  const [celebrationPet, setCelebrationPet] = useState<EnrichedPet | null>(null);
  const [applicationModalState, setApplicationModalState] = useState<{
    matchId: number;
    pet: EnrichedPet;
  } | null>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<{
    species: string;
    breed: string;
    size: string;
    maxDistanceKm?: number;
  }>({
    species: 'All',
    breed: 'All',
    size: 'All',
  });

  // Current adopter info
  const currentAdopter = adopters.find((a) => a.adopter_id === currentAdopterId) || null;

  // 1. Fetch metadata on initial load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch('/api/adopters');
        const data = await res.json();
        if (data.adopters) setAdopters(data.adopters);
        if (data.shelters) setShelters(data.shelters);
        if (data.staff) setStaffList(data.staff);
        if (data.breeds) setBreeds(data.breeds);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch Discover Pets
  const fetchDiscoverPets = useCallback(async () => {
    setLoadingPets(true);
    try {
      const params = new URLSearchParams();
      params.set('adopterId', String(currentAdopterId));
      params.set('excludeSwiped', 'false'); // Show all available pets

      if (activeFilters.species !== 'All') params.set('species', activeFilters.species);
      if (activeFilters.breed !== 'All') params.set('breed', activeFilters.breed);
      if (activeFilters.size !== 'All') params.set('size', activeFilters.size);
      if (activeFilters.maxDistanceKm) params.set('maxDistanceKm', String(activeFilters.maxDistanceKm));

      const res = await fetch(`/api/pets?${params.toString()}`);
      const data = await res.json();
      setPets(data.pets || []);
    } catch (err) {
      console.error('Failed to load pets:', err);
    } finally {
      setLoadingPets(false);
    }
  }, [currentAdopterId, activeFilters]);

  // 3. Fetch Matches
  const fetchMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch(`/api/matches?adopterId=${currentAdopterId}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  }, [currentAdopterId]);

  // 4. Fetch Applications
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      // Filter applications submitted by this adopter
      const myApps = (data.applications || []).filter(
        (app: EnrichedApplication) => app.adopter.adopter_id === currentAdopterId
      );
      setApplications(myApps);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  }, [currentAdopterId]);

  // Synchronize when adopter changes or on tab switches
  useEffect(() => {
    fetchDiscoverPets();
    fetchMatches();
    fetchApplications();
  }, [fetchDiscoverPets, fetchMatches, fetchApplications]);

  // Action: Swipe Left (Pass)
  const handleSwipeLeft = async (petId: number) => {
    try {
      await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adopterId: currentAdopterId,
          petId,
          direction: 'LEFT',
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Swipe Right (Interested / Match)
  const handleSwipeRight = async (petId: number) => {
    try {
      const res = await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adopterId: currentAdopterId,
          petId,
          direction: 'RIGHT',
        }),
      });

      const data = await res.json();
      if (data.isMatch) {
        const pet = pets.find((p) => p.pet_id === petId);
        if (pet) {
          setCelebrationPet(pet);
        }
        await fetchMatches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Switch User
  const handleSwitchUser = (role: 'adopter' | 'staff', id: number) => {
    setCurrentRole(role);
    if (role === 'adopter') {
      setCurrentAdopterId(id);
    } else {
      setCurrentStaffId(id);
      setActiveTab('shelter');
    }
  };

  // Action: Reset Database
  const handleResetDb = async () => {
    if (!confirm('Reset entire database back to default seed data?')) return;
    try {
      await fetch('/api/reset', { method: 'POST' });
      await fetchDiscoverPets();
      await fetchMatches();
      await fetchApplications();
      alert('Database successfully reset to default seeds!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Open Application Modal from Match
  const handleOpenApplicationModal = (pet: EnrichedPet, matchId?: number) => {
    let mId = matchId;
    if (!mId) {
      const matchObj = matches.find((m) => m.pet_id === pet.pet_id);
      mId = matchObj?.match_id;
    }
    if (mId) {
      setApplicationModalState({ matchId: mId, pet });
    } else {
      alert('Please swipe right on this pet first to establish a match!');
    }
  };

  const handleApplicationSubmitted = async () => {
    setApplicationModalState(null);
    await fetchMatches();
    await fetchApplications();
    setActiveTab('applications');
  };

  // Counts for Badges
  const activeMatchCount = matches.filter((m) => !m.has_application).length;
  const pendingAppsCount = applications.filter(
    (a) => a.application_status === 'Pending' || a.application_status === 'Under Review'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-rose-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        currentRole={currentRole}
        currentAdopterId={currentAdopterId}
        currentStaffId={currentStaffId}
        activeTab={activeTab}
        matchCount={activeMatchCount}
        pendingAppCount={pendingAppsCount}
        onSelectTab={setActiveTab}
        onSwitchUser={handleSwitchUser}
        onResetDb={handleResetDb}
      />

      {/* Main Content View by Active Tab */}
      <main className="flex-1">
        {activeTab === 'discover' && (
          <DiscoverView
            pets={pets}
            allBreeds={breeds}
            currentAdopter={currentAdopter}
            loading={loadingPets}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onViewDetails={(pet) => setDetailModalPet(pet)}
            onFilterChange={(filters) => setActiveFilters(filters)}
            onResetSwipes={() => fetchDiscoverPets()}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            matches={matches}
            loading={loadingMatches}
            onApply={(pet, matchId) => handleOpenApplicationModal(pet, matchId)}
            onViewPet={(pet) => setDetailModalPet(pet)}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            loading={loadingApps}
            onRefresh={fetchApplications}
          />
        )}

        {activeTab === 'shelter' && (
          <ShelterDashboard
            currentStaffId={currentStaffId}
            shelters={shelters}
            breeds={breeds}
            staffList={staffList}
            onRefresh={() => {
              fetchDiscoverPets();
              fetchMatches();
              fetchApplications();
            }}
          />
        )}

        {activeTab === 'sqllab' && <SqlLab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">
          🐾 Kinder Pets — DBMS Academic Mini-Project (DA2)
        </p>
        <p className="mt-1">
          Relational Architecture: 12 Normalized Tables • Oracle SQL / PL/SQL • Node Built-in SQLite
        </p>
      </footer>

      {/* Modals */}
      {detailModalPet && (
        <PetDetailModal
          pet={detailModalPet}
          onClose={() => setDetailModalPet(null)}
          onSwipeLeft={(id) => {
            handleSwipeLeft(id);
            setDetailModalPet(null);
          }}
          onSwipeRight={(id) => {
            handleSwipeRight(id);
            setDetailModalPet(null);
          }}
          isMatched={matches.some((m) => m.pet_id === detailModalPet.pet_id)}
          onApply={(pet) => {
            setDetailModalPet(null);
            handleOpenApplicationModal(pet);
          }}
        />
      )}

      {celebrationPet && (
        <MatchCelebrationModal
          pet={celebrationPet}
          onClose={() => setCelebrationPet(null)}
          onApply={(pet) => {
            setCelebrationPet(null);
            handleOpenApplicationModal(pet);
          }}
        />
      )}

      {applicationModalState && (
        <ApplicationModal
          matchId={applicationModalState.matchId}
          pet={applicationModalState.pet}
          onClose={() => setApplicationModalState(null)}
          onSuccess={handleApplicationSubmitted}
        />
      )}
    </div>
  );
}
