'use client';

import React, { useState, useEffect } from 'react';
import { EnrichedApplication, EnrichedPet, Shelter, Breed, ShelterStaff } from '@/lib/types';
import { formatAge } from './PetCard';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  RotateCcw, 
  ClipboardList, 
  Layers, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Check, 
  X, 
  Inbox, 
  AlertCircle,
  Database,
  ChevronDown
} from 'lucide-react';

interface ShelterDashboardProps {
  currentStaffId: number;
  shelters: Shelter[];
  breeds: Breed[];
  staffList: ShelterStaff[];
  onRefresh: () => void;
}

export default function ShelterDashboard({
  currentStaffId,
  shelters,
  breeds,
  staffList,
  onRefresh,
}: ShelterDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'pets'>('applications');
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [pets, setPets] = useState<EnrichedPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // New Pet Modal state
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetShelterId, setNewPetShelterId] = useState(shelters[0]?.shelter_id || 1);
  const [newPetBreed, setNewPetBreed] = useState(breeds[0]?.breed_name || 'Labrador Retriever');
  const [newPetGender, setNewPetGender] = useState<'Male' | 'Female'>('Male');
  const [newPetAgeMonths, setNewPetAgeMonths] = useState(12);
  const [newPetSize, setNewPetSize] = useState<'Small' | 'Medium' | 'Large' | 'Extra Large'>('Medium');
  const [newPetBehaviour, setNewPetBehaviour] = useState('');
  const [newPetLifestyle, setNewPetLifestyle] = useState('');
  const [newPetPhotoUrl, setNewPetPhotoUrl] = useState('');
  const [addPetSubmitting, setAddPetSubmitting] = useState(false);

  // Active staff member
  const currentStaff = staffList.find((s) => s.staff_id === currentStaffId) || staffList[0];

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, petsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/pets?forShelter=true'),
      ]);
      const appsData = await appsRes.json();
      const petsData = await petsRes.json();
      setApplications(appsData.applications || []);
      setPets(petsData.pets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (applicationId: number, decision: 'Approved' | 'Rejected') => {
    setActionLoading(applicationId);
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          staffId: currentStaffId,
          decision,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Decision failed');
      } else {
        await loadData();
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Action error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetBreed) return;

    setAddPetSubmitting(true);
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelter_id: newPetShelterId,
          breed_name: newPetBreed,
          pet_name: newPetName,
          gender: newPetGender,
          age_months: newPetAgeMonths,
          size: newPetSize,
          behaviour_desc: newPetBehaviour || 'Gentle and affectionate sanctuary companion',
          lifestyle_desc: newPetLifestyle || 'Loves calm indoor routines and regular exercise',
          photo_urls: newPetPhotoUrl ? [newPetPhotoUrl] : [
            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to add pet');
      } else {
        setShowAddPetModal(false);
        setNewPetName('');
        setNewPetBehaviour('');
        setNewPetLifestyle('');
        setNewPetPhotoUrl('');
        await loadData();
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Error adding pet');
    } finally {
      setAddPetSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-page-in space-y-8">
      
      {/* Executive Staff Header Card */}
      <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#FBBF24] text-[#14181A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#14181A] stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14181A] tracking-tight">{currentStaff?.staff_name || 'Staff Officer'}</h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#F3F1EA] text-[#4B5250] border border-[#DEDAD1]">
                  Officer #{currentStaff?.staff_id}
                </span>
              </div>
              <p className="text-xs text-[#4B5250] mt-0.5">
                {currentStaff?.role} • Shelter Facility #{currentStaff?.shelter_id}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#4B5250] max-w-xl leading-relaxed">
            Adjudicate incoming adoption applications, conduct home verification assessments, and manage live sanctuary records.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowAddPetModal(true)}
            aria-label="Register new animal"
            className="px-3.5 py-2 rounded bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Register companion</span>
          </button>
          
          <button
            type="button"
            onClick={loadData}
            aria-label="Refresh shelter records"
            className="px-3 py-2 rounded bg-[#FFFFFF] hover:bg-[#F3F1EA] border border-[#DEDAD1] text-[#4B5250] hover:text-[#14181A] text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Refresh records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center space-x-6 border-b border-[#DEDAD1]" role="tablist" aria-label="Shelter Management Sections">
        <button
          role="tab"
          type="button"
          aria-selected={activeSubTab === 'applications'}
          onClick={() => setActiveSubTab('applications')}
          className={`py-3 text-xs font-semibold relative transition-colors flex items-center space-x-2 cursor-pointer focus-visible:outline-none ${
            activeSubTab === 'applications'
              ? 'text-[#14181A]'
              : 'text-[#4B5250] hover:text-[#14181A]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Applications queue</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F3F1EA] text-[#14181A] font-bold border border-[#DEDAD1]">
            {applications.length}
          </span>
          {activeSubTab === 'applications' && (
            <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#FBBF24]" />
          )}
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeSubTab === 'pets'}
          onClick={() => setActiveSubTab('pets')}
          className={`py-3 text-xs font-semibold relative transition-colors flex items-center space-x-2 cursor-pointer focus-visible:outline-none ${
            activeSubTab === 'pets'
              ? 'text-[#14181A]'
              : 'text-[#4B5250] hover:text-[#14181A]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sanctuary inventory</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F3F1EA] text-[#14181A] font-bold border border-[#DEDAD1]">
            {pets.length}
          </span>
          {activeSubTab === 'pets' && (
            <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#FBBF24]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 text-center text-[#4B5250] text-xs" aria-live="polite">
          <span>Loading shelter records…</span>
        </div>
      ) : activeSubTab === 'applications' ? (
        applications.length === 0 ? (
          <div className="max-w-md mx-auto my-16 px-4">
            <div className="p-8 sm:p-10 text-center bg-[#FFFFFF] border border-[#DEDAD1]">
              <div className="w-12 h-12 rounded-full bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center mx-auto mb-4 text-[#4B5250]">
                <Inbox className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#14181A] mb-2">
                Queue clear
              </h3>
              <p className="text-xs text-[#4B5250] leading-relaxed max-w-xs mx-auto">
                No applications currently require adjudication. Switch to an Adopter persona to submit an application.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="bg-[#FFFFFF] p-6 border border-[#DEDAD1] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#C9C4B8] transition-colors"
              >
                {/* Left: Pet Info & Photo */}
                <div className="flex items-start space-x-4">
                  <img
                    src={app.pet.primary_photo}
                    alt={app.pet.pet_name}
                    className="w-20 h-20 object-cover border border-[#DEDAD1] flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-[#4B5250]">
                        Record #{app.application_id}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                          app.application_status === 'Approved'
                            ? 'bg-[#FBBF24]/20 text-[#B45309] border-[#FBBF24]'
                            : app.application_status === 'Rejected'
                            ? 'bg-[#A2453A]/10 text-[#A2453A] border-[#A2453A]/30'
                            : 'bg-[#B98A34]/10 text-[#B98A34] border-[#B98A34]/30'
                        }`}
                      >
                        {app.application_status}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-normal text-[#14181A]">
                      {app.pet.pet_name}
                      <span className="text-xs font-sans font-normal text-[#4B5250] ml-2">
                        ({app.pet.breed_name}, {formatAge(app.pet.age_months)})
                      </span>
                    </h3>

                    <p className="text-xs text-[#4B5250] mt-1 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#4B5250]" />
                      <span>{app.pet.shelter_name}</span>
                      <span className="text-[#DEDAD1]">•</span>
                      <span>{app.pet.shelter_city}</span>
                    </p>
                  </div>
                </div>

                {/* Middle: Adopter Credentials */}
                <div className="bg-[#F3F1EA] p-4 border border-[#DEDAD1] text-xs space-y-1.5 min-w-[280px]">
                  <div className="flex items-center space-x-1.5 font-semibold text-[#14181A]">
                    <User className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Applicant: {app.adopter.full_name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#4B5250] text-[11px]">
                    <Phone className="w-3 h-3 text-[#4B5250]" />
                    <span>{app.adopter.phone}</span>
                    <span className="text-[#DEDAD1]">•</span>
                    <Mail className="w-3 h-3 text-[#4B5250]" />
                    <span>{app.adopter.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#4B5250] text-[11px]">
                    <MapPin className="w-3 h-3 text-[#4B5250]" />
                    <span>{app.adopter.city}, {app.adopter.state}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#14181A] font-medium pt-1.5 border-t border-[#DEDAD1] text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Home Visit: {app.home_visit_date}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  {app.application_status === 'Pending' || app.application_status === 'Under Review' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDecision(app.application_id, 'Approved')}
                        disabled={actionLoading === app.application_id}
                        aria-label={`Approve application ${app.application_id}`}
                        className="w-full sm:w-auto px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] focus-visible:outline-none text-[#14181A] text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(app.application_id, 'Rejected')}
                        disabled={actionLoading === app.application_id}
                        aria-label={`Reject application ${app.application_id}`}
                        className="w-full sm:w-auto px-4 py-2 bg-[#FFFFFF] border border-[#A2453A]/40 text-[#A2453A] hover:bg-[#A2453A]/10 focus-visible:outline-none text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-[#A2453A]" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-[#4B5250] px-3.5 py-2 bg-[#F3F1EA] border border-[#DEDAD1]">
                      Status: <span className="font-semibold text-[#14181A]">{app.application_status}</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )
      ) : (
        /* Sanctuary Pet Inventory Table */
        <div className="bg-[#FFFFFF] border border-[#DEDAD1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F1EA] border-b border-[#DEDAD1] text-[#4B5250] font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Companion Animal</th>
                  <th className="p-4">Species & Breed</th>
                  <th className="p-4">Age / Size / Gender</th>
                  <th className="p-4">Shelter Facility</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDAD1] text-[#14181A]">
                {pets.map((p) => (
                  <tr key={p.pet_id} className="hover:bg-[#F3F1EA]/60 transition-colors">
                    <td className="p-4 flex items-center space-x-3.5">
                      <img
                        src={p.primary_photo}
                        alt=""
                        className="w-11 h-11 object-cover border border-[#DEDAD1] flex-shrink-0"
                      />
                      <div>
                        <span className="font-serif text-base block font-medium">{p.pet_name}</span>
                        <span className="text-[11px] text-[#4B5250]">ID #{p.pet_id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[#14181A]">{p.breed_name}</span>
                      <span className="block text-[#4B5250] text-[11px]">{p.species}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[#14181A]">{formatAge(p.age_months)}</span>
                      <span className="block text-[#4B5250] text-[11px]">{p.size} • {p.gender}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[#14181A]">{p.shelter_name}</span>
                      <span className="block text-[#4B5250] text-[11px]">{p.shelter_city}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${
                          p.status === 'Available'
                            ? 'bg-[#FBBF24]/20 text-[#B45309] border-[#FBBF24]'
                            : p.status === 'Adopted'
                            ? 'bg-[#14181A] text-[#F3F1EA] border-[#14181A]'
                            : 'bg-[#B98A34]/10 text-[#B98A34] border-[#B98A34]/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Pet Modal */}
      {showAddPetModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181A]/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-pet-title"
        >
          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-[14px] overflow-hidden border border-[#DEDAD1] animate-modal-in shadow-xl">
            
            <div className="p-6 border-b border-[#DEDAD1] flex items-center justify-between">
              <div>
                <h3 id="add-pet-title" className="font-serif text-2xl font-medium text-[#14181A]">Register Companion</h3>
                <p className="text-xs text-[#4B5250] mt-0.5">Add a new verified animal to sanctuary records</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPetModal(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full border border-[#DEDAD1] bg-[#F3F1EA] hover:bg-[#DEDAD1] text-[#14181A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPet} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-pet-name" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                    Companion name *
                  </label>
                  <input
                    id="new-pet-name"
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24]"
                  />
                </div>

                <div>
                  <label htmlFor="new-pet-breed" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                    Breed *
                  </label>
                  <div className="relative">
                    <select
                      id="new-pet-breed"
                      value={newPetBreed}
                      onChange={(e) => setNewPetBreed(e.target.value)}
                      className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                    >
                      {breeds.map((b) => (
                        <option key={b.breed_name} value={b.breed_name}>
                          {b.breed_name} ({b.species})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="new-pet-gender" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                    Gender *
                  </label>
                  <div className="relative">
                    <select
                      id="new-pet-gender"
                      value={newPetGender}
                      onChange={(e) => setNewPetGender(e.target.value as any)}
                      className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-pet-age" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                    Age (months) *
                  </label>
                  <input
                    id="new-pet-age"
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={newPetAgeMonths}
                    onChange={(e) => setNewPetAgeMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24]"
                  />
                </div>

                <div>
                  <label htmlFor="new-pet-size" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                    Size *
                  </label>
                  <div className="relative">
                    <select
                      id="new-pet-size"
                      value={newPetSize}
                      onChange={(e) => setNewPetSize(e.target.value as any)}
                      className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Extra Large">Extra Large</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="new-pet-shelter" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                  Housing shelter *
                </label>
                <div className="relative">
                  <select
                    id="new-pet-shelter"
                    value={newPetShelterId}
                    onChange={(e) => setNewPetShelterId(Number(e.target.value))}
                    className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                  >
                    {shelters.map((s) => (
                      <option key={s.shelter_id} value={s.shelter_id}>
                        {s.shelter_name} ({s.city})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="new-pet-photo" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                  Photo URL
                </label>
                <input
                  id="new-pet-photo"
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  value={newPetPhotoUrl}
                  onChange={(e) => setNewPetPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24]"
                />
              </div>

              <div>
                <label htmlFor="new-pet-behaviour" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                  Behaviour notes
                </label>
                <textarea
                  id="new-pet-behaviour"
                  rows={2}
                  value={newPetBehaviour}
                  onChange={(e) => setNewPetBehaviour(e.target.value)}
                  placeholder="e.g. Playful, friendly with other animals, loves gentle treats"
                  className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="new-pet-lifestyle" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                  Ideal home environment
                </label>
                <textarea
                  id="new-pet-lifestyle"
                  rows={2}
                  value={newPetLifestyle}
                  onChange={(e) => setNewPetLifestyle(e.target.value)}
                  placeholder="e.g. Apartment friendly, needs regular daily walks"
                  className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#DEDAD1]">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="px-4 py-2 border border-[#DEDAD1] bg-[#FFFFFF] text-[#4B5250] hover:text-[#14181A] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPetSubmitting}
                  className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-2"
                >
                  {addPetSubmitting ? (
                    <span>Registering…</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#14181A]" />
                      <span>Register companion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
