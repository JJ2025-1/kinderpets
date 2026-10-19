# Kinder Pets — DA3 Academic Project Report & Viva Defense Notes

**Course**: Database Management Systems (DBMS)  
**Deliverable**: Digital Assignment 3 (DA3) — Modern Database Implementation  
**Submission Deadline**: 21-10-2026 (Wednesday)  
**Project Name**: Kinder Pets (Tinder-Style Pet Adoption Management System)  
**Selected Technology**: **Graph Database (Neo4j 5.x / Cypher Property Graph)**  
*(Chosen from the approved list: Graph DB, Column-Family, Vector DB, Time-Series DB; explicitly other than MongoDB)*

---

## 1. Executive Summary & Technology Selection Justification

### Why Graph Database (Neo4j) Over Other Modern Databases?

| Database Category | Example Systems | Suitability for Kinder Pets | Verdict |
|---|---|---|---|
| **Graph Database** | **Neo4j**, Amazon Neptune | **Textbook Natural Fit**: Pet adoption is intrinsically a bipartite recommendation and social affinity network. Nodes (`Adopter`, `Pet`, `Breed`, `Shelter`) connect via directed edges (`SWIPED`, `MATCHED`, `APPLIED_FOR`, `PREFERS`). | **SELECTED (DA3)** |
| **Column-Family** | Cassandra, ScyllaDB | Designed for write-heavy high-velocity event logging (e.g. telemetry, IoT). Weak at multi-entity traversals and aggregations without denormalization. | Not optimal |
| **Vector Database** | Milvus, Pinecone, Chroma | Excellent for unstructured embedding similarity (e.g., photo embeddings or semantic descriptions), but lacks native relational constraints, workflow audits, and transactional matching. | Secondary utility |
| **Time-Series** | InfluxDB, TimescaleDB | Specialized for timestamp-ordered telemetry streams; inappropriate for discrete graph matching and adoption lifecycle state transitions. | Inappropriate |

### Core Architectural Advantages of Neo4j for Kinder Pets

1. **Index-Free Adjacency ($O(1)$ Traversal vs $O(N \log N)$ SQL Joins)**:
   - In relational DBMS (DA2), discovering matches or recommendations required joining up to 5 tables (`SWIPE`, `PET_MATCH`, `PET`, `BREED`, `ADOPTER_PREFERENCE`). As the table scales to millions of rows, join cost degrades with index lookups.
   - In Neo4j, each node physically stores direct memory pointers to adjacent relationships. Traversing from an adopter to their preferred pets executes in constant $O(1)$ time per hop, regardless of the overall graph size.

2. **Declarative Pattern Matching (Cypher)**:
   - Collaborative filtering (*"Adopters who liked pet X also liked pet Y"*) requires complex SQL self-joins and subqueries. In Cypher, it is expressed as an ASCII-art path:
     ```cypher
     MATCH (target:Adopter {adopter_id: $id})-[:SWIPED {direction: 'RIGHT'}]->(shared:Pet)
           <-[:SWIPED {direction: 'RIGHT'}]-(peer:Adopter)
           -[:SWIPED {direction: 'RIGHT'}]->(rec:Pet)
     RETURN rec.name, count(DISTINCT peer) AS score;
     ```

3. **Seamless Schema Evolution**:
   - New relationships (e.g., `:FOSTERED`, `:VACCINATED_BY`, `:COMPATIBLE_WITH`) can be added dynamically without locking tables or executing disruptive SQL `ALTER TABLE` DDL migrations.

---

## 2. Relational (DA2) to Property Graph (DA3) Model Transformation

### Entity Mapping Matrix

| DA2 Relational Entity (12 Tables) | DA3 Property Graph Representation | Graph Classification |
|---|---|---|
| `SHELTER` | `(:Shelter {shelter_id, name, license_no, city, state})` | Node |
| `SHELTER_STAFF` | `(:Staff {staff_id, name, role})` | Node |
| `BREED` | `(:Breed {name, energy_level, shedding})` | Node |
| Species attribute | `(:Species {name, icon})` | Normalized Taxonomic Node |
| `PET` | `(:Pet {pet_id, name, gender, age_months, size, status, behaviour_desc})` | Node |
| `PET_PHOTO` | Array attribute `photo_url` on `(:Pet)` | Node Property |
| `ADOPTER` | `(:Adopter {adopter_id, full_name, email, phone, city, state})` | Node |
| `ADOPTER_PREFERENCE` | `(:Adopter)-[:PREFERS_SPECIES {min_age, max_age, size}]->(:Species)` | Directed Relationship |
| `PREFERRED_BREED` (M:N Bridge) | `(:Adopter)-[:PREFERS_BREED]->(:Breed)` | Directed Relationship |
| `SWIPE` | `(:Adopter)-[:SWIPED {direction: 'RIGHT'\|'LEFT', swiped_at}]->(:Pet)` | Directed Relationship |
| `PET_MATCH` (DA1/DA2 `MATCH`) | `(:Adopter)-[:MATCHED_WITH {match_id, status, matched_at}]->(:Pet)` | Directed Relationship |
| `ADOPTION_APPLICATION` | `(:Adopter)-[:APPLIED_FOR {application_id, status, home_visit_date}]->(:Pet)` | Directed Relationship |
| `SHELTER_DECISION` | `(:Staff)-[:DECIDED {decision_id, decision, decided_at}]->(:Pet)` | Directed Relationship |

