// ============================================================================
// Project: Kinder Pets - Pet Adoption Management System (DBMS DA3)
// File: 02_seed_data.cypher
// Description: Realistic Property Graph seed dataset mapping all 12 DA1/DA2 entities
//              into first-class Nodes, Labels, Properties, and Directed Relationships.
// ============================================================================

// ----------------------------------------------------------------------------
// 0. CLEAN EXISTING GRAPH DATA (Safe Re-runnability)
// ----------------------------------------------------------------------------
MATCH (n) DETACH DELETE n;

// ----------------------------------------------------------------------------
// 1. CREATE SPECIES & BREEDS (Taxonomy Subgraph)
// ----------------------------------------------------------------------------
CREATE (dog:Species {name: 'Dog', icon: '🐶'})
CREATE (cat:Species {name: 'Cat', icon: '🐱'})

CREATE (b1:Breed {name: 'Labrador Retriever', energy_level: 'High', shedding: 'Moderate'})-[:BELONGS_TO_SPECIES]->(dog)
CREATE (b2:Breed {name: 'Indie / Desi Dog', energy_level: 'Moderate', shedding: 'Low'})-[:BELONGS_TO_SPECIES]->(dog)
CREATE (b3:Breed {name: 'Golden Retriever', energy_level: 'High', shedding: 'High'})-[:BELONGS_TO_SPECIES]->(dog)
CREATE (b4:Breed {name: 'Beagle', energy_level: 'High', shedding: 'Moderate'})-[:BELONGS_TO_SPECIES]->(dog)
CREATE (b5:Breed {name: 'German Shepherd', energy_level: 'Very High', shedding: 'High'})-[:BELONGS_TO_SPECIES]->(dog)
CREATE (b6:Breed {name: 'Cocker Spaniel', energy_level: 'Moderate', shedding: 'Moderate'})-[:BELONGS_TO_SPECIES]->(dog)

CREATE (b7:Breed {name: 'Persian Cat', energy_level: 'Low', shedding: 'High'})-[:BELONGS_TO_SPECIES]->(cat)
CREATE (b8:Breed {name: 'Siamese Cat', energy_level: 'Moderate', shedding: 'Low'})-[:BELONGS_TO_SPECIES]->(cat)
CREATE (b9:Breed {name: 'Indie / Desi Cat', energy_level: 'Moderate', shedding: 'Low'})-[:BELONGS_TO_SPECIES]->(cat)
CREATE (b10:Breed {name: 'Ragdoll Cat', energy_level: 'Low', shedding: 'Moderate'})-[:BELONGS_TO_SPECIES]->(cat);

// ----------------------------------------------------------------------------
// 2. CREATE SHELTERS & STAFF (Organizational Subgraph)
// ----------------------------------------------------------------------------
CREATE (s1:Shelter {
  shelter_id: 1, 
  name: 'Paws & Tails Animal Rescue', 
  license_no: 'KA-BLR-SHEL-2021-042', 
  city: 'Bangalore', 
  state: 'Karnataka'
})
CREATE (s2:Shelter {
  shelter_id: 2, 
  name: 'Compassion Pet Haven', 
  license_no: 'MH-MUM-SHEL-2019-118', 
  city: 'Mumbai', 
  state: 'Maharashtra'
})
CREATE (s3:Shelter {
  shelter_id: 3, 
  name: 'Safe Haven Animal Trust', 
  license_no: 'TN-CHN-SHEL-2020-087', 
  city: 'Chennai', 
  state: 'Tamil Nadu'
})
CREATE (s4:Shelter {
  shelter_id: 4, 
  name: 'Tails of Joy Foundation', 
  license_no: 'DL-DEL-SHEL-2022-205', 
  city: 'Delhi', 
  state: 'Delhi NCR'
})
CREATE (s5:Shelter {
  shelter_id: 5, 
  name: 'Pune Animal Welfare Society', 
  license_no: 'MH-PUN-SHEL-2018-013', 
  city: 'Pune', 
  state: 'Maharashtra'
})

CREATE (st1:Staff {staff_id: 1, name: 'Dr. Rajesh Rao', role: 'Chief Veterinarian'})-[:WORKS_AT]->(s1)
CREATE (st2:Staff {staff_id: 2, name: 'Priya Menon', role: 'Adoption Coordinator'})-[:WORKS_AT]->(s1)
CREATE (st3:Staff {staff_id: 3, name: 'Vikram Deshmukh', role: 'Shelter Manager'})-[:WORKS_AT]->(s2)
CREATE (st4:Staff {staff_id: 4, name: 'Kavita Sundaram', role: 'Senior Caretaker'})-[:WORKS_AT]->(s3)
CREATE (st5:Staff {staff_id: 5, name: 'Amit Verma', role: 'Adoption Specialist'})-[:WORKS_AT]->(s4)
CREATE (st6:Staff {staff_id: 6, name: 'Sunita Kulkarni', role: 'Rescue Coordinator'})-[:WORKS_AT]->(s5);

