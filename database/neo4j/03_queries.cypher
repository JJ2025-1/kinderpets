// ============================================================================
// Project: Kinder Pets - Pet Adoption Management System (DBMS DA3)
// File: 03_queries.cypher
// Description: 12 Academic Cypher Queries demonstrating Graph Database capabilities
//              (Index-free adjacency, path pattern matching, collaborative filtering,
//              bipartite graph projections, and network analytics).
// ============================================================================

// ----------------------------------------------------------------------------
// QUERY 1: Discover Pets Matching Adopter Breed Preference (Multi-Hop Traversal)
// Concept: Graph pattern matching along path (Adopter)->[:PREFERS_BREED]->(Breed)<-[:IS_OF_BREED]-(Pet)
// Relational Equivalent: 3-table JOIN (ADOPTER_PREFERENCE + PREFERRED_BREED + PET)
// ----------------------------------------------------------------------------
MATCH (a:Adopter {adopter_id: 1})-[:PREFERS_BREED]->(b:Breed)<-[:IS_OF_BREED]-(p:Pet)-[:BELONGS_TO]->(s:Shelter)
WHERE p.status = 'Available'
RETURN 
  a.full_name AS Adopter,
  b.name AS PreferredBreed,
  p.name AS PetName,
  p.gender AS Gender,
  p.age_months AS AgeMonths,
  p.size AS Size,
  s.name AS Shelter,
  s.city AS City
ORDER BY p.name;

// ----------------------------------------------------------------------------
// QUERY 2: Collaborative Filtering Recommendation Engine (2-Hop Projection)
// Concept: Find pets swiped 'RIGHT' by other adopters who shared at least one right swipe with Adopter 1
// Pattern: (TargetAdopter)-[:SWIPED {direction: 'RIGHT'}]->(SharedPet)<-[:SWIPED {direction: 'RIGHT'}]-(SimilarAdopter)-[:SWIPED {direction: 'RIGHT'}]->(RecommendedPet)
// Relational Equivalent: Self-join on SWIPE table with 4 instances + subquery NOT IN
// ----------------------------------------------------------------------------
MATCH (target:Adopter {adopter_id: 1})-[r1:SWIPED {direction: 'RIGHT'}]->(shared:Pet)
      <-[r2:SWIPED {direction: 'RIGHT'}]-(other:Adopter)
      -[r3:SWIPED {direction: 'RIGHT'}]->(rec:Pet)
WHERE rec.status = 'Available'
  AND NOT (target)-[:SWIPED]->(rec)
RETURN 
  rec.name AS RecommendedPet,
  rec.size AS Size,
  rec.age_months AS AgeMonths,
  other.full_name AS LikedBySimilarAdopter,
  shared.name AS SharedAffinityPet,
  count(DISTINCT other) AS RecommendationStrength
ORDER BY RecommendationStrength DESC, rec.name;

// ----------------------------------------------------------------------------
// QUERY 3: Active Matches Subgraph with Contact & Shelter Details
// Concept: Bidirectional graph edge retrieval with traversal to Shelter node
// ----------------------------------------------------------------------------
MATCH (a:Adopter)-[m:MATCHED_WITH {status: 'Active'}]->(p:Pet)-[:BELONGS_TO]->(s:Shelter)
RETURN 
  m.match_id AS MatchID,
  a.full_name AS AdopterName,
  a.email AS ContactEmail,
  a.city AS AdopterCity,
  p.name AS MatchedPet,
  p.status AS PetStatus,
  s.name AS ShelterName,
  s.city AS ShelterCity,
  m.matched_at AS MatchedTimestamp
ORDER BY m.matched_at DESC;

