-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 03_seed_data.sql
-- Description: Realistic seed dataset for demonstrations and testing.
-- Features: 5 Shelters, 6 Staff, 10 Breeds, 16 Pets, 25+ Photos, 
--           6 Adopters, Preferences, Preferred Breeds, Swipes, Matches,
--           Applications, and Decisions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SHELTERS (5 Indian Shelters)
-- ----------------------------------------------------------------------------
INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
(1, 'Paws & Tails Animal Rescue', 'KA-BLR-SHEL-2021-042', 'Bangalore');
INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
(2, 'Compassion Pet Haven', 'MH-MUM-SHEL-2019-118', 'Mumbai');
INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
(3, 'Safe Haven Animal Trust', 'TN-CHN-SHEL-2020-087', 'Chennai');
INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
(4, 'Tails of Joy Foundation', 'DL-DEL-SHEL-2022-205', 'Delhi');
INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
(5, 'Pune Animal Welfare Society', 'MH-PUN-SHEL-2018-013', 'Pune');

-- ----------------------------------------------------------------------------
-- 2. SHELTER STAFF (6 Staff Members across shelters)
-- ----------------------------------------------------------------------------
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(1, 1, 'Dr. Rajesh Rao', 'Chief Veterinarian');
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(2, 1, 'Priya Menon', 'Adoption Coordinator');
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(3, 2, 'Vikram Deshmukh', 'Shelter Manager');
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(4, 3, 'Kavita Sundaram', 'Senior Caretaker');
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(5, 4, 'Amit Verma', 'Adoption Specialist');
INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
(6, 5, 'Sunita Kulkarni', 'Rescue Coordinator');

