'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Database, 
  Code2, 
  Cpu, 
  GitBranch, 
  Check, 
  Copy,
  TableProperties,
  ArrowRight,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const QUERY_LIST = [
  { id: 1, title: '1. List all available pets', concept: 'Basic SELECT with WHERE condition and ORDER BY', category: 'Basic DQL' },
  { id: 2, title: '2. Available pets with breed & shelter info', concept: '3-Table INNER JOIN', category: 'Joins' },
  { id: 3, title: '3. Find pets by species (Dogs)', concept: 'INNER JOIN with predicate filtering', category: 'Filtering' },
  { id: 4, title: '4. Find pets by breed (Labrador Retriever)', concept: 'Foreign Key matching with Shelter join', category: 'Filtering' },
  { id: 5, title: '5. Pets matching adopter preferences', concept: 'Multi-table JOIN with age range BETWEEN & subquery', category: 'Matching Engine' },
  { id: 6, title: "6. List an adopter's swipe history", concept: 'INNER JOIN with timestamp ordering', category: 'Audit Trails' },
  { id: 7, title: '7. List matches for an adopter', concept: 'Multi-table join displaying mutual interest', category: 'Matching Engine' },
  { id: 8, title: '8. List pending adoption applications', concept: 'Multi-table JOIN linking application, match, & pet', category: 'Workflow' },
  { id: 9, title: '9. Applications handled by shelter staff', concept: 'LEFT OUTER JOIN with SHELTER_STAFF', category: 'Workflow' },
  { id: 10, title: '10. List all adopted pets and their adopters', concept: '4-Table JOIN navigating historical decisions', category: 'Historical' },
  { id: 11, title: '11. Count pets by shelter (Census & Availability)', concept: 'GROUP BY with aggregate COUNT and conditional SUM', category: 'Aggregations' },
  { id: 12, title: '12. Count pets by breed and species', concept: 'Multi-column GROUP BY with HAVING clause', category: 'Aggregations' },
  { id: 13, title: '13. Adoption application status statistics', concept: 'Aggregation with percentage calculation', category: 'Analytics' },
  { id: 14, title: '14. Find shelters with currently available pets', concept: 'Subquery using EXISTS', category: 'Subqueries' },
];

