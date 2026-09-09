// ============================================================================
// Project: Kinder Pets - DBMS DA2 Project Types
// Description: Strongly-typed interfaces for all 12 DA1 Entities
// ============================================================================

export type PetGender = 'Male' | 'Female' | 'Unknown';
export type PetSize = 'Small' | 'Medium' | 'Large' | 'Extra Large';
export type PetStatus = 'Available' | 'Pending' | 'Adopted' | 'Fostered';
export type SwipeDirection = 'LEFT' | 'RIGHT';
export type MatchStatus = 'Active' | 'Applied' | 'Closed';
export type ApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
export type ShelterDecisionValue = 'Approved' | 'Rejected';

// 1. SHELTER
export interface Shelter {
  shelter_id: number;
  shelter_name: string;
  license_no: string;
  city: string;
}

// 2. SHELTER_STAFF
export interface ShelterStaff {
  staff_id: number;
  shelter_id: number;
  staff_name: string;
  role: string;
}

// 3. BREED
export interface Breed {
  breed_name: string;
  species: string; // 'Dog' | 'Cat'
}

// 4. PET
export interface Pet {
  pet_id: number;
  shelter_id: number;
  breed_name: string;
  pet_name: string;
  gender: PetGender;
  age_months: number;
  size: PetSize;
  behaviour_desc: string;
  lifestyle_desc: string;
  status: PetStatus;
}

// 5. PET_PHOTO
export interface PetPhoto {
  photo_id: number;
  pet_id: number;
  photo_url: string;
  is_primary: number; // 0 or 1
}

// 6. ADOPTER
export interface Adopter {
  adopter_id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

// 7. ADOPTER_PREFERENCE
export interface AdopterPreference {
  adopter_id: number;
  preferred_species: string | null;
  min_age_months: number;
  max_age_months: number;
  preferred_size: PetSize | null;
}

// 8. PREFERRED_BREED
export interface PreferredBreed {
  adopter_id: number;
  breed_name: string;
}

// 9. SWIPE
export interface Swipe {
  swipe_id: number;
  adopter_id: number;
  pet_id: number;
  direction: SwipeDirection;
  swiped_at: string;
}

// 10. MATCH
export interface Match {
  match_id: number;
  adopter_id: number;
  pet_id: number;
  matched_at: string;
  status: MatchStatus;
}

// 11. ADOPTION_APPLICATION
export interface AdoptionApplication {
  application_id: number;
  match_id: number;
  staff_id: number | null;
  home_visit_date: string;
  application_status: ApplicationStatus;
  submitted_at: string;
}

// 12. SHELTER_DECISION
export interface ShelterDecision {
  decision_id: number;
  pet_id: number;
  adopter_id: number;
  decision: ShelterDecisionValue;
  staff_id: number;
  decided_at: string;
}

// Composite / ViewModel Types for Rich UI Views
export interface EnrichedPet extends Pet {
  species: string;
  shelter_name: string;
  shelter_city: string;
  photos: PetPhoto[];
  primary_photo: string;
  approx_distance_km: number;
}

export interface EnrichedMatch extends Match {
  pet: EnrichedPet;
  adopter: Adopter;
  has_application: boolean;
  application_id?: number;
  application_status?: ApplicationStatus;
}

export interface EnrichedApplication extends AdoptionApplication {
  match: Match;
  pet: EnrichedPet;
  adopter: Adopter;
  staff?: ShelterStaff;
}

export interface UserContext {
  role: 'adopter' | 'staff';
  currentAdopterId: number;
  currentStaffId: number;
}
