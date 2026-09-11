'use client';

import React, { useState, useEffect } from 'react';
import { EnrichedPet } from '@/lib/types';
import { 
  X, 
  Calendar, 
  Home, 
  Check, 
  AlertCircle, 
  Database, 
  ClipboardList, 
  Building2,
  ChevronDown
} from 'lucide-react';

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
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const defaultDate = nextWeek.toISOString().split('T')[0];

  const [homeVisitDate, setHomeVisitDate] = useState(defaultDate);
  const [housingType, setHousingType] = useState('Apartment');
  const [hasYard, setHasYard] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14181A]/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-[14px] overflow-hidden border border-[#DEDAD1] animate-modal-in shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DEDAD1] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#4B5250] block mb-1">
              Match #{matchId} • Adoption Request
            </span>
            <h2 id="app-modal-title" className="font-serif text-2xl font-medium text-[#14181A] tracking-tight">
              Start adoption application
            </h2>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application dialog"
            className="w-8 h-8 rounded-full border border-[#DEDAD1] bg-[#F3F1EA] hover:bg-[#DEDAD1] text-[#14181A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pet Summary Strip */}
        <div className="p-4 bg-[#F3F1EA] border-b border-[#DEDAD1] flex items-center space-x-3.5">
          <img
            src={pet.primary_photo}
            alt={pet.pet_name}
            className="w-14 h-14 object-cover border border-[#DEDAD1] flex-shrink-0"
          />
          <div>
            <h3 className="font-serif text-xl font-medium text-[#14181A]">{pet.pet_name}</h3>
            <p className="text-xs text-[#4B5250]">
              {pet.breed_name} • {pet.shelter_name} ({pet.shelter_city})
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#A2453A]/10 border border-[#A2453A]/30 text-[#A2453A] text-xs flex items-center space-x-2" role="alert">
              <AlertCircle className="w-4 h-4 text-[#A2453A] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="input-home-visit" className="block text-xs font-semibold text-[#14181A] mb-1.5">
              Proposed home visit date *
            </label>
            <input
              id="input-home-visit"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={homeVisitDate}
              onChange={(e) => setHomeVisitDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24]"
            />
            <p className="text-[11px] text-[#4B5250] mt-1">
              A shelter caseworker will conduct a structured home assessment on this date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-housing-type" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                Housing type
              </label>
              <div className="relative">
                <select
                  id="select-housing-type"
                  value={housingType}
                  onChange={(e) => setHousingType(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Villa with Garden">Villa with Garden</option>
                  <option value="Farmhouse">Farmhouse</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="select-has-yard" className="block text-xs font-semibold text-[#14181A] mb-1.5">
                Fenced yard available?
              </label>
              <div className="relative">
                <select
                  id="select-has-yard"
                  value={hasYard ? 'Yes' : 'No'}
                  onChange={(e) => setHasYard(e.target.value === 'Yes')}
                  className="w-full appearance-none px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] cursor-pointer"
                >
                  <option value="Yes">Yes, secure yard</option>
                  <option value="No">No yard (regular walks)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#4B5250] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="textarea-notes" className="block text-xs font-semibold text-[#14181A] mb-1.5">
              Caregiver notes & daily routine
            </label>
            <textarea
              id="textarea-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe previous companion animal experience, household members, or exercise schedule…"
              className="w-full px-3 py-2 border border-[#DEDAD1] text-xs font-normal text-[#14181A] bg-[#FFFFFF] focus-visible:outline-none focus-visible:border-[#FBBF24] leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#DEDAD1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DEDAD1] bg-[#FFFFFF] text-[#4B5250] hover:text-[#14181A] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#14181A] font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-2"
            >
              {submitting ? (
                <span>Submitting…</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#14181A]" />
                  <span>Submit application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