// ----------------------------------------------------------------------------
// QUERY 4: Full Adoption Lifecycle Pathway Audit Trail
// Concept: End-to-end path traversal from Adopter expression to final Staff Adjudication
// Pattern: (Adopter)-[SWIPED]->(Pet)-[BELONGS_TO]->(Shelter) + (Staff)-[DECIDED]->(Pet)
// ----------------------------------------------------------------------------
MATCH (a:Adopter)-[sw:SWIPED {direction: 'RIGHT'}]->(p:Pet)-[:BELONGS_TO]->(s:Shelter)
OPTIONAL MATCH (a)-[m:MATCHED_WITH]->(p)
OPTIONAL MATCH (a)-[app:APPLIED_FOR]->(p)
OPTIONAL MATCH (st:Staff)-[dec:DECIDED]->(p)
RETURN 
  a.full_name AS Adopter,
  p.name AS Pet,
  s.name AS Shelter,
  m.status AS MatchStatus,
  app.status AS ApplicationStatus,
  app.home_visit_date AS HomeVisitDate,
  dec.decision AS FinalDecision,
  st.name AS AdjudicatingStaff;

// ----------------------------------------------------------------------------
// QUERY 5: In-Degree Centrality / Pet Popularity Ranking
// Concept: Graph node centrality based on incoming 'RIGHT' swipe relationships
// Relational Equivalent: GROUP BY with aggregate COUNT over foreign keys
// ----------------------------------------------------------------------------
MATCH (p:Pet)<-[r:SWIPED {direction: 'RIGHT'}]-(a:Adopter)
MATCH (p)-[:IS_OF_BREED]->(b:Breed)
MATCH (p)-[:BELONGS_TO]->(s:Shelter)
RETURN 
  p.pet_id AS PetID,
  p.name AS PetName,
  b.name AS Breed,
  s.city AS ShelterCity,
  count(r) AS TotalRightSwipes,
  collect(a.full_name) AS InterestedAdopters
ORDER BY TotalRightSwipes DESC, p.name;

// ----------------------------------------------------------------------------
// QUERY 6: Adopter Jaccard Similarity on Pet Affinity Graph
// Concept: Compute affinity coefficient between adopters based on shared RIGHT swipes
// Formula: J(A, B) = |Swiped_Right(A) ∩ Swiped_Right(B)| / |Swiped_Right(A) ∪ Swiped_Right(B)|
// ----------------------------------------------------------------------------
MATCH (a1:Adopter {adopter_id: 1})-[r1:SWIPED {direction: 'RIGHT'}]->(p:Pet)
WITH a1, collect(id(p)) AS a1Pets
MATCH (a2:Adopter)-[r2:SWIPED {direction: 'RIGHT'}]->(p:Pet)
WHERE a1 <> a2
WITH a1, a2, a1Pets, collect(id(p)) AS a2Pets
WITH a1.full_name AS Adopter1,
     a2.full_name AS Adopter2,
     [x IN a1Pets WHERE x IN a2Pets] AS intersection,
     a1Pets + [x IN a2Pets WHERE NOT x IN a1Pets] AS union
RETURN 
  Adopter1,
  Adopter2,
  size(intersection) AS SharedLikedPets,
  size(union) AS TotalDistinctLikedPets,
  round((toFloat(size(intersection)) / toFloat(size(union))) * 100, 2) AS JaccardSimilarityPercent
ORDER BY JaccardSimilarityPercent DESC;

// ----------------------------------------------------------------------------
// QUERY 7: Shelter Geographic Reach & Cross-City Adoption Connections
// Concept: Graph connectivity mapping adopter location to pet shelter location
// ----------------------------------------------------------------------------
MATCH (a:Adopter)-[:SWIPED {direction: 'RIGHT'}]->(p:Pet)-[:BELONGS_TO]->(s:Shelter)
RETURN 
  a.city AS AdopterOriginCity,
  s.city AS ShelterLocationCity,
  s.name AS ShelterName,
  count(p) AS InteractionVolume,
  CASE WHEN a.city = s.city THEN 'Local Adoption' ELSE 'Intercity Adoption' END AS AdoptionScope
ORDER BY InteractionVolume DESC;