---

## 3. Cypher DDL Constraints & Indexes (`01_schema.cypher`)

- **Uniqueness Constraints**:
  - `CREATE CONSTRAINT FOR (s:Shelter) REQUIRE s.shelter_id IS UNIQUE;`
  - `CREATE CONSTRAINT FOR (a:Adopter) REQUIRE a.adopter_id IS UNIQUE;`
  - `CREATE CONSTRAINT FOR (p:Pet) REQUIRE p.pet_id IS UNIQUE;`
  - `CREATE CONSTRAINT FOR (b:Breed) REQUIRE b.name IS UNIQUE;`
  - `CREATE CONSTRAINT FOR (sp:Species) REQUIRE sp.name IS UNIQUE;`
  - `CREATE CONSTRAINT FOR (st:Staff) REQUIRE st.staff_id IS UNIQUE;`
- **Traversal Performance Indexes**:
  - `CREATE INDEX FOR (p:Pet) ON (p.status);`
  - `CREATE INDEX FOR (a:Adopter) ON (a.city);`
  - `CREATE INDEX FOR (s:Shelter) ON (s.city);`

---

## 4. 12 Academic Cypher Queries & Demonstrations

1. **Multi-Hop Preference Traversal**: `(Adopter)-[:PREFERS_BREED]->(Breed)<-[:IS_OF_BREED]-(Pet)-[:BELONGS_TO]->(Shelter)`
2. **Collaborative Filtering Recommendation**: Bipartite right-swipe projection to recommend pets liked by adopters with shared affinities.
3. **Active Matches Subgraph**: Direct traversal of `[:MATCHED_WITH]` relationships with shelter location context.
4. **Full Lifecycle Audit Trail**: Path trace connecting initial `SWIPED` -> `MATCHED_WITH` -> `APPLIED_FOR` -> `DECIDED`.
5. **In-Degree Centrality (Popularity Ranking)**: Node centrality counting incoming right swipes in $O(\text{deg}(v))$ time.
6. **Jaccard Similarity Coefficient**: Set operations measuring adopter behavioral affinity:
   $$\text{Jaccard}(A_1, A_2) = \frac{|\text{Likes}(A_1) \cap \text{Likes}(A_2)|}{|\text{Likes}(A_1) \cup \text{Likes}(A_2)|} \times 100$$
7. **Geographic Reach & Topology**: Bipartite reach comparing origin city to shelter destination city.
8. **Resource Contention Detection**: Convergence detection for multiple applications competing for the same animal.
9. **Shortest Path Finding**: Breadth-First Search finding the shortest taxonomic connection between an adopter and a pet.
10. **Shelter Inventory Aggregation**: Demonstrating parity with SQL `COUNT` and conditional `SUM`.
11. **Dynamic Path Scoring**: Multi-hop weighted compatibility scoring (species match + breed match + size compatibility).
12. **Pattern Negation (Unswiped Pets)**: Instant filtering for neglected animals without incoming swipe pointers.

---

## 5. Viva / Project Defense Questions & Model Answers

**Q1: How does Index-Free Adjacency differ from traditional RDBMS B-Tree index lookups?**  
*Answer*: In an RDBMS, joining Table A to Table B requires evaluating a foreign key using a B-Tree index lookup ($O(\log N)$ per join). In Neo4j, every relationship pointer is physically stored on the node record itself as a direct memory pointer (double-linked list). Traversing a relationship takes $O(1)$ constant time, meaning query speed depends only on the subgraph traversed, not on the total size of the database.

**Q2: Why is MongoDB not suitable for this DA3 deliverable?**  
*Answer*: The course syllabus explicitly stated "other than MongoDB" because MongoDB is a document store. Pet adoption requires rich interconnected relationships (swipes, preferences, matches, applications). In MongoDB, representing many-to-many relationships requires either redundant document embedding (which leads to update anomalies) or multiple application-level `$lookup` aggregations, which do not scale well for deep path traversals.

**Q3: How does the Collaborative Filtering algorithm work in your live application?**  
*Answer*: When an adopter opens the Discover feed in "Neo4j Graph Engine" mode, the system traverses outgoing right-swipes from the target adopter to pets they liked, finds other adopters who swiped right on those same pets, and then traverses to other pets liked by those peers that the target adopter has not yet seen.

**Q4: How does your application operate if Neo4j is offline?**  
*Answer*: The application features a dual-mode engine in `lib/neo4j.ts`. If a live Neo4j Bolt instance (`bolt://localhost:7687`) is reachable, it executes native Cypher queries; if offline, it seamlessly falls back to an in-memory graph simulation engine, guaranteeing 100% demo uptime during viva evaluation.
