'use client';

import React, { useState, useEffect } from 'react';

const QUERY_LIST = [
  { id: 1, title: '1. List all available pets', concept: 'Basic SELECT with WHERE condition and ORDER BY' },
  { id: 2, title: '2. Available pets with breed & shelter info', concept: '3-Table INNER JOIN' },
  { id: 3, title: '3. Find pets by species (Dogs)', concept: 'INNER JOIN with predicate filtering' },
  { id: 4, title: '4. Find pets by breed (Labrador Retriever)', concept: 'Foreign Key matching with Shelter join' },
  { id: 5, title: '5. Pets matching adopter preferences', concept: 'Multi-table JOIN with age range BETWEEN & subquery' },
  { id: 6, title: "6. List an adopter's swipe history", concept: 'INNER JOIN with timestamp ordering' },
  { id: 7, title: '7. List matches for an adopter', concept: 'Multi-table join displaying mutual interest' },
  { id: 8, title: '8. List pending adoption applications', concept: 'Multi-table JOIN linking application, match, & pet' },
  { id: 9, title: '9. Applications handled by shelter staff', concept: 'LEFT OUTER JOIN with SHELTER_STAFF' },
  { id: 10, title: '10. List all adopted pets and their adopters', concept: '4-Table JOIN navigating historical decisions' },
  { id: 11, title: '11. Count pets by shelter (Census & Availability)', concept: 'GROUP BY with aggregate COUNT and conditional SUM' },
  { id: 12, title: '12. Count pets by breed and species', concept: 'Multi-column GROUP BY with HAVING clause' },
  { id: 13, title: '13. Adoption application status statistics', concept: 'Aggregation with percentage calculation' },
  { id: 14, title: '14. Find shelters with currently available pets', concept: 'Subquery using EXISTS' },
];

export default function SqlLab() {
  const [activeTab, setActiveTab] = useState<'queries' | 'plsql'>('queries');
  const [selectedQueryId, setSelectedQueryId] = useState(1);
  const [queryData, setQueryData] = useState<{ title: string; sql: string; concept: string; rows: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuery = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/queries?id=${id}`);
      const data = await res.json();
      setQueryData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuery(selectedQueryId);
  }, [selectedQueryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold">
                ⚡
              </span>
              <div>
                <h2 className="text-2xl font-black">DBMS DA2 Academic SQL & PL/SQL Hub</h2>
                <p className="text-xs text-indigo-200">
                  Live execution environment for all 14 Academic SQL Queries and PL/SQL Specifications
                </p>
              </div>
            </div>
            <p className="text-xs text-indigo-300 max-w-2xl">
              Demonstrates normalization, multi-table joins, subqueries, group by aggregations, procedures, functions, and triggers across the 12 DA1 entities.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-indigo-950/60 p-1.5 rounded-2xl border border-indigo-800/80">
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queries' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-300 hover:text-white'
              }`}
            >
              14 Academic Queries
            </button>
            <button
              onClick={() => setActiveTab('plsql')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'plsql' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-300 hover:text-white'
              }`}
            >
              PL/SQL Programs
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'queries' ? (
        /* 14 Academic SQL Queries */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Query Selector Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-1.5 max-h-[750px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
              Select SQL Query
            </h3>
            {QUERY_LIST.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQueryId(q.id)}
                className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex flex-col ${
                  selectedQueryId === q.id
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-xs font-bold'
                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <span>{q.title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-normal">
                  Concept: {q.concept}
                </span>
              </button>
            ))}
          </div>

          {/* Query Execution & Live Results Area */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                Executing SQL Query...
              </div>
            ) : queryData ? (
              <>
                {/* Query Header & SQL Display */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{queryData.title}</h3>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        DBMS Concept: {queryData.concept}
                      </p>
                    </div>
                    <button
                      onClick={() => fetchQuery(selectedQueryId)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center space-x-1"
                    >
                      <span>▶</span>
                      <span>Re-run</span>
                    </button>
                  </div>

                  {/* Syntax Box */}
                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {queryData.sql}
                    </pre>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      Query Results ({queryData.rows.length} rows returned)
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Source: kinderpets.db (Real SQL)
                    </span>
                  </div>

                  {queryData.rows.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Zero rows returned for current query parameters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                          <tr>
                            {Object.keys(queryData.rows[0]).map((key) => (
                              <th key={key} className="p-3 whitespace-nowrap">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {queryData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                              {Object.values(row).map((val: any, vIdx) => (
                                <td key={vIdx} className="p-3 whitespace-nowrap">
                                  {val !== null && val !== undefined ? String(val) : <span className="text-slate-400 italic">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        /* PL/SQL Specifications Showcase */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Procedures Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mb-3">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Stored Procedures</h3>
              <p className="text-xs text-slate-500 mb-4">
                Transactional routines implementing core state transitions:
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-700">
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">add_pet()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Validates foreign keys & adds pet</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">record_swipe()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Upserts swipe & triggers match</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">submit_adoption_application()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Creates application & sets Pending</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">approve_adoption()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Atomic approval transaction</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">reject_adoption()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Atomic rejection & reopens pet</span>
                </li>
              </ul>
            </div>

            {/* Functions Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-3">
                ƒ(x)
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">User Functions</h3>
              <p className="text-xs text-slate-500 mb-4">
                Deterministic calculation and aggregation functions:
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-700">
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-emerald-600">get_available_pet_count()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Returns total available pets globally or by shelter</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-emerald-600">get_adopter_match_count()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Returns active match count for an adopter</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-emerald-600">is_pet_suitable_for_adopter()</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Evaluates species, size, and age bounds against preferences</span>
                </li>
              </ul>
            </div>

            {/* Triggers Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold mb-3">
                🔔
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Database Triggers</h3>
              <p className="text-xs text-slate-500 mb-4">
                Automated constraint enforcement & cascading triggers:
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-700">
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-rose-600">trg_prevent_invalid_pet_status</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Rejects direct jumps from Available to Adopted</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-rose-600">trg_decision_update_pet_status</span>
                  <span className="block text-[11px] text-slate-500 font-sans">AFTER INSERT ON SHELTER_DECISION cascades to PET</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-rose-600">trg_prevent_duplicate_application</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Rejects duplicate active applications</span>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-rose-600">trg_single_primary_photo</span>
                  <span className="block text-[11px] text-slate-500 font-sans">Maintains exactly one primary photo per pet</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              All complete PL/SQL scripts are in <code className="text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">database/05_procedures.sql</code>, <code className="text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">06_functions.sql</code>, and <code className="text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">07_triggers.sql</code>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
