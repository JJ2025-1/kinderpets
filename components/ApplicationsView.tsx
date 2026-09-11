'use client';

import React from 'react';
import { EnrichedApplication } from '@/lib/types';
import { formatAge } from './PetCard';
import { 
  RotateCcw, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Check, 
  X, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface ApplicationsViewProps {
  applications: EnrichedApplication[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ApplicationsView({
  applications,
  loading,
  onRefresh,
}: ApplicationsViewProps) {
  if (loading) {
    return (
      <div className="py-24 text-center text-[#4B5250] text-xs" aria-live="polite">
        <span>Loading adoption applications…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-page-in space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DEDAD1] pb-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#14181A] tracking-tight">
            Adoption applications
          </h1>
          <p className="text-sm text-[#4B5250] max-w-xl leading-relaxed">
            Status and review tracking for applications submitted to partner shelters.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh records"
          className="px-3 py-1.5 rounded bg-[#FFFFFF] border border-[#DEDAD1] text-[#14181A] hover:bg-[#F3F1EA] text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#4B5250]" />
          <span>Refresh</span>
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="max-w-md mx-auto my-16 px-4">
          <div className="p-8 text-center bg-[#FFFFFF] border border-[#DEDAD1]">
            <div className="w-10 h-10 rounded-full bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center mx-auto mb-4 text-[#4B5250]">
              <FileText className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#14181A] mb-2">
              No applications submitted
            </h3>
            <p className="text-xs text-[#4B5250] leading-relaxed max-w-xs mx-auto">
              Once you match with an animal in Discovery and start an application, its verification progress will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.application_id}
              className="bg-[#FFFFFF] p-6 border border-[#DEDAD1] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#C9C4B8] transition-colors"
            >
              {/* Pet Info Strip */}
              <div className="flex items-start space-x-4">
                <img
                  src={app.pet.primary_photo}
                  alt={app.pet.pet_name}
                  className="w-16 h-16 object-cover border border-[#DEDAD1] shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#4B5250]">
                      Application #{app.application_id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        app.application_status === 'Approved'
                          ? 'bg-[#FBBF24] text-[#14181A]'
                          : app.application_status === 'Rejected'
                          ? 'bg-[#A2453A] text-white'
                          : 'bg-[#B98A34] text-white'
                      }`}
                    >
                      {app.application_status}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#14181A]">
                    {app.pet.pet_name}
                    <span className="text-xs font-normal text-[#4B5250] ml-2">
                      ({app.pet.breed_name}, {formatAge(app.pet.age_months)})
                    </span>
                  </h3>

                  <p className="text-xs text-[#4B5250] flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#4B5250]" />
                    <span>{app.pet.shelter_name}</span>
                    <span>•</span>
                    <span>{app.pet.shelter_city}</span>
                  </p>
                </div>
              </div>

              {/* Status Timeline / Details */}
              <div className="bg-[#F3F1EA] p-3.5 border border-[#DEDAD1] text-xs space-y-1 min-w-[280px]">
                <div className="flex items-center space-x-2 text-[#14181A]">
                  <Calendar className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                  <span>Scheduled home assessment:</span>
                  <b className="font-medium">{app.home_visit_date}</b>
                </div>
                
                <div className="flex items-center space-x-2 text-[#4B5250] text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#4B5250] shrink-0" />
                  <span>Submitted:</span>
                  <span>{app.submitted_at}</span>
                </div>

                {app.staff && (
                  <div className="flex items-center space-x-2 text-[#14181A] pt-1 border-t border-[#DEDAD1] text-[11px]">
                    <User className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                    <span>Reviewer: {app.staff.staff_name} ({app.staff.role})</span>
                  </div>
                )}
              </div>

              {/* Resolution Status Banner */}
              <div className="text-right shrink-0 min-w-[200px]">
                {app.application_status === 'Approved' ? (
                  <div className="p-3 bg-[#FFFFFF] border border-[#FBBF24] text-[#14181A] text-xs text-left sm:text-center space-y-0.5">
                    <div className="flex items-center sm:justify-center space-x-1 text-[#B45309] font-semibold">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Approved</span>
                    </div>
                    <span className="text-[11px] text-[#4B5250] block">
                      Shelter handover active
                    </span>
                  </div>
                ) : app.application_status === 'Rejected' ? (
                  <div className="p-3 bg-[#FFFFFF] border border-[#A2453A] text-[#14181A] text-xs text-left sm:text-center space-y-0.5">
                    <div className="flex items-center sm:justify-center space-x-1 text-[#A2453A] font-semibold">
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Not Approved</span>
                    </div>
                    <span className="text-[11px] text-[#4B5250] block">
                      Explore other shelter companions
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FFFFFF] border border-[#B98A34] text-[#14181A] text-xs text-left sm:text-center space-y-0.5">
                    <div className="flex items-center sm:justify-center space-x-1 text-[#B98A34] font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Under Review</span>
                    </div>
                    <span className="text-[11px] text-[#4B5250] block">
                      Reviewing home verification report
                    </span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}


