'use client';

import React from 'react';
import { EnrichedApplication } from '@/lib/types';
import { formatAge } from './PetCard';

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
    return <div className="py-20 text-center text-slate-400">Loading your applications...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <span>📋 My Adoption Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {applications.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking applications submitted from <code className="font-mono text-rose-600">ADOPTION_APPLICATION</code> table.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 my-8">
          <span className="text-5xl block mb-3">📝</span>
          <h3 className="text-xl font-bold text-slate-800 mb-1">No Applications Submitted</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Match with a pet on the Discover feed and submit an adoption application to track its progress here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.application_id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Pet Info */}
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
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.application_status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
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

                  <p className="text-xs text-slate-500 mt-1">
                    Shelter: <b>{app.pet.shelter_name}</b> ({app.pet.shelter_city})
                  </p>
                </div>
              </div>

              {/* Status Timeline / Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1 min-w-[280px]">
                <p className="text-slate-600">
                  <span>📅 Scheduled Home Visit: </span>
                  <b className="text-slate-900">{app.home_visit_date}</b>
                </p>
                <p className="text-slate-500">
                  <span>🕒 Submitted: </span>
                  <span>{app.submitted_at}</span>
                </p>
                {app.staff && (
                  <p className="text-indigo-700 font-semibold pt-1 border-t border-slate-200/60">
                    Reviewer: {app.staff.staff_name} ({app.staff.role})
                  </p>
                )}
              </div>

              {/* Resolution Banner */}
              <div className="text-right">
                {app.application_status === 'Approved' ? (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                    🎉 Adoption Approved!
                    <span className="block text-[11px] font-normal text-emerald-600 mt-0.5">
                      Check your email for shelter handover steps.
                    </span>
                  </div>
                ) : app.application_status === 'Rejected' ? (
                  <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
                    ❌ Not Approved
                    <span className="block text-[11px] font-normal text-rose-600 mt-0.5">
                      Feel free to explore other pet companions.
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
                    ⏳ Under Shelter Review
                    <span className="block text-[11px] text-amber-600 mt-0.5">
                      Shelter team is evaluating the profile.
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
