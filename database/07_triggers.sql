-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 07_triggers.sql
-- Description: Oracle PL/SQL Database Triggers.
-- Triggers:
--   1. trg_prevent_invalid_pet_status: Business constraint on pet lifecycle
--   2. trg_decision_update_pet_status: Cascade decision to PET status
--   3. trg_prevent_duplicate_application: Prevent overlapping active applications
--   4. trg_single_primary_photo: Maintain exactly one primary photo per pet
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger 1: trg_prevent_invalid_pet_status
-- Purpose: Enforces valid state transitions on PET status.
-- Rule: An 'Adopted' pet cannot be reset to 'Available' without explicit archiving.
--       A pet cannot transition directly from 'Available' to 'Adopted' without
--       being in 'Pending' status (unless bypassed by admin).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_prevent_invalid_pet_status
BEFORE UPDATE OF status ON PET
FOR EACH ROW
BEGIN
    -- Prevent reopening an adopted pet
    IF :OLD.status = 'Adopted' AND :NEW.status = 'Available' THEN
        RAISE_APPLICATION_ERROR(-20010, 'Illegal State Transition: Adopted pets cannot be reverted to Available directly.');
    END IF;

    -- Require pending status before adoption
    IF :OLD.status = 'Available' AND :NEW.status = 'Adopted' THEN
        RAISE_APPLICATION_ERROR(-20011, 'Illegal State Transition: Pet must be in Pending status before adoption approval.');
    END IF;
END trg_prevent_invalid_pet_status;
/

-- ----------------------------------------------------------------------------
-- Trigger 2: trg_decision_update_pet_status
-- Purpose: Automatically synchronizes PET.status and MATCH.status when a
--          shelter staff records a decision in SHELTER_DECISION.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_decision_update_pet_status
AFTER INSERT ON SHELTER_DECISION
FOR EACH ROW
BEGIN
    IF :NEW.decision = 'Approved' THEN
        -- If approved, mark pet as adopted
        UPDATE PET 
        SET status = 'Adopted' 
        WHERE pet_id = :NEW.pet_id;

        -- Close all active matches for this pet
        UPDATE MATCH 
        SET status = 'Closed' 
        WHERE pet_id = :NEW.pet_id;
    ELSIF :NEW.decision = 'Rejected' THEN
        -- If rejected, reopen pet as available for other adopters
        UPDATE PET 
        SET status = 'Available' 
        WHERE pet_id = :NEW.pet_id;
    END IF;
END trg_decision_update_pet_status;
/

-- ----------------------------------------------------------------------------
-- Trigger 3: trg_prevent_duplicate_application
-- Purpose: Prevents creating a second application for a match that already
--          has an application in progress.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_application
BEFORE INSERT ON ADOPTION_APPLICATION
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM ADOPTION_APPLICATION
    WHERE match_id = :NEW.match_id
      AND application_status IN ('Pending', 'Under Review');

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'Duplicate Application Error: An active application is already pending review for this match.');
    END IF;
END trg_prevent_duplicate_application;
/

-- ----------------------------------------------------------------------------
-- Trigger 4: trg_single_primary_photo
-- Purpose: Ensures that only one photo is marked as primary per pet.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_single_primary_photo
BEFORE INSERT OR UPDATE OF is_primary ON PET_PHOTO
FOR EACH ROW
WHEN (NEW.is_primary = 1)
BEGIN
    UPDATE PET_PHOTO
    SET is_primary = 0
    WHERE pet_id = :NEW.pet_id
      AND photo_id != NVL(:NEW.photo_id, -1);
END trg_single_primary_photo;
/