-- ----------------------------------------------------------------------------
-- 3. BREED (10 Master Breeds across Dogs & Cats)
-- ----------------------------------------------------------------------------
INSERT INTO BREED (breed_name, species) VALUES ('Labrador Retriever', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('Indie / Desi Dog', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('Golden Retriever', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('Beagle', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('German Shepherd', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('Cocker Spaniel', 'Dog');
INSERT INTO BREED (breed_name, species) VALUES ('Persian Cat', 'Cat');
INSERT INTO BREED (breed_name, species) VALUES ('Siamese Cat', 'Cat');
INSERT INTO BREED (breed_name, species) VALUES ('Indie / Desi Cat', 'Cat');
INSERT INTO BREED (breed_name, species) VALUES ('Ragdoll Cat', 'Cat');

-- ----------------------------------------------------------------------------
-- 4. PET (16 Pets across different ages, breeds, and cities)
-- ----------------------------------------------------------------------------
INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(1, 1, 'Labrador Retriever', 'Bruno', 'Male', 24, 'Large', 'Extremely friendly, loves playing fetch and great with kids', 'Active apartment or house with balcony, needs daily park walks', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(2, 1, 'Indie / Desi Dog', 'Luna', 'Female', 12, 'Medium', 'Affectionate, quick learner, very loyal and alert', 'Ideal for both flats and independent homes; low maintenance grooming', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(3, 2, 'Golden Retriever', 'Max', 'Male', 36, 'Large', 'Gentle, patient, sweet-natured therapy dog temperament', 'Spacious home preferred; enjoys swimming and family time', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(4, 2, 'Persian Cat', 'Milo', 'Male', 24, 'Small', 'Calm lap cat, purrs continuously when brushed', 'Quiet indoor apartment, gentle environment without loud noises', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(5, 1, 'Beagle', 'Coco', 'Female', 8, 'Small', 'Playful puppy energy, curious nose, loves social gatherings', 'Needs engaging puzzle toys and supervised outdoor yard time', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(6, 3, 'German Shepherd', 'Rocky', 'Male', 18, 'Large', 'Protective, intelligent, highly trainable, leash trained', 'Active owner experienced with large working breeds', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(7, 3, 'Siamese Cat', 'Cleo', 'Female', 14, 'Small', 'Vocal communicator, curious explorer, loves perching high', 'Indoor home with scratching posts and sunlit window spots', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(8, 4, 'Cocker Spaniel', 'Bella', 'Female', 30, 'Medium', 'Sweet-tempered, eager to please, gentle tail-wagger', 'Moderate exercise needs; loves cuddles on sofa', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(9, 4, 'Indie / Desi Cat', 'Simba', 'Male', 10, 'Small', 'Agile, playful mouser, independent yet cuddly at bedtime', 'Adaptable indoor-outdoor or apartment lifestyle', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(10, 5, 'Ragdoll Cat', 'Oliver', 'Male', 20, 'Medium', 'Relaxed, goes limp when held lovingly, docile companion', 'Strictly indoor apartment with gentle companions', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(11, 5, 'Indie / Desi Dog', 'Maya', 'Female', 16, 'Medium', 'Super resilient, vaccinated, sociable with other dogs', 'Loves morning jogs and afternoon terrace naps', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(12, 1, 'Labrador Retriever', 'Cooper', 'Male', 48, 'Large', 'Mellow senior vibe, fully house-trained, peaceful', 'Calm home seeking a relaxed companion dog', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(13, 2, 'Beagle', 'Daisy', 'Female', 15, 'Small', 'Cheerful soul, friendly to strangers, food motivated', 'Great family dog; needs fenced boundary', 'Pending');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(14, 3, 'Golden Retriever', 'Charlie', 'Male', 22, 'Large', 'High exuberance, loves water splashes and kids', 'Active household ready for outdoor weekend roadtrips', 'Adopted');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(15, 4, 'Persian Cat', 'Zoey', 'Female', 32, 'Small', 'Regal, quiet lady, prefers sleeping on soft cushions', 'Low-energy single occupant or quiet couple home', 'Available');

INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
(16, 5, 'Indie / Desi Dog', 'Leo', 'Male', 9, 'Medium', 'Energetic puppy, quick at agility training and tricks', 'Enthusiastic first-time dog owners welcomed', 'Available');

-- ----------------------------------------------------------------------------
-- 5. PET_PHOTO (High quality Unsplash images with multi-photo support)
-- ----------------------------------------------------------------------------
-- Bruno (Labrador)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(1, 1, 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', 1);
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(2, 1, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80', 0);

-- Luna (Indie Dog)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(3, 2, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80', 1);
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(4, 2, 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80', 0);

-- Max (Golden Retriever)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(5, 3, 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', 1);
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(6, 3, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', 0);

-- Milo (Persian Cat)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(7, 4, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 1);
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(8, 4, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 0);

-- Coco (Beagle)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(9, 5, 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80', 1);

-- Rocky (German Shepherd)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(10, 6, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80', 1);

-- Cleo (Siamese Cat)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(11, 7, 'https://images.unsplash.com/photo-1513360309081-38f0762daed1?auto=format&fit=crop&w=800&q=80', 1);

-- Bella (Cocker Spaniel)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(12, 8, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80', 1);

-- Simba (Indie Cat)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(13, 9, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80', 1);

-- Oliver (Ragdoll Cat)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(14, 10, 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80', 1);

-- Maya (Indie Dog)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(15, 11, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80', 1);

-- Cooper (Labrador Retriever)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(16, 12, 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80', 1);

-- Daisy (Beagle)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(17, 13, 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80', 1);

-- Charlie (Golden Retriever)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(18, 14, 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80', 1);

-- Zoey (Persian Cat)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(19, 15, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80', 1);

-- Leo (Indie Dog)
INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
(20, 16, 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80', 1);

-- ----------------------------------------------------------------------------
-- 6. ADOPTER (6 Realistic Adopters in Indian Metros)
-- ----------------------------------------------------------------------------
INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(1, 'Rahul Sharma', 'rahul.sharma@example.com', '+91-9845012345', 'Bangalore', 'Karnataka');

INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(2, 'Priya Patel', 'priya.patel@example.com', '+91-9820054321', 'Mumbai', 'Maharashtra');

INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(3, 'Ananya Iyer', 'ananya.iyer@example.com', '+91-9840198765', 'Chennai', 'Tamil Nadu');

INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(4, 'Rohan Kapoor', 'rohan.kapoor@example.com', '+91-9811065432', 'Delhi', 'Delhi NCR');

INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(5, 'Sneha Deshpande', 'sneha.d@example.com', '+91-9765034567', 'Pune', 'Maharashtra');

INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
(6, 'Aditya Verma', 'aditya.v@example.com', '+91-9888011223', 'Bangalore', 'Karnataka');

-- ----------------------------------------------------------------------------
-- 7. ADOPTER_PREFERENCE (Preferences for automated match filtering)
-- ----------------------------------------------------------------------------
INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(1, 'Dog', 6, 36, 'Large');

INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(2, 'Cat', 3, 48, 'Small');

INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(3, 'Dog', 6, 24, 'Medium');

INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(4, 'Dog', 12, 60, 'Large');

INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(5, 'Cat', 6, 30, 'Medium');

INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
(6, 'Dog', 4, 18, 'Small');

-- ----------------------------------------------------------------------------
-- 8. PREFERRED_BREED (Adopter to Breed mappings)
-- ----------------------------------------------------------------------------
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (1, 'Labrador Retriever');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (1, 'Golden Retriever');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (2, 'Persian Cat');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (2, 'Siamese Cat');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (3, 'Indie / Desi Dog');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (3, 'Cocker Spaniel');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (4, 'German Shepherd');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (4, 'Labrador Retriever');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (5, 'Ragdoll Cat');
INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (6, 'Beagle');

-- ----------------------------------------------------------------------------
-- 9. SWIPE (Sample Tinder-style swipe history)
-- ----------------------------------------------------------------------------
-- Rahul Sharma (adopter 1) swiped Bruno (RIGHT), Luna (RIGHT), Milo (LEFT)
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(1, 1, 1, 'RIGHT', TIMESTAMP '2026-09-01 10:30:00');
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(2, 1, 2, 'RIGHT', TIMESTAMP '2026-09-01 10:32:15');
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(3, 1, 4, 'LEFT',  TIMESTAMP '2026-09-01 10:34:00');

-- Priya Patel (adopter 2) swiped Milo (RIGHT), Zoey (RIGHT), Bruno (LEFT)
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(4, 2, 4, 'RIGHT', TIMESTAMP '2026-09-02 11:15:00');
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(5, 2, 15, 'RIGHT', TIMESTAMP '2026-09-02 11:18:00');
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(6, 2, 1, 'LEFT',  TIMESTAMP '2026-09-02 11:20:00');

-- Ananya Iyer (adopter 3) swiped Luna (RIGHT), Daisy (RIGHT)
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(7, 3, 2, 'RIGHT', TIMESTAMP '2026-09-03 14:00:00');
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(8, 3, 13, 'RIGHT', TIMESTAMP '2026-09-03 14:05:00');

-- Rohan Kapoor (adopter 4) swiped Charlie (RIGHT)
INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
(9, 4, 14, 'RIGHT', TIMESTAMP '2026-08-20 09:30:00');

-- ----------------------------------------------------------------------------
-- 10. MATCH (Pre-seeded matches from mutual interest)
-- ----------------------------------------------------------------------------
INSERT INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
(1, 1, 1, TIMESTAMP '2026-09-01 10:30:05', 'Active');

INSERT INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
(2, 1, 2, TIMESTAMP '2026-09-01 10:32:20', 'Applied');

INSERT INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
(3, 2, 4, TIMESTAMP '2026-09-02 11:15:10', 'Active');

INSERT INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
(4, 3, 13, TIMESTAMP '2026-09-03 14:05:05', 'Applied');

INSERT INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
(5, 4, 14, TIMESTAMP '2026-08-20 09:30:10', 'Closed');

-- ----------------------------------------------------------------------------
-- 11. ADOPTION_APPLICATION (Formal adoption applications)
-- ----------------------------------------------------------------------------
-- Match 2: Rahul Sharma applying for Luna (Indie dog)
INSERT INTO ADOPTION_APPLICATION (application_id, match_id, staff_id, home_visit_date, application_status, submitted_at) VALUES 
(1, 2, 2, DATE '2026-09-15', 'Pending', TIMESTAMP '2026-09-01 11:00:00');

-- Match 4: Ananya Iyer applying for Daisy (Beagle)
INSERT INTO ADOPTION_APPLICATION (application_id, match_id, staff_id, home_visit_date, application_status, submitted_at) VALUES 
(2, 4, 3, DATE '2026-09-18', 'Under Review', TIMESTAMP '2026-09-03 15:30:00');

-- Match 5: Rohan Kapoor applied for Charlie (Golden Retriever) - historically approved
INSERT INTO ADOPTION_APPLICATION (application_id, match_id, staff_id, home_visit_date, application_status, submitted_at) VALUES 
(3, 5, 4, DATE '2026-08-25', 'Approved', TIMESTAMP '2026-08-20 10:00:00');

-- ----------------------------------------------------------------------------
-- 12. SHELTER_DECISION (Historical shelter adjudication)
-- ----------------------------------------------------------------------------
-- Staff 4 approved adoption of Charlie (pet 14) for Rohan Kapoor (adopter 4)
INSERT INTO SHELTER_DECISION (decision_id, pet_id, adopter_id, decision, staff_id, decided_at) VALUES 
(1, 14, 4, 'Approved', 4, TIMESTAMP '2026-08-26 16:45:00');

COMMIT;
