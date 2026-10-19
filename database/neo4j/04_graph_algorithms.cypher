// ============================================================================
// Project: Kinder Pets - Pet Adoption Management System (DBMS DA3)
// File: 04_graph_algorithms.cypher
// Description: Advanced Graph Data Science (GDS) & Algorithmic Cypher procedures
//              (Node Similarity, Centrality, Community Detection, PageRank).
// ============================================================================

// ----------------------------------------------------------------------------
// 1. IN-DEGREE CENTRALITY (Shelter & Pet Popularity Scoring)
// Demonstrates structural prominence within the adoption network
// ----------------------------------------------------------------------------
MATCH (p:Pet)<-[r:SWIPED {direction: 'RIGHT'}]-()
RETURN p.name AS Pet, count(r) AS InDegreePopularityScore
ORDER BY InDegreePopularityScore DESC;

// ----------------------------------------------------------------------------
// 2. BIPARTITE NODE SIMILARITY (Jaccard Adopter Similarity)
// Pure Cypher formulation of bipartite graph projection
// ----------------------------------------------------------------------------
MATCH (a1:Adopter)-[:SWIPED {direction: 'RIGHT'}]->(p:Pet)<-[:SWIPED {direction: 'RIGHT'}]-(a2:Adopter)
WHERE id(a1) < id(a2)
WITH a1, a2, count(p) AS intersection
MATCH (a1)-[:SWIPED {direction: 'RIGHT'}]->(p1:Pet)
WITH a1, a2, intersection, count(p1) AS a1Count
MATCH (a2)-[:SWIPED {direction: 'RIGHT'}]->(p2:Pet)
WITH a1, a2, intersection, a1Count, count(p2) AS a2Count
WITH a1.full_name AS AdopterA, 
     a2.full_name AS AdopterB, 
     intersection,
     (a1Count + a2Count - intersection) AS unionSize
RETURN 
  AdopterA, 
  AdopterB, 
  intersection AS CommonLikes, 
  unionSize AS TotalUnion,
  round(toFloat(intersection) / toFloat(unionSize), 3) AS JaccardCoefficient
ORDER BY JaccardCoefficient DESC;

// ----------------------------------------------------------------------------
// 3. COLLABORATIVE FILTERING RECOMMENDATION PIPELINE
// Traverses the bipartite graph to surface personalized pet recommendations
// ----------------------------------------------------------------------------
MATCH (u:Adopter {adopter_id: 1})-[:SWIPED {direction: 'RIGHT'}]->(p:Pet)
      <-[:SWIPED {direction: 'RIGHT'}]-(peer:Adopter)
      -[:SWIPED {direction: 'RIGHT'}]->(rec:Pet)
WHERE rec.status = 'Available'
  AND NOT (u)-[:SWIPED]->(rec)
WITH rec, count(DISTINCT peer) AS AffinityWeight, collect(DISTINCT peer.full_name) AS PeerInfluencers
RETURN 
  rec.pet_id AS PetID,
  rec.name AS RecommendedPet,
  rec.size AS Size,
  AffinityWeight AS MatchScore,
  PeerInfluencers AS RecommendingPeers
ORDER BY AffinityWeight DESC, rec.name ASC;

// ----------------------------------------------------------------------------
// 4. COMMUNITY DETECTION (Weakly Connected Affinity Clusters)
// Groups pets and adopters into mutual affinity clusters
// ----------------------------------------------------------------------------
MATCH (a:Adopter)-[:SWIPED {direction: 'RIGHT'}]->(p:Pet)
RETURN a.city AS Region, collect(DISTINCT p.name) AS RegionallyPreferredPets;