// ----------------------------------------------------------------------------
// QUERY 8: High-Contention Detection (Multiple Applications on Same Pet)
// Concept: Multi-edge convergence on a single Pet node indicating high competition
// ----------------------------------------------------------------------------
MATCH (a:Adopter)-[app:APPLIED_FOR]->(p:Pet)
WHERE p.status IN ['Available', 'Pending']
WITH p, count(app) AS ApplicantCount, collect(a.full_name) AS ApplicantNames
WHERE ApplicantCount >= 1
MATCH (p)-[:BELONGS_TO]->(s:Shelter)
RETURN 
  p.name AS PetName,
  p.status AS CurrentStatus,
  s.name AS Shelter,
  ApplicantCount,
  ApplicantNames
ORDER BY ApplicantCount DESC;

// ----------------------------------------------------------------------------
// QUERY 9: Shortest Path Between Adopter and Pet via Breed Taxonomy
// Concept: Pathfinding traversing preference subgraphs to explain why a pet was suggested
// ----------------------------------------------------------------------------
MATCH path = shortestPath((a:Adopter {adopter_id: 1})-[*..4]-(p:Pet {pet_id: 3}))
RETURN 
  path,
  length(path) AS HopCount,
  [n in nodes(path) | labels(n)[0]] AS NodeSequence;

// ----------------------------------------------------------------------------
// QUERY 10: Aggregated Pet Inventory by Shelter with Breakdown
// Concept: Aggregation using graph node relationships and Cypher CASE projections
// ----------------------------------------------------------------------------
MATCH (s:Shelter)<-[:BELONGS_TO]-(p:Pet)
RETURN 
  s.name AS ShelterName,
  s.city AS City,
  count(p) AS TotalRescuedPets,
  count(CASE WHEN p.status = 'Available' THEN 1 END) AS AvailableCount,
  count(CASE WHEN p.status = 'Pending' THEN 1 END) AS PendingCount,
  count(CASE WHEN p.status = 'Adopted' THEN 1 END) AS AdoptedCount
ORDER BY TotalRescuedPets DESC;

// ----------------------------------------------------------------------------
// QUERY 11: Dynamic Preference Satisfaction Scoring along Traversal
// Concept: Calculate multi-factor match score (Species + Breed + Size) along graph edges
// ----------------------------------------------------------------------------
MATCH (a:Adopter {adopter_id: 1})-[:PREFERS_SPECIES]->(sp:Species)<-[:BELONGS_TO_SPECIES]-(b:Breed)<-[:IS_OF_BREED]-(p:Pet)
OPTIONAL MATCH (a)-[pb:PREFERS_BREED]->(b)
WHERE p.status = 'Available'
RETURN 
  p.name AS PetName,
  b.name AS Breed,
  p.size AS Size,
  sp.name AS Species,
  CASE WHEN pb IS NOT NULL THEN 50 ELSE 20 END +
  CASE WHEN p.size = 'Large' THEN 30 ELSE 10 END +
  CASE WHEN p.age_months <= 36 THEN 20 ELSE 5 END AS CompatibilityScoreOutOf100
ORDER BY CompatibilityScoreOutOf100 DESC;

// ----------------------------------------------------------------------------
// QUERY 12: Under-Discovered / Unswiped Pets Identification (Graph Negation)
// Concept: Identification of isolated or unvisited nodes in the behavioral graph
// Relational Equivalent: LEFT JOIN with NULL check or NOT EXISTS subquery
// ----------------------------------------------------------------------------
MATCH (p:Pet)-[:BELONGS_TO]->(s:Shelter)
WHERE p.status = 'Available'
  AND NOT ()-[:SWIPED]->(p)
RETURN 
  p.pet_id AS PetID,
  p.name AS PetName,
  p.age_months AS AgeMonths,
  p.size AS Size,
  s.name AS ShelterName,
  s.city AS City
ORDER BY p.pet_id;
