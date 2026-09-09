'use client';

import React, { useState, useEffect } from 'react';
import { EnrichedApplication, EnrichedPet, Shelter, Breed, ShelterStaff } from '@/lib/types';
import { formatAge } from './PetCard';

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
          behaviour_desc: newPetBehaviour || 'Gentle and affectionate shelter companion',
          lifestyle_desc: newPetLifestyle || 'Loves family interaction and daily routines',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Staff Status Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl font-bold">
              👨‍⚕️
            </span>
            <div>
              <h2 className="text-2xl font-black">{currentStaff?.staff_name || 'Staff Member'}</h2>
              <p className="text-xs text-slate-300 font-medium">
                {currentStaff?.role} • Shelter #{currentStaff?.shelter_id}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Review incoming adoption applications, conduct home visit verification, record shelter decisions in <code className="text-rose-300 font-mono">SHELTER_DECISION</code>, and maintain inventory.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPetModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center space-x-1.5"
          >
            <span>+</span>
            <span>Add New Pet</span>
          </button>
          <button
            onClick={loadData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            title="Refresh dashboard records"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'applications'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>📋 Adoption Applications</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pets')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'pets'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🐾 Shelter Pet Inventory</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {pets.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading shelter records...</div>
      ) : activeSubTab === 'applications' ? (
        /* Applications List */
        applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-slate-600 font-semibold">No applications recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Switch to an Adopter profile, like a pet, and submit an application to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Pet Info & Photo */}
                <div className="flex items-start space-x-4">
                  <img
                    src={app.pet.primary_photo}
                    alt={app.pet.pet_name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        APP #{app.application_id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          app.application_status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.application_status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.application_status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {app.pet.pet_name}
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        ({app.pet.breed_name}, {formatAge(app.pet.age_months)})
                      </span>
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Shelter: <b>{app.pet.shelter_name}</b> ({app.pet.shelter_city})
                    </p>
                  </div>
                </div>

                {/* Middle: Adopter & Verification Info */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1 min-w-[260px]">
                  <p className="font-bold text-slate-800 flex items-center space-x-1">
                    <span>👤 Applicant:</span>
                    <span>{app.adopter.full_name}</span>
                  </p>
                  <p className="text-slate-600">
                    📞 {app.adopter.phone} • ✉️ {app.adopter.email}
                  </p>
                  <p className="text-slate-600">
                    📍 {app.adopter.city}, {app.adopter.state}
                  </p>
                  <p className="text-indigo-700 font-semibold pt-1 border-t border-slate-200/60 flex items-center space-x-1">
                    <span>📅 Home Visit:</span>
                    <span>{app.home_visit_date}</span>
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {app.application_status === 'Pending' || app.application_status === 'Under Review' ? (
                    <>
                      <button
                        onClick={() => handleDecision(app.application_id, 'Approved')}
                        disabled={actionLoading === app.application_id}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>✅</span>
                        <span>Approve Adoption</span>
                      </button>
                      <button
                        onClick={() => handleDecision(app.application_id, 'Rejected')}
                        disabled={actionLoading === app.application_id}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>❌</span>
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 font-medium px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      Adjudicated as <b>{app.application_status}</b>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Pets Inventory Table */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Pet Name</th>
                  <th className="p-4">Species / Breed</th>
                  <th className="p-4">Age / Size</th>
                  <th className="p-4">Shelter</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pets.map((p) => (
                  <tr key={p.pet_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img
                        src={p.primary_photo}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.pet_name}</span>
                        <span className="text-[11px] text-slate-400">ID #{p.pet_id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800">{p.breed_name}</span>
                      <span className="block text-slate-400">{p.species}</span>
                    </td>
                    <td className="p-4">
                      <span>{formatAge(p.age_months)}</span>
                      <span className="block text-slate-400">{p.size} • {p.gender}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{p.shelter_name}</span>
                      <span className="block text-slate-400">{p.shelter_city}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          p.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Adopted'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
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

      {/* Add New Pet Modal (Simulates PL/SQL add_pet Procedure) */}
      {showAddPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Add New Pet Profile</h3>
                <p className="text-xs text-slate-300">
                  Executes stored procedure: <code className="text-rose-400 font-mono">add_pet()</code>
                </p>
              </div>
              <button
                onClick={() => setShowAddPetModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPet} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Breed *
                  </label>
                  <select
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  >
                    {breeds.map((b) => (
                      <option key={b.breed_name} value={b.breed_name}>
                        {b.breed_name} ({b.species})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gender *
                  </label>
                  <select
                    value={newPetGender}
                    onChange={(e) => setNewPetGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age (Months) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={newPetAgeMonths}
                    onChange={(e) => setNewPetAgeMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Size *
                  </label>
                  <select
                    value={newPetSize}
                    onChange={(e) => setNewPetSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Housing Shelter *
                </label>
                <select
                  value={newPetShelterId}
                  onChange={(e) => setNewPetShelterId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                >
                  {shelters.map((s) => (
                    <option key={s.shelter_id} value={s.shelter_id}>
                      {s.shelter_name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Photo URL (PET_PHOTO Table)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPetPhotoUrl}
                  onChange={(e) => setNewPetPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Behaviour Description
                </label>
                <textarea
                  rows={2}
                  value={newPetBehaviour}
                  onChange={(e) => setNewPetBehaviour(e.target.value)}
                  placeholder="e.g. Playful, friendly with other animals, loves gentle treats"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ideal Lifestyle
                </label>
                <textarea
                  rows={2}
                  value={newPetLifestyle}
                  onChange={(e) => setNewPetLifestyle(e.target.value)}
                  placeholder="e.g. Apartment friendly, needs 30 mins walking twice a day"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPetSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md"
                >
                  {addPetSubmitting ? 'Adding...' : 'Register Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
