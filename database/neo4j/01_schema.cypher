// ============================================================================
// Project: Kinder Pets - Pet Adoption Management System (DBMS DA3)
// File: 01_schema.cypher
// Description: Neo4j Graph Schema Definitions, Uniqueness Constraints, 
//              Property Existence Rules, and High-Performance Traversal Indexes.
// Modern Database Technology: Graph Database (Neo4j 5.x / Aura)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. UNIQUENESS CONSTRAINTS (Enforcing Domain Integrity across Node Labels)
// ----------------------------------------------------------------------------

// Enforce unique Adopter ID
CREATE CONSTRAINT adopter_id_unique IF NOT EXISTS
FOR (a:Adopter) REQUIRE a.adopter_id IS UNIQUE;

// Enforce unique Adopter Email (Candidate Key from DA1)
CREATE CONSTRAINT adopter_email_unique IF NOT EXISTS
FOR (a:Adopter) REQUIRE a.email IS UNIQUE;

// Enforce unique Pet ID
CREATE CONSTRAINT pet_id_unique IF NOT EXISTS
FOR (p:Pet) REQUIRE p.pet_id IS UNIQUE;

// Enforce unique Shelter ID
CREATE CONSTRAINT shelter_id_unique IF NOT EXISTS
FOR (s:Shelter) REQUIRE s.shelter_id IS UNIQUE;

// Enforce unique Shelter License Number (Candidate Key from DA1)
CREATE CONSTRAINT shelter_license_unique IF NOT EXISTS
FOR (s:Shelter) REQUIRE s.license_no IS UNIQUE;

// Enforce unique Breed Name
CREATE CONSTRAINT breed_name_unique IF NOT EXISTS
FOR (b:Breed) REQUIRE b.name IS UNIQUE;

// Enforce unique Species Name
CREATE CONSTRAINT species_name_unique IF NOT EXISTS
FOR (sp:Species) REQUIRE sp.name IS UNIQUE;

// Enforce unique Shelter Staff ID
CREATE CONSTRAINT staff_id_unique IF NOT EXISTS
FOR (st:Staff) REQUIRE st.staff_id IS UNIQUE;

// ----------------------------------------------------------------------------
// 2. PROPERTY EXISTENCE CONSTRAINTS (Mandatory Domain Attributes)
// ----------------------------------------------------------------------------

// Adopter mandatory fields
CREATE CONSTRAINT adopter_name_exists IF NOT EXISTS
FOR (a:Adopter) REQUIRE a.full_name IS NOT NULL;

// Pet mandatory fields
CREATE CONSTRAINT pet_name_exists IF NOT EXISTS
FOR (p:Pet) REQUIRE p.name IS NOT NULL;

CREATE CONSTRAINT pet_status_exists IF NOT EXISTS
FOR (p:Pet) REQUIRE p.status IS NOT NULL;

// ----------------------------------------------------------------------------
// 3. PERFORMANCE INDEXES (Index-Free Adjacency + Fast Entry Point Lookup)
// ----------------------------------------------------------------------------

// High-frequency filtering by Pet Status ('Available', 'Pending', 'Adopted')
CREATE INDEX pet_status_idx IF NOT EXISTS
FOR (p:Pet) ON (p.status);

// Geospatial/City lookup for Shelters and Adopters
CREATE INDEX shelter_city_idx IF NOT EXISTS
FOR (s:Shelter) ON (s.city);

CREATE INDEX adopter_city_idx IF NOT EXISTS
FOR (a:Adopter) ON (a.city);

// Pet size & age filtering
CREATE INDEX pet_size_age_idx IF NOT EXISTS
FOR (p:Pet) ON (p.size, p.age_months);

// Relationship index on SWIPED timestamp for temporal audit trails
CREATE INDEX swipe_timestamp_idx IF NOT EXISTS
FOR ()-[r:SWIPED]-() ON (r.swiped_at);

// Relationship index on MATCHED_WITH status
CREATE INDEX match_status_idx IF NOT EXISTS
FOR ()-[r:MATCHED_WITH]-() ON (r.status);
