'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Play,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  Network,
  GitFork,
  Cpu,
  Compass,
  CheckCircle2,
  Users,
  Building2,
  Tag,
  HeartHandshake,
  Clock,
  Zap,
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Split,
  Eye
} from 'lucide-react';
import { ACADEMIC_CYPHER_QUERIES, CypherQueryResult, GraphNode, GraphEdge } from '@/lib/neo4j';

export default function GraphLab() {
  const [activeTab, setActiveTab] = useState<'cypher' | 'topology' | 'collaborative'>('cypher');
  const [selectedQueryId, setSelectedQueryId] = useState(1);
  const [queryResult, setQueryResult] = useState<CypherQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Topology data
  const [topology, setTopology] = useState<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    summary: any;
  } | null>(null);

  // Collaborative filtering demo state
  const [demoAdopterId, setDemoAdopterId] = useState(1);
  const [demoRecommendations, setDemoRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch selected Cypher query
  const executeQuery = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/queries?id=${id}`);
      const data = await res.json();
      setQueryResult(data);
      if (data.graphData?.nodes?.length > 0) {
        setSelectedNode(data.graphData.nodes[0]);
      }
    } catch (e) {
      console.error('Failed to execute Cypher query:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full topology
  const fetchTopology = async () => {
    try {
      const res = await fetch('/api/graph/queries?mode=topology');
      const data = await res.json();
      setTopology(data);
    } catch (e) {
      console.error('Failed to fetch topology:', e);
    }
  };

  // Fetch recommendations for demo
  const fetchRecommendations = async (adopterId: number) => {
    setLoadingRecs(true);
    try {
      const res = await fetch(`/api/graph/recommendations?adopterId=${adopterId}`);
      const data = await res.json();
      setDemoRecommendations(data.recommendations || []);
    } catch (e) {
      console.error('Failed to fetch recommendations:', e);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    executeQuery(selectedQueryId);
    fetchTopology();
    fetchRecommendations(demoAdopterId);
  }, []);

  useEffect(() => {
    executeQuery(selectedQueryId);
  }, [selectedQueryId]);

  useEffect(() => {
    fetchRecommendations(demoAdopterId);
  }, [demoAdopterId]);

  const copyCypher = () => {
    if (queryResult?.cypher) {
      navigator.clipboard.writeText(queryResult.cypher);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Node color helper
  const getNodeColor = (label: string) => {
    switch (label) {
      case 'Adopter':
        return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', dot: '#FBBF24' };
      case 'Pet':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#38BDF8', dot: '#0284C7' };
      case 'Shelter':
        return { bg: '#FCE7F3', text: '#9D174D', border: '#F472B6', dot: '#DB2777' };
      case 'Breed':
        return { bg: '#DCFCE7', text: '#166534', border: '#4ADE80', dot: '#16A34A' };
      case 'Species':
        return { bg: '#F3E8FF', text: '#6B21A8', border: '#C084FC', dot: '#9333EA' };
      case 'Staff':
        return { bg: '#FFEDD5', text: '#9A3412', border: '#FB923C', dot: '#EA580C' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF', dot: '#6B7280' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-[#B45309] uppercase tracking-wider">
                Graph Database Engine
              </span>
              <span className="text-[#DEDAD1] text-xs">•</span>
              <span className="text-[11px] text-[#4B5250]">Neo4j / Cypher • Index-Free Adjacency (DBMS DA3)</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#14181A] tracking-tight font-medium">
              Neo4j Graph Network & Cypher Studio
            </h1>

            <p className="text-xs text-[#4B5250] max-w-2xl leading-relaxed">
              Property graph architecture modeling adopters, pets, shelters, and breed taxonomies with pointer-based multi-hop traversals, collaborative filtering, and sub-millisecond query evaluation.
            </p>
          </div>

          {/* View switcher tabs */}
          <div
            className="flex items-center space-x-1 border border-[#DEDAD1] p-1 bg-[#F3F1EA] self-start lg:self-center"
            role="tablist"
            aria-label="Graph Studio Views"
          >
            <button
              type="button"
              onClick={() => setActiveTab('cypher')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                activeTab === 'cypher'
                  ? 'bg-[#FFFFFF] text-[#14181A] shadow-xs'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Network className="w-3.5 h-3.5 text-[#B45309]" />
                <span>12 Cypher Queries</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collaborative')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                activeTab === 'collaborative'
                  ? 'bg-[#FFFFFF] text-[#14181A] shadow-xs'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Recommendation Engine</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                activeTab === 'topology'
                  ? 'bg-[#FFFFFF] text-[#14181A] shadow-xs'
                  : 'text-[#4B5250] hover:text-[#14181A]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Full Graph Topology</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CYPHER ACADEMIC STUDIO */}
      {activeTab === 'cypher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Query Selector Sidebar */}
          <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#DEDAD1] divide-y divide-[#DEDAD1]">
            <div className="p-4 bg-[#F3F1EA]/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#14181A]">
                12 Academic Cypher Queries
              </span>
              <span className="text-[11px] text-[#4B5250]">DA3 Evaluator</span>
            </div>

            <div className="max-h-[700px] overflow-y-auto divide-y divide-[#DEDAD1]">
              {ACADEMIC_CYPHER_QUERIES.map((q) => {
                const isSelected = selectedQueryId === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQueryId(q.id)}
                    className={`w-full p-3.5 text-left transition-colors flex flex-col space-y-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FEF9C3] border-l-4 border-l-[#F59E0B]'
                        : 'hover:bg-[#F3F1EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F3F1EA] text-[#4B5250] font-semibold">
                        {q.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-[#B45309] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#B45309]" />
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#14181A] line-clamp-2">
                      {q.title}
                    </span>
                    <span className="text-[11px] text-[#4B5250] line-clamp-1">
                      {q.concept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Query Details & Visualizer Main Stage */}
          <div className="lg:col-span-8 space-y-6">
            {/* Cypher Code Box */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEDAD1]">
                <div>
                  <h2 className="text-sm font-semibold text-[#14181A]">
                    {queryResult?.title || 'Loading query...'}
                  </h2>
                  <p className="text-xs text-[#4B5250] mt-0.5">
                    {queryResult?.concept}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F3F1EA] text-[#14181A] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#B45309]" />
                    {queryResult?.executionTimeMs ?? 1.2} ms
                  </span>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    {queryResult?.engineUsed || 'Graph Engine (Local)'}
                  </span>

                  <button
                    type="button"
                    onClick={copyCypher}
                    className="p-1.5 rounded hover:bg-[#F3F1EA] border border-[#DEDAD1] text-[#4B5250] hover:text-[#14181A] transition-colors cursor-pointer"
                    title="Copy Cypher Query"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Cypher Preformatted Code */}
              <div className="relative">
                <pre className="p-4 bg-[#14181A] text-[#F3F1EA] text-xs font-mono rounded overflow-x-auto leading-relaxed border border-[#2D3335]">
                  <code>{queryResult?.cypher}</code>
                </pre>
              </div>

              {/* Relational vs Graph Comparison Alert */}
              <div className="p-3.5 bg-[#FEF9C3] border-l-4 border-l-[#F59E0B] text-xs text-[#14181A] flex items-start space-x-3">
                <Split className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-[#B45309]">
                    Relational vs Graph Architectural Difference:
                  </span>
                  <p className="text-[#4B5250] leading-relaxed">
                    {queryResult?.relationalComparison}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Subgraph Visualizer */}
            {queryResult?.graphData && queryResult.graphData.nodes.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-[#B45309]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#14181A]">
                      Live Traversed Subgraph
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#4B5250]">
                    {queryResult.graphData.nodes.length} Nodes • {queryResult.graphData.edges.length} Relationships
                  </span>
                </div>

                {/* Visualizer Canvas / Node Badges */}
                <div className="p-6 bg-[#FAF9F5] border border-[#DEDAD1] rounded flex flex-wrap gap-3 items-center justify-center min-h-[140px]">
                  {queryResult.graphData.nodes.map((n) => {
                    const color = getNodeColor(n.label);
                    const isSelected = selectedNode?.id === n.id;
                    return (
                      <button
                        key={String(n.id)}
                        type="button"
                        onClick={() => setSelectedNode(n)}
                        style={{
                          backgroundColor: color.bg,
                          borderColor: isSelected ? '#14181A' : color.border,
                          color: color.text,
                        }}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                          isSelected ? 'ring-2 ring-[#FBBF24] ring-offset-1 scale-105' : 'hover:scale-102'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: color.dot }}
                        />
                        <span className="font-semibold">{n.label}:</span>
                        <span>{n.name}</span>
                        {n.subtext && <span className="text-[10px] opacity-75">({n.subtext})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Subgraph Edge Traversal Paths */}
                {queryResult.graphData.edges.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-[#4B5250] uppercase tracking-wider">
                      Traversed Relationships
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {queryResult.graphData.edges.map((e) => (
                        <div
                          key={e.id}
                          className="px-2.5 py-1 rounded bg-[#F3F1EA] border border-[#DEDAD1] text-[11px] font-mono text-[#14181A] flex items-center space-x-1.5"
                        >
                          <span className="text-[#4B5250]">{String(e.source)}</span>
                          <span className="font-bold text-[#B45309]">-[{e.type}]-&gt;</span>
                          <span className="text-[#4B5250]">{String(e.target)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Node Inspector */}
                {selectedNode && (
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#DEDAD1] rounded text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#14181A] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#B45309]" />
                        Node Inspector: {selectedNode.label} &quot;{selectedNode.name}&quot;
                      </span>
                      <span className="text-[10px] font-mono text-[#4B5250]">ID: {selectedNode.id}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                        <div key={key} className="bg-[#FAF9F5] p-2 rounded border border-[#EBE8DF]">
                          <span className="font-mono text-[10px] text-[#4B5250] block">{key}</span>
                          <span className="font-medium text-[#14181A] truncate block">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Query Rows Result Table */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] overflow-hidden">
              <div className="p-4 bg-[#F3F1EA]/50 border-b border-[#DEDAD1] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#14181A]">
                  Cypher Traversal Output
                </span>
                <span className="text-[11px] text-[#4B5250]">
                  {queryResult?.rows?.length || 0} Records Returned
                </span>
              </div>

              {queryResult?.rows && queryResult.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-[#DEDAD1]">
                    <thead className="bg-[#FAF9F5] font-semibold text-[#14181A]">
                      <tr>
                        {Object.keys(queryResult.rows[0]).map((col) => (
                          <th key={col} className="px-4 py-2.5 font-medium uppercase text-[10px] text-[#4B5250]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDAD1] font-mono text-[11px] text-[#14181A]">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                          {Object.values(row).map((val: any, colIdx) => (
                            <td key={colIdx} className="px-4 py-2.5 whitespace-nowrap">
                              {Array.isArray(val) ? val.join(', ') : String(val ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#4B5250]">
                  No records returned or executing...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLABORATIVE FILTERING RECOMMENDATION SANDBOX */}
      {activeTab === 'collaborative' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDAD1]">
              <div>
                <h2 className="text-base font-serif font-medium text-[#14181A]">
                  Graph-Powered Collaborative Filtering Engine
                </h2>
                <p className="text-xs text-[#4B5250] mt-0.5">
                  Recommends pets by traversing bipartite affinity projections: (Adopter)-[:SWIPED_RIGHT]-&gt;(Shared)&lt;-[:SWIPED_RIGHT]-(Peer)-[:SWIPED_RIGHT]-&gt;(Recommendation)
                </p>
              </div>

              {/* Switch active adopter for recommendation demo */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-medium text-[#4B5250]">Target Adopter:</span>
                <select
                  value={demoAdopterId}
                  onChange={(e) => setDemoAdopterId(Number(e.target.value))}
                  aria-label="Target Adopter for Collaborative Recommendations"
                  className="text-xs font-medium bg-[#FAF9F5] border border-[#DEDAD1] rounded px-3 py-1.5 text-[#14181A] cursor-pointer"
                >
                  <option value={1}>Rahul Sharma • Bangalore (Prefers Dogs)</option>
                  <option value={2}>Priya Patel • Mumbai (Prefers Cats)</option>
                  <option value={3}>Ananya Iyer • Chennai (Prefers Medium Dogs)</option>
                </select>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {demoRecommendations.map((rec) => (
                <div
                  key={rec.petId}
                  className="bg-[#FAF9F5] border border-[#DEDAD1] rounded-sm p-4 space-y-3.5 hover:border-[#F59E0B] transition-all"
                >
                  <div className="relative aspect-4/3 rounded overflow-hidden border border-[#DEDAD1]">
                    <img
                      src={rec.photoUrl}
                      alt={rec.petName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#14181A] text-[11px] font-bold shadow-xs">
                      {rec.matchScore}% Affinity
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-lg font-medium text-[#14181A]">
                        {rec.petName}
                      </h3>
                      <span className="text-xs text-[#4B5250]">
                        {rec.ageMonths} mos • {rec.size}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#B45309] block">
                      {rec.breed}
                    </span>
                    <span className="text-[11px] text-[#4B5250]">
                      {rec.shelterName} • {rec.shelterCity}
                    </span>
                  </div>

                  {/* Recommendation Rationale */}
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#EBE8DF] rounded text-xs space-y-1.5">
                    <span className="font-semibold text-[#14181A] text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#B45309]" />
                      Graph Traversal Reason:
                    </span>
                    <p className="text-[11px] text-[#4B5250] leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Path Visualizer */}
                  {rec.graphTraversalPath && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#4B5250]">
                        Path Traversal Chain:
                      </span>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                        {rec.graphTraversalPath.map((segment: string, sIdx: number) => (
                          <React.Fragment key={sIdx}>
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                segment.startsWith('[:')
                                  ? 'bg-[#FEF3C7] text-[#92400E] font-bold'
                                  : 'bg-[#E5E7EB] text-[#1F2937]'
                              }`}
                            >
                              {segment}
                            </span>
                            {sIdx < rec.graphTraversalPath.length - 1 && (
                              <span className="text-[#9CA3AF]">➔</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FULL GRAPH TOPOLOGY EXPLORER */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          {/* Summary metrics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-4 rounded-sm">
              <span className="text-[11px] uppercase font-semibold text-[#4B5250]">Total Nodes</span>
              <p className="font-serif text-3xl font-medium text-[#14181A] mt-1">
                {topology?.summary?.totalNodes || 39}
              </p>
              <span className="text-[10px] text-[#B45309] font-medium">6 Distinct Labels</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-4 rounded-sm">
              <span className="text-[11px] uppercase font-semibold text-[#4B5250]">Total Relationships</span>
              <p className="font-serif text-3xl font-medium text-[#14181A] mt-1">
                {topology?.summary?.totalEdges || 62}
              </p>
              <span className="text-[10px] text-[#B45309] font-medium">10 Relationship Types</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-4 rounded-sm">
              <span className="text-[11px] uppercase font-semibold text-[#4B5250]">Index-Free Adjacency</span>
              <p className="font-serif text-3xl font-medium text-[#14181A] mt-1">O(1)</p>
              <span className="text-[10px] text-[#16A34A] font-medium">Constant time per hop</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-4 rounded-sm">
              <span className="text-[11px] uppercase font-semibold text-[#4B5250]">Graph Algorithms</span>
              <p className="font-serif text-3xl font-medium text-[#14181A] mt-1">3</p>
              <span className="text-[10px] text-[#B45309] font-medium">Jaccard, Centrality, Paths</span>
            </div>
          </div>

          {/* Detailed Node and Edge Manifest */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Node Breakdown */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#DEDAD1]">
                <Users className="w-4 h-4 text-[#B45309]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#14181A]">
                  Node Labels & Entity Distribution
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Pet', count: 16, desc: 'Candidate rescue animals with age, size, gender & traits', color: '#0284C7' },
                  { label: 'Breed', count: 10, desc: 'Taxonomy grouping for dogs & cats with energy levels', color: '#16A34A' },
                  { label: 'Adopter', count: 6, desc: 'Registered prospective adopters with preference vectors', color: '#F59E0B' },
                  { label: 'Shelter', count: 5, desc: 'Licensed rescue centers across Bangalore, Mumbai, etc.', color: '#DB2777' },
                  { label: 'Staff', count: 6, desc: 'Shelter managers, veterinarians & adoption coordinators', color: '#EA580C' },
                  { label: 'Species', count: 2, desc: 'Root biological classification (Dog / Cat)', color: '#9333EA' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-[#FAF9F5] rounded border border-[#EBE8DF] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#14181A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        (:{item.label})
                      </span>
                      <span className="text-[11px] text-[#4B5250]">{item.desc}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#14181A] ml-4">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship Breakdown */}
            <div className="bg-[#FFFFFF] border border-[#DEDAD1] p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#DEDAD1]">
                <GitFork className="w-4 h-4 text-[#B45309]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#14181A]">
                  Directed Relationship Manifest
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { type: '[:SWIPED {direction}]', from: 'Adopter', to: 'Pet', desc: 'Tinder swipe interactions with timestamps' },
                  { type: '[:MATCHED_WITH]', from: 'Adopter', to: 'Pet', desc: 'Mutual active match connections' },
                  { type: '[:APPLIED_FOR]', from: 'Adopter', to: 'Pet', desc: 'Official adoption application with home visit' },
                  { type: '[:PREFERS_BREED]', from: 'Adopter', to: 'Breed', desc: 'User registered breed affinity' },
                  { type: '[:PREFERS_SPECIES]', from: 'Adopter', to: 'Species', desc: 'Species preferences with age/size ranges' },
                  { type: '[:IS_OF_BREED]', from: 'Pet', to: 'Breed', desc: 'Biological breed linkage' },
                  { type: '[:BELONGS_TO]', from: 'Pet', to: 'Shelter', desc: 'Shelter physical custody' },
                  { type: '[:WORKS_AT]', from: 'Staff', to: 'Shelter', desc: 'Staff employment relation' },
                  { type: '[:DECIDED]', from: 'Staff', to: 'Pet', desc: 'Adjudication decision log' },
                ].map((rel, idx) => (
                  <div key={idx} className="p-2.5 bg-[#FAF9F5] rounded border border-[#EBE8DF] flex flex-col space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#B45309]">{rel.type}</span>
                      <span className="text-[10px] text-[#4B5250]">
                        ({rel.from}) ➔ ({rel.to})
                      </span>
                    </div>
                    <span className="font-sans text-[11px] text-[#4B5250]">{rel.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
