'use client';

import React, { useState } from 'react';
import { EnrichedPet } from '@/lib/types';

interface ApplicationModalProps {
  matchId: number;
  pet: EnrichedPet;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({
  matchId,
  pet,
  onClose,
  onSuccess,
}: ApplicationModalProps) {
  // Default home visit date: 7 days from now
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const defaultDate = nextWeek.toISOString().split('T')[0];

  const [homeVisitDate, setHomeVisitDate] = useState(defaultDate);
  const [housingType, setHousingType] = useState('Apartment');
  const [hasYard, setHasYard] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeVisitDate) {
      setError('Please select a home visit date');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeVisitDate,
          housingType,
          hasYard,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">Submit Adoption Application</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-rose-100 mt-1">
            DA1 Workflow: Match #{matchId} → Formal Shelter Review
          </p>
        </div>

        {/* Pet Summary Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center space-x-3">
          <img
            src={pet.primary_photo}
            alt={pet.pet_name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-base font-bold text-slate-900">{pet.pet_name}</h4>
            <p className="text-xs text-slate-500">
              {pet.breed_name} • {pet.shelter_name} ({pet.shelter_city})
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Proposed Home Visit Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={homeVisitDate}
              onChange={(e) => setHomeVisitDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Shelter staff will conduct an in-person or virtual verification on this date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Housing Type
              </label>
              <select
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa with Garden">Villa with Garden</option>
                <option value="Farmhouse">Farmhouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enclosed Yard?
              </label>
              <select
                value={hasYard ? 'Yes' : 'No'}
                onChange={(e) => setHasYard(e.target.value === 'Yes')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                <option value="Yes">Yes, secure fencing</option>
                <option value="No">No yard (walks planned)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Caregiver Experience & Lifestyle Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell the shelter team about your previous pet care experience or daily schedule..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          {/* Academic Note */}
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800">
            <b>DBMS Trigger Note:</b> Submitting executes <code className="font-mono bg-indigo-100/80 px-1 py-0.5 rounded">submit_adoption_application</code> procedure, setting <code className="font-mono">MATCH.status = 'Applied'</code> and <code className="font-mono">PET.status = 'Pending'</code>.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:from-rose-600 transition-all flex items-center space-x-1.5"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>✓</span>
                  <span>Confirm Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
