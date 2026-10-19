# Kinder Pets — Neo4j Graph Database Documentation (DBMS DA3)

This directory contains the official **Graph Database (Neo4j)** implementation for **Kinder Pets** (DBMS Digital Assignment 3).

---

## 🎯 DA3 Modern Technology Selection Justification

For DA3, **Graph Database (Neo4j)** was selected over Column-Family, Vector, and Time-Series databases for the following core architectural reasons:

1. **Natural Domain Fit (Tinder-Style Pet Adoption)**:
   - Kinder Pets is intrinsically a **social recommendation and matching network**. The domain consists of entities (Adopters, Pets, Shelters, Breeds) and rich directional interactions (`SWIPED_RIGHT`, `SWIPED_LEFT`, `MATCHED_WITH`, `APPLIED_FOR`, `PREFERS_BREED`).
   - In a relational database (DA2), discovering matches and collaborative recommendations requires complex 4-to-5 table `JOIN` operations ($O(N \log N)$ or worse with nested loops). In Neo4j, relationships are physically stored as direct pointers (**Index-Free Adjacency**), executing multi-hop traversals in constant $O(1)$ time per hop.

2. **Graph-Native Collaborative Filtering**:
   - Modern adoption discovery requires collaborative filtering: *"Adopters who liked pet X also liked pet Y"*.
   - In SQL, this requires expensive self-joins and subqueries. In Cypher, this is expressed declaratively in a single elegant pattern:
     ```cypher
     (target:Adopter)-[:SWIPED {direction:'RIGHT'}]->(shared:Pet)<-[:SWIPED {direction:'RIGHT'}]-(peer:Adopter)-[:SWIPED {direction:'RIGHT'}]->(rec:Pet)
     ```

3. **Flexible Schema Evolution**:
   - As adoption workflows evolve (e.g., adding foster parents, medical tracking, social compatibility tests), graph databases allow adding new relationship types (`:FOSTERED`, `:COMPATIBLE_WITH`) without disruptive table migrations or schema locks.

---

## 📁 File Manifest

| File | Type | Description |
|---|---|---|
| [`01_schema.cypher`](01_schema.cypher) | DDL / Constraints | Uniqueness constraints, property existence constraints, and traversal B-Tree indexes across all node labels. |
| [`02_seed_data.cypher`](02_seed_data.cypher) | DML / Seed Data | Creates 5 Shelters, 6 Staff, 2 Species, 10 Breeds, 16 Pets, 6 Adopters, Preferences, Swipes, Matches, Applications, and Decisions. |
| [`03_queries.cypher`](03_queries.cypher) | 12 Academic Queries | Demonstrates multi-hop path traversal, collaborative filtering, Jaccard similarity, in-degree centrality, shortest paths, and aggregations. |
| [`04_graph_algorithms.cypher`](04_graph_algorithms.cypher) | Graph Data Science | Algorithmic Cypher procedures for Node Similarity, Degree Centrality, and Community Detection. |

---

## 🏛️ Relational (DA1/DA2) to Property Graph Model (DA3) Mapping

| DA1/DA2 Relational Entity (12 Tables) | DA3 Property Graph Representation | Type |
|---|---|---|
| `SHELTER` | `(:Shelter {shelter_id, name, license_no, city, state})` | Node |
| `SHELTER_STAFF` | `(:Staff {staff_id, name, role})` | Node |
| `BREED` | `(:Breed {name, energy_level, shedding})` | Node |
| — (Normalized species attribute) | `(:Species {name, icon})` | Node |
| `PET` | `(:Pet {pet_id, name, gender, age_months, size, status, behaviour_desc, lifestyle_desc, photo_url})` | Node |
| `PET_PHOTO` | Direct property `photo_url` on `(:Pet)` node (Multi-photo arrays supported) | Node Property |
| `ADOPTER` | `(:Adopter {adopter_id, full_name, email, phone, city, state})` | Node |
| `ADOPTER_PREFERENCE` | `(:Adopter)-[:PREFERS_SPECIES {min_age_months, max_age_months, preferred_size}]->(:Species)` | Directed Relationship |
| `PREFERRED_BREED` (M:N Bridge Table) | `(:Adopter)-[:PREFERS_BREED]->(:Breed)` | Directed Relationship |
| `SWIPE` | `(:Adopter)-[:SWIPED {direction: 'RIGHT'\|'LEFT', swiped_at}]->(:Pet)` | Directed Relationship |
| `PET_MATCH` (DA1 `MATCH`) | `(:Adopter)-[:MATCHED_WITH {match_id, status, matched_at}]->(:Pet)` | Directed Relationship |
| `ADOPTION_APPLICATION` | `(:Adopter)-[:APPLIED_FOR {application_id, status, home_visit_date, submitted_at}]->(:Pet)` | Directed Relationship |
| `SHELTER_DECISION` | `(:Staff)-[:DECIDED {decision_id, decision: 'Approved'\|'Rejected', decided_at}]->(:Pet)` | Directed Relationship |

---

## 🐳 Running Neo4j Locally (Docker)

To run Neo4j with full Cypher Browser & Bolt protocol:

```bash
# 1. Start official Neo4j container
docker run -d \
  --name neo4j-kinderpets \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/kinderpets123 \
  neo4j:5-community

# 2. Access Neo4j Browser in your browser:
# URL: http://localhost:7474
# Username: neo4j
# Password: kinderpets123

# 3. Load seed data via cypher-shell:
docker exec -i neo4j-kinderpets cypher-shell -u neo4j -p kinderpets123 < database/neo4j/01_schema.cypher
docker exec -i neo4j-kinderpets cypher-shell -u neo4j -p kinderpets123 < database/neo4j/02_seed_data.cypher
docker exec -i neo4j-kinderpets cypher-shell -u neo4j -p kinderpets123 < database/neo4j/03_queries.cypher
```

> [!NOTE]
> **Zero-Dependency Local Fallback**:  
> The KinderPets web application includes an **in-memory graph engine** in `lib/neo4j.ts`. You do NOT need Docker or Neo4j running to run and demonstrate the web app! The application automatically detects if a real Neo4j instance is present; if not, it evaluates all 12 Cypher queries and graph traversals seamlessly.