// ----------------------------------------------------------------------------
// 3. CREATE PET PROFILES WITH PHOTOS & RELATIONSHIPS
// ----------------------------------------------------------------------------
CREATE (p1:Pet {
  pet_id: 1, name: 'Bruno', gender: 'Male', age_months: 24, size: 'Large', 
  status: 'Available', 
  behaviour_desc: 'Extremely friendly, loves playing fetch and great with kids',
  lifestyle_desc: 'Active apartment or house with balcony, needs daily park walks',
  photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'
})
CREATE (p2:Pet {
  pet_id: 2, name: 'Luna', gender: 'Female', age_months: 12, size: 'Medium', 
  status: 'Pending', 
  behaviour_desc: 'Affectionate, quick learner, very loyal and alert',
  lifestyle_desc: 'Ideal for both flats and independent homes; low maintenance grooming',
  photo_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
})
CREATE (p3:Pet {
  pet_id: 3, name: 'Max', gender: 'Male', age_months: 36, size: 'Large', 
  status: 'Available', 
  behaviour_desc: 'Gentle, patient, sweet-natured therapy dog temperament',
  lifestyle_desc: 'Spacious home preferred; enjoys swimming and family time',
  photo_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'
})
CREATE (p4:Pet {
  pet_id: 4, name: 'Milo', gender: 'Male', age_months: 24, size: 'Small', 
  status: 'Available', 
  behaviour_desc: 'Calm lap cat, purrs continuously when brushed',
  lifestyle_desc: 'Quiet indoor apartment, gentle environment without loud noises',
  photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
})
CREATE (p5:Pet {
  pet_id: 5, name: 'Coco', gender: 'Female', age_months: 8, size: 'Small', 
  status: 'Available', 
  behaviour_desc: 'Playful puppy energy, curious nose, loves social gatherings',
  lifestyle_desc: 'Needs engaging puzzle toys and supervised outdoor yard time',
  photo_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80'
})
CREATE (p6:Pet {
  pet_id: 6, name: 'Rocky', gender: 'Male', age_months: 18, size: 'Large', 
  status: 'Available', 
  behaviour_desc: 'Protective, intelligent, highly trainable, leash trained',
  lifestyle_desc: 'Active owner experienced with large working breeds',
  photo_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80'
})
CREATE (p7:Pet {
  pet_id: 7, name: 'Cleo', gender: 'Female', age_months: 14, size: 'Small', 
  status: 'Available', 
  behaviour_desc: 'Vocal communicator, curious explorer, loves perching high',
  lifestyle_desc: 'Indoor home with scratching posts and sunlit window spots',
  photo_url: 'https://images.unsplash.com/photo-1513360309081-38f0762daed1?auto=format&fit=crop&w=800&q=80'
})
CREATE (p8:Pet {
  pet_id: 8, name: 'Bella', gender: 'Female', age_months: 30, size: 'Medium', 
  status: 'Available', 
  behaviour_desc: 'Sweet-tempered, eager to please, gentle tail-wagger',
  lifestyle_desc: 'Moderate exercise needs; loves cuddles on sofa',
  photo_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'
})
CREATE (p9:Pet {
  pet_id: 9, name: 'Simba', gender: 'Male', age_months: 10, size: 'Small', 
  status: 'Available', 
  behaviour_desc: 'Agile, playful mouser, independent yet cuddly at bedtime',
  lifestyle_desc: 'Adaptable indoor-outdoor or apartment lifestyle',
  photo_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80'
})
CREATE (p10:Pet {
  pet_id: 10, name: 'Oliver', gender: 'Male', age_months: 20, size: 'Medium', 
  status: 'Available', 
  behaviour_desc: 'Relaxed, goes limp when held lovingly, docile companion',
  lifestyle_desc: 'Strictly indoor apartment with gentle companions',
  photo_url: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80'
})
CREATE (p11:Pet {
  pet_id: 11, name: 'Maya', gender: 'Female', age_months: 16, size: 'Medium', 
  status: 'Available', 
  behaviour_desc: 'Super resilient, vaccinated, sociable with other dogs',
  lifestyle_desc: 'Loves morning jogs and afternoon terrace naps',
  photo_url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80'
})
CREATE (p12:Pet {
  pet_id: 12, name: 'Cooper', gender: 'Male', age_months: 48, size: 'Large', 
  status: 'Available', 
  behaviour_desc: 'Mellow senior vibe, fully house-trained, peaceful',
  lifestyle_desc: 'Calm home seeking a relaxed companion dog',
  photo_url: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80'
})
CREATE (p13:Pet {
  pet_id: 13, name: 'Daisy', gender: 'Female', age_months: 15, size: 'Small', 
  status: 'Pending', 
  behaviour_desc: 'Cheerful soul, friendly to strangers, food motivated',
  lifestyle_desc: 'Great family dog; needs fenced boundary',
  photo_url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80'
})
CREATE (p14:Pet {
  pet_id: 14, name: 'Charlie', gender: 'Male', age_months: 22, size: 'Large', 
  status: 'Adopted', 
  behaviour_desc: 'High exuberance, loves water splashes and kids',
  lifestyle_desc: 'Active household ready for outdoor weekend roadtrips',
  photo_url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80'
})
CREATE (p15:Pet {
  pet_id: 15, name: 'Zoey', gender: 'Female', age_months: 32, size: 'Small', 
  status: 'Available', 
  behaviour_desc: 'Regal, quiet lady, prefers sleeping on soft cushions',
  lifestyle_desc: 'Low-energy single occupant or quiet couple home',
  photo_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
})
CREATE (p16:Pet {
  pet_id: 16, name: 'Leo', gender: 'Male', age_months: 9, size: 'Medium', 
  status: 'Available', 
  behaviour_desc: 'Energetic puppy, quick at agility training and tricks',
  lifestyle_desc: 'Enthusiastic first-time dog owners welcomed',
  photo_url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80'
};

// ----------------------------------------------------------------------------
// 4. LINK PETS TO SHELTERS & BREEDS
// ----------------------------------------------------------------------------
MATCH (p1:Pet {pet_id: 1}), (p2:Pet {pet_id: 2}), (p5:Pet {pet_id: 5}), (p12:Pet {pet_id: 12}), (s1:Shelter {shelter_id: 1})
CREATE (p1)-[:BELONGS_TO]->(s1)
CREATE (p2)-[:BELONGS_TO]->(s1)
CREATE (p5)-[:BELONGS_TO]->(s1)
CREATE (p12)-[:BELONGS_TO]->(s1);

MATCH (p3:Pet {pet_id: 3}), (p4:Pet {pet_id: 4}), (p13:Pet {pet_id: 13}), (s2:Shelter {shelter_id: 2})
CREATE (p3)-[:BELONGS_TO]->(s2)
CREATE (p4)-[:BELONGS_TO]->(s2)
CREATE (p13)-[:BELONGS_TO]->(s2);

MATCH (p6:Pet {pet_id: 6}), (p7:Pet {pet_id: 7}), (p14:Pet {pet_id: 14}), (s3:Shelter {shelter_id: 3})
CREATE (p6)-[:BELONGS_TO]->(s3)
CREATE (p7)-[:BELONGS_TO]->(s3)
CREATE (p14)-[:BELONGS_TO]->(s3);

MATCH (p8:Pet {pet_id: 8}), (p9:Pet {pet_id: 9}), (p15:Pet {pet_id: 15}), (s4:Shelter {shelter_id: 4})
CREATE (p8)-[:BELONGS_TO]->(s4)
CREATE (p9)-[:BELONGS_TO]->(s4)
CREATE (p15)-[:BELONGS_TO]->(s4);

MATCH (p10:Pet {pet_id: 10}), (p11:Pet {pet_id: 11}), (p16:Pet {pet_id: 16}), (s5:Shelter {shelter_id: 5})
CREATE (p10)-[:BELONGS_TO]->(s5)
CREATE (p11)-[:BELONGS_TO]->(s5)
CREATE (p16)-[:BELONGS_TO]->(s5);

// Breed relationships
MATCH (p:Pet {pet_id: 1}), (b:Breed {name: 'Labrador Retriever'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 2}), (b:Breed {name: 'Indie / Desi Dog'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 3}), (b:Breed {name: 'Golden Retriever'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 4}), (b:Breed {name: 'Persian Cat'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 5}), (b:Breed {name: 'Beagle'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 6}), (b:Breed {name: 'German Shepherd'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 7}), (b:Breed {name: 'Siamese Cat'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 8}), (b:Breed {name: 'Cocker Spaniel'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 9}), (b:Breed {name: 'Indie / Desi Cat'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 10}), (b:Breed {name: 'Ragdoll Cat'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 11}), (b:Breed {name: 'Indie / Desi Dog'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 12}), (b:Breed {name: 'Labrador Retriever'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 13}), (b:Breed {name: 'Beagle'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 14}), (b:Breed {name: 'Golden Retriever'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 15}), (b:Breed {name: 'Persian Cat'}) CREATE (p)-[:IS_OF_BREED]->(b);
MATCH (p:Pet {pet_id: 16}), (b:Breed {name: 'Indie / Desi Dog'}) CREATE (p)-[:IS_OF_BREED]->(b);

// ----------------------------------------------------------------------------
// 5. CREATE ADOPTERS & PREFERENCES
// ----------------------------------------------------------------------------
CREATE (a1:Adopter {adopter_id: 1, full_name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91-9845012345', city: 'Bangalore', state: 'Karnataka'})
CREATE (a2:Adopter {adopter_id: 2, full_name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91-9820054321', city: 'Mumbai', state: 'Maharashtra'})
CREATE (a3:Adopter {adopter_id: 3, full_name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91-9840198765', city: 'Chennai', state: 'Tamil Nadu'})
CREATE (a4:Adopter {adopter_id: 4, full_name: 'Rohan Kapoor', email: 'rohan.kapoor@example.com', phone: '+91-9811065432', city: 'Delhi', state: 'Delhi NCR'})
CREATE (a5:Adopter {adopter_id: 5, full_name: 'Sneha Deshpande', email: 'sneha.d@example.com', phone: '+91-9765034567', city: 'Pune', state: 'Maharashtra'})
CREATE (a6:Adopter {adopter_id: 6, full_name: 'Aditya Verma', email: 'aditya.v@example.com', phone: '+91-9888011223', city: 'Bangalore', state: 'Karnataka'});

// Connect Adopter Species Preferences
MATCH (a1:Adopter {adopter_id: 1}), (dog:Species {name: 'Dog'})
CREATE (a1)-[:PREFERS_SPECIES {min_age_months: 6, max_age_months: 36, preferred_size: 'Large'}]->(dog);

MATCH (a2:Adopter {adopter_id: 2}), (cat:Species {name: 'Cat'})
CREATE (a2)-[:PREFERS_SPECIES {min_age_months: 3, max_age_months: 48, preferred_size: 'Small'}]->(cat);

MATCH (a3:Adopter {adopter_id: 3}), (dog:Species {name: 'Dog'})
CREATE (a3)-[:PREFERS_SPECIES {min_age_months: 6, max_age_months: 24, preferred_size: 'Medium'}]->(dog);

MATCH (a4:Adopter {adopter_id: 4}), (dog:Species {name: 'Dog'})
CREATE (a4)-[:PREFERS_SPECIES {min_age_months: 12, max_age_months: 60, preferred_size: 'Large'}]->(dog);

MATCH (a5:Adopter {adopter_id: 5}), (cat:Species {name: 'Cat'})
CREATE (a5)-[:PREFERS_SPECIES {min_age_months: 6, max_age_months: 30, preferred_size: 'Medium'}]->(cat);

MATCH (a6:Adopter {adopter_id: 6}), (dog:Species {name: 'Dog'})
CREATE (a6)-[:PREFERS_SPECIES {min_age_months: 4, max_age_months: 18, preferred_size: 'Small'}]->(dog);

// Connect Adopter Preferred Breeds
MATCH (a1:Adopter {adopter_id: 1}), (b:Breed {name: 'Labrador Retriever'}) CREATE (a1)-[:PREFERS_BREED]->(b);
MATCH (a1:Adopter {adopter_id: 1}), (b:Breed {name: 'Golden Retriever'}) CREATE (a1)-[:PREFERS_BREED]->(b);
MATCH (a2:Adopter {adopter_id: 2}), (b:Breed {name: 'Persian Cat'}) CREATE (a2)-[:PREFERS_BREED]->(b);
MATCH (a2:Adopter {adopter_id: 2}), (b:Breed {name: 'Siamese Cat'}) CREATE (a2)-[:PREFERS_BREED]->(b);
MATCH (a3:Adopter {adopter_id: 3}), (b:Breed {name: 'Indie / Desi Dog'}) CREATE (a3)-[:PREFERS_BREED]->(b);
MATCH (a3:Adopter {adopter_id: 3}), (b:Breed {name: 'Cocker Spaniel'}) CREATE (a3)-[:PREFERS_BREED]->(b);
MATCH (a4:Adopter {adopter_id: 4}), (b:Breed {name: 'German Shepherd'}) CREATE (a4)-[:PREFERS_BREED]->(b);
MATCH (a4:Adopter {adopter_id: 4}), (b:Breed {name: 'Labrador Retriever'}) CREATE (a4)-[:PREFERS_BREED]->(b);
MATCH (a5:Adopter {adopter_id: 5}), (b:Breed {name: 'Ragdoll Cat'}) CREATE (a5)-[:PREFERS_BREED]->(b);
MATCH (a6:Adopter {adopter_id: 6}), (b:Breed {name: 'Beagle'}) CREATE (a6)-[:PREFERS_BREED]->(b);

// ----------------------------------------------------------------------------
// 6. SWIPES, MATCHES, APPLICATIONS & DECISIONS (Behavioral Subgraph)
// ----------------------------------------------------------------------------
// Rahul Sharma swipes & matches
MATCH (a1:Adopter {adopter_id: 1}), (p1:Pet {pet_id: 1})
CREATE (a1)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-01T10:30:00Z')}]->(p1)
CREATE (a1)-[:MATCHED_WITH {match_id: 1, status: 'Active', matched_at: datetime('2026-09-01T10:30:05Z')}]->(p1);

MATCH (a1:Adopter {adopter_id: 1}), (p2:Pet {pet_id: 2}), (st2:Staff {staff_id: 2})
CREATE (a1)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-01T10:32:15Z')}]->(p2)
CREATE (a1)-[:MATCHED_WITH {match_id: 2, status: 'Applied', matched_at: datetime('2026-09-01T10:32:20Z')}]->(p2)
CREATE (a1)-[:APPLIED_FOR {
  application_id: 1, 
  status: 'Pending', 
  home_visit_date: date('2026-09-15'), 
  submitted_at: datetime('2026-09-01T11:00:00Z')
}]->(p2)
CREATE (st2)-[:ASSIGNED_TO_REVIEW]->(p2);

MATCH (a1:Adopter {adopter_id: 1}), (p4:Pet {pet_id: 4})
CREATE (a1)-[:SWIPED {direction: 'LEFT', swiped_at: datetime('2026-09-01T10:34:00Z')}]->(p4);

// Priya Patel swipes & matches
MATCH (a2:Adopter {adopter_id: 2}), (p4:Pet {pet_id: 4})
CREATE (a2)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-02T11:15:00Z')}]->(p4)
CREATE (a2)-[:MATCHED_WITH {match_id: 3, status: 'Active', matched_at: datetime('2026-09-02T11:15:10Z')}]->(p4);

MATCH (a2:Adopter {adopter_id: 2}), (p15:Pet {pet_id: 15})
CREATE (a2)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-02T11:18:00Z')}]->(p15);

MATCH (a2:Adopter {adopter_id: 2}), (p1:Pet {pet_id: 1})
CREATE (a2)-[:SWIPED {direction: 'LEFT', swiped_at: datetime('2026-09-02T11:20:00Z')}]->(p1);

// Ananya Iyer swipes & application
MATCH (a3:Adopter {adopter_id: 3}), (p2:Pet {pet_id: 2})
CREATE (a3)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-03T14:00:00Z')}]->(p2);

MATCH (a3:Adopter {adopter_id: 3}), (p13:Pet {pet_id: 13}), (st3:Staff {staff_id: 3})
CREATE (a3)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-09-03T14:05:00Z')}]->(p13)
CREATE (a3)-[:MATCHED_WITH {match_id: 4, status: 'Applied', matched_at: datetime('2026-09-03T14:05:05Z')}]->(p13)
CREATE (a3)-[:APPLIED_FOR {
  application_id: 2, 
  status: 'Under Review', 
  home_visit_date: date('2026-09-18'), 
  submitted_at: datetime('2026-09-03T15:30:00Z')
}]->(p13)
CREATE (st3)-[:ASSIGNED_TO_REVIEW]->(p13);

// Rohan Kapoor swipes, application & completed decision
MATCH (a4:Adopter {adopter_id: 4}), (p14:Pet {pet_id: 14}), (st4:Staff {staff_id: 4})
CREATE (a4)-[:SWIPED {direction: 'RIGHT', swiped_at: datetime('2026-08-20T09:30:00Z')}]->(p14)
CREATE (a4)-[:MATCHED_WITH {match_id: 5, status: 'Closed', matched_at: datetime('2026-08-20T09:30:10Z')}]->(p14)
CREATE (a4)-[:APPLIED_FOR {
  application_id: 3, 
  status: 'Approved', 
  home_visit_date: date('2026-08-25'), 
  submitted_at: datetime('2026-08-20T10:00:00Z')
}]->(p14)
CREATE (st4)-[:DECIDED {
  decision: 'Approved', 
  decision_id: 1, 
  decided_at: datetime('2026-08-26T16:45:00Z')
}]->(p14);