export default function SqlLab() {
  const [activeTab, setActiveTab] = useState<'queries' | 'plsql'>('queries');
  const [selectedQueryId, setSelectedQueryId] = useState(1);
  const [queryData, setQueryData] = useState<{ title: string; sql: string; concept: string; rows: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchQuery = async (id: number) => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/queries?id=${id}`);
      const data = await res.json();
      setQueryData(data);
      setExecutionTime(Math.round((performance.now() - start) * 10) / 10);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuery(selectedQueryId);
  }, [selectedQueryId]);

  const copySql = () => {
    if (queryData?.sql) {
      navigator.clipboard.writeText(queryData.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Editorial Header & Console Hero */}
      <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-[#3E6259]">
                Relational workbench
              </span>
              <span className="text-[#DEDAD1] text-xs">•</span>
              <span className="text-[11px] text-[#4B5250]">3NF Schema • 12 Entities</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14181A] tracking-tight font-medium">
              DBMS Academic SQL & PL/SQL Studio
            </h1>
            
            <p className="text-xs text-[#4B5250] max-w-2xl leading-relaxed">
              Interactive execution engine executing all 14 Academic queries, atomic stored procedures, deterministic evaluation functions, and cascading constraint triggers directly against the relational database.
            </p>
          </div>

          <div className="flex items-center space-x-2 border border-[#DEDAD1] p-1 bg-[#F3F1EA] self-start lg:self-center" role="tablist" aria-label="SQL Workbench Views">
            <button
              role="tab"
              type="button"
              aria-selected={activeTab === 'queries'}
              onClick={() => setActiveTab('queries')}
              className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'queries'
                  ? 'bg-[#3E6259] text-white'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              14 Academic queries
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={activeTab === 'plsql'}
              onClick={() => setActiveTab('plsql')}
              className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'plsql'
                  ? 'bg-[#3E6259] text-white'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              PL/SQL specifications
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'queries' ? (
        /* 14 Academic SQL Queries Studio */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Query Selector Sidebar */}
          <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#DEDAD1] p-4 space-y-2 max-h-[820px] overflow-y-auto">
            <div className="px-2 py-2 flex items-center justify-between border-b border-[#DEDAD1] pb-3">
              <span className="text-xs font-semibold text-[#14181A]">
                Query catalog
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-[#F3F1EA] text-[#4B5250] border border-[#DEDAD1] font-semibold">
                14 of 14
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              {QUERY_LIST.map((q) => {
                const isSelected = selectedQueryId === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQueryId(q.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-3 text-xs transition-colors flex flex-col cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F3F1EA] border-[#3E6259] text-[#14181A]'
                        : 'bg-[#FFFFFF] border-[#DEDAD1] hover:border-[#4B5250] text-[#4B5250]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-semibold ${isSelected ? 'text-[#14181A]' : 'text-[#14181A]'}`}>
                        {q.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 font-medium border ${
                        isSelected ? 'bg-[#3E6259]/10 text-[#3E6259] border-[#3E6259]/30' : 'bg-[#F3F1EA] text-[#4B5250] border-[#DEDAD1]'
                      }`}>
                        {q.category}
                      </span>
                    </div>
                    <span className="text-[11px] mt-1.5 text-[#4B5250] leading-snug">
                      {q.concept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Execution & Live Results */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-16 text-center text-[#4B5250] space-y-3" aria-live="polite">
                <p className="text-xs font-semibold text-[#14181A]">Executing query on relational database…</p>
                <p className="text-[11px] text-[#4B5250]">Running normalized SQLite/Oracle transaction</p>
              </div>
            ) : queryData ? (
              <>
                {/* Query Header & Monaco-style SQL Viewer */}
                <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold text-[#3E6259] bg-[#3E6259]/10 border border-[#3E6259]/30 px-2 py-0.5">
                          Active query
                        </span>
                        <span className="text-xs text-[#4B5250]">
                          {executionTime !== null ? `${executionTime} ms` : 'Executed'}
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-medium tracking-tight text-[#14181A]">
                        {queryData.title}
                      </h3>
                      <p className="text-xs text-[#4B5250]">
                        {queryData.concept}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={copySql}
                        aria-label="Copy SQL query"
                        className="px-3 py-2 border border-[#DEDAD1] bg-[#FFFFFF] hover:bg-[#F3F1EA] text-[#4B5250] hover:text-[#14181A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#3E6259]" /> : <Copy className="w-3.5 h-3.5 text-[#4B5250]" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fetchQuery(selectedQueryId)}
                        aria-label="Re-execute SQL query"
                        className="px-4 py-2 bg-[#3E6259] hover:bg-[#2E4A43] text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Run query</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Frame */}
                  <div className="border border-[#DEDAD1] bg-[#14181A] p-4 text-[#F3F1EA] overflow-hidden">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-[#DEDAD1]/60">
                      <span className="text-[#DEDAD1]/80">query_{selectedQueryId}.sql</span>
                      <span>SQL / Relational Dialect</span>
                    </div>
                    <pre className="text-[#A7D7C5] text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {queryData.sql}
                    </pre>
                  </div>
                </div>

                {/* Data Grid Results Table */}
                <div className="bg-[#FFFFFF] border border-[#DEDAD1] overflow-hidden">
                  <div className="p-4 bg-[#F3F1EA] border-b border-[#DEDAD1] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <TableProperties className="w-4 h-4 text-[#4B5250]" />
                      <span className="font-semibold text-[#14181A]">
                        Query result set
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-[#FFFFFF] border border-[#DEDAD1] text-[#4B5250] font-semibold">
                        {queryData.rows.length} {queryData.rows.length === 1 ? 'row' : 'rows'}
                      </span>
                    </div>
                    <span className="text-[#4B5250] text-[11px]">
                      Engine: Relational Database
                    </span>
                  </div>

                  {queryData.rows.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#4B5250]">
                      Zero records returned for the current database state.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                      <table className="w-full text-left text-xs font-mono tabular-nums">
                        <thead className="bg-[#F3F1EA] border-b border-[#DEDAD1] text-[#14181A] font-semibold sticky top-0">
                          <tr>
                            {Object.keys(queryData.rows[0]).map((key) => (
                              <th key={key} className="p-3.5 whitespace-nowrap text-[11px] font-semibold text-[#4B5250]">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DEDAD1] text-[#14181A]">
                          {queryData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#F3F1EA]/60 transition-colors">
                              {Object.values(row).map((val: any, vIdx) => (
                                <td key={vIdx} className="p-3.5 whitespace-nowrap">
                                  {val !== null && val !== undefined ? (
                                    <span className={typeof val === 'number' ? 'text-[#14181A] font-semibold' : 'text-[#14181A]'}>
                                      {String(val)}
                                    </span>
                                  ) : (
                                    <span className="text-[#4B5250]/40 italic">NULL</span>
                                  )}
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Procedures Card */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center text-[#3E6259]">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#14181A]">Stored procedures</h3>
                <p className="text-xs text-[#4B5250] leading-relaxed">
                  Transactional business routines ensuring ACID properties and status synchronization:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">add_pet()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Validates foreign keys & registers companion</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">record_swipe()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Upserts swipe & triggers mutual match</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">submit_adoption_application()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Locks pet status to Pending</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">approve_adoption()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Atomic approval transaction & Pet=Adopted</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">reject_adoption()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Atomic rejection & reopens Pet=Available</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#DEDAD1] flex items-center justify-between text-xs text-[#4B5250]">
                <span>5 procedures</span>
                <span className="text-[#3E6259] font-semibold">100% Tested</span>
              </div>
            </div>

            {/* Functions Card */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center text-[#3E6259]">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#14181A]">Deterministic functions</h3>
                <p className="text-xs text-[#4B5250] leading-relaxed">
                  Pure evaluation and aggregation subroutines returning typed scalar values:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">get_available_pet_count()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Returns census by shelter or global scope</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">get_adopter_match_count()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Returns active mutual match cardinality</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#14181A]">is_pet_suitable_for_adopter()</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Validates species, size & age preference bounds</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#DEDAD1] flex items-center justify-between text-xs text-[#4B5250]">
                <span>3 functions</span>
                <span className="text-[#3E6259] font-semibold">Deterministic</span>
              </div>
            </div>

            {/* Triggers Card */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 bg-[#F3F1EA] border border-[#DEDAD1] flex items-center justify-center text-[#3E6259]">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#14181A]">Database triggers</h3>
                <p className="text-xs text-[#4B5250] leading-relaxed">
                  Automated constraint enforcement and cascading state updates:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#3E6259]">trg_prevent_invalid_pet_status</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Rejects illegal Available → Adopted jumps</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#3E6259]">trg_decision_update_pet_status</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Cascades SHELTER_DECISION to PET status</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#3E6259]">trg_prevent_duplicate_application</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Enforces single active application per pet/adopter</span>
                  </div>
                  <div className="p-3 bg-[#F3F1EA] border border-[#DEDAD1] text-xs">
                    <span className="font-mono font-semibold text-[#3E6259]">trg_single_primary_photo</span>
                    <span className="block text-[11px] text-[#4B5250] mt-0.5">Maintains strictly 1 primary hero photo</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#DEDAD1] flex items-center justify-between text-xs text-[#4B5250]">
                <span>4 triggers</span>
                <span className="text-[#3E6259] font-semibold">Active enforcement</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#DEDAD1] text-xs text-[#4B5250] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#3E6259]" />
              <span>Full Oracle & SQLite scripts available in repository:</span>
            </div>
            <code className="text-[#14181A] font-mono bg-[#F3F1EA] px-3 py-1 border border-[#DEDAD1] font-semibold text-[11px]">
              database/04_plsql.sql
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

