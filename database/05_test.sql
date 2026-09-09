-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 05_test.sql
-- Description: Comprehensive End-to-End Test and Demonstration Script.
-- Demonstrates:
--   1. Table counts across all 12 tables
--   2. Core SELECT queries for pet discovery and matching
--   3. Successful pet registration (add_pet)
--   4. Successful user swipe (record_swipe)
--   5. Successful match creation (create_match)
--   6. Successful adoption application submission (submit_adoption_application)
--   7. GOVERNANCE ENFORCEMENT: Rejection of unauthorized staff approval attempt (ORA-20020)
--   8. Successful adoption approval by authorized shelter staff
--   9. Complete adoption rejection lifecycle demonstration
--  10. User-defined function evaluations
--  11. Final system state inspection across entities
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 220;
SET PAGESIZE 100;
SET FEEDBACK ON;
SET DEFINE OFF;

PROMPT ============================================================================
PROMPT TEST SUITE 1: VERIFYING TABLE COUNTS ACROSS ALL 12 DA1 TABLES
PROMPT ============================================================================

SELECT '1. SHELTER' AS entity, COUNT(*) AS total_rows FROM SHELTER
UNION ALL SELECT '2. SHELTER_STAFF', COUNT(*) FROM SHELTER_STAFF
UNION ALL SELECT '3. BREED', COUNT(*) FROM BREED
UNION ALL SELECT '4. PET', COUNT(*) FROM PET
UNION ALL SELECT '5. PET_PHOTO', COUNT(*) FROM PET_PHOTO
UNION ALL SELECT '6. ADOPTER', COUNT(*) FROM ADOPTER
UNION ALL SELECT '7. ADOPTER_PREFERENCE', COUNT(*) FROM ADOPTER_PREFERENCE
UNION ALL SELECT '8. PREFERRED_BREED', COUNT(*) FROM PREFERRED_BREED
UNION ALL SELECT '9. SWIPE', COUNT(*) FROM SWIPE
UNION ALL SELECT '10. PET_MATCH (DA1 MATCH)', COUNT(*) FROM PET_MATCH
UNION ALL SELECT '11. ADOPTION_APPLICATION', COUNT(*) FROM ADOPTION_APPLICATION
UNION ALL SELECT '12. SHELTER_DECISION', COUNT(*) FROM SHELTER_DECISION;

PROMPT ============================================================================
PROMPT TEST SUITE 2: IMPORTANT SYSTEM SELECT QUERIES
PROMPT ============================================================================

PROMPT >>> 2.1 Available Pets in Bangalore <<<
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p."SIZE" AS pet_size,
    s.shelter_name,
    s.city,
    p.status
FROM PET p
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE UPPER(s.city) = 'BANGALORE' AND p.status = 'Available';

PROMPT >>> 2.2 Active Matches Overview <<<
SELECT 
    m.match_id,
    a.full_name AS adopter_name,
    p.pet_name,
    p.breed_name,
    m.status AS match_status,
    TO_CHAR(m.matched_at, 'YYYY-MM-DD HH24:MI:SS') AS matched_at
FROM PET_MATCH m
INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
INNER JOIN PET p ON m.pet_id = p.pet_id
WHERE m.status = 'Active';

PROMPT ============================================================================
PROMPT TEST SUITE 3 TO 8: PL/SQL WORKFLOWS AND SHELTER GOVERNANCE VALIDATION
PROMPT ============================================================================

DECLARE
    -- Workflow 1 Variables (Approval & Governance)
    v_pet1_id     PET.pet_id%TYPE;
    v_is_match1   NUMBER;
    v_match1_id   PET_MATCH.match_id%TYPE;
    v_app1_id     ADOPTION_APPLICATION.application_id%TYPE;
    v_dec1_id     SHELTER_DECISION.decision_id%TYPE;
    
    -- Workflow 2 Variables (Rejection Lifecycle)
    v_pet2_id     PET.pet_id%TYPE;
    v_is_match2   NUMBER;
    v_match2_id   PET_MATCH.match_id%TYPE;
    v_app2_id     ADOPTION_APPLICATION.application_id%TYPE;
    v_dec2_id     SHELTER_DECISION.decision_id%TYPE;

    -- Inspection Variables
    v_pet_status  PET.status%TYPE;
    v_match_stat  PET_MATCH.status%TYPE;
    v_app_stat    ADOPTION_APPLICATION.application_status%TYPE;
    v_gov_caught  BOOLEAN := FALSE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 1: ADD A NEW PET TO SHELTER 1 (Bangalore)');
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    add_pet(
        p_shelter_id     => 1,
        p_breed_name     => 'Beagle',
        p_pet_name       => 'Buddy',
        p_gender         => 'Male',
        p_age_months     => 10,
        p_size           => 'Small',
        p_behaviour_desc => 'Energetic, loves cuddles and squeaky toys',
        p_lifestyle_desc => 'Family apartment or house with backyard',
        o_pet_id         => v_pet1_id
    );

    SELECT status INTO v_pet_status FROM PET WHERE pet_id = v_pet1_id;
    DBMS_OUTPUT.PUT_LINE('-> Verified: Pet #' || v_pet1_id || ' status is: ' || v_pet_status);

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 2: RECORD RIGHT SWIPE BY ADOPTER 6 (Aditya Verma, Bangalore)');
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    record_swipe(
        p_adopter_id => 6,
        p_pet_id     => v_pet1_id,
        p_direction  => 'RIGHT',
        o_is_match   => v_is_match1,
        o_match_id   => v_match1_id
    );
    DBMS_OUTPUT.PUT_LINE('-> Verified: Right swipe resulted in match? ' || 
                         CASE WHEN v_is_match1 = 1 THEN 'YES (Match ID: ' || v_match1_id || ')' ELSE 'NO' END);

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 3: SUBMIT ADOPTION APPLICATION');
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    submit_adoption_application(
        p_match_id        => v_match1_id,
        p_home_visit_date => TRUNC(SYSDATE) + 5,
        o_application_id  => v_app1_id
    );

    SELECT status INTO v_pet_status FROM PET WHERE pet_id = v_pet1_id;
    SELECT status INTO v_match_stat FROM PET_MATCH WHERE match_id = v_match1_id;
    SELECT application_status INTO v_app_stat FROM ADOPTION_APPLICATION WHERE application_id = v_app1_id;

    DBMS_OUTPUT.PUT_LINE('-> State Check after Submission:');
    DBMS_OUTPUT.PUT_LINE('   Application #' || v_app1_id || ' status: ' || v_app_stat);
    DBMS_OUTPUT.PUT_LINE('   Pet #' || v_pet1_id || ' status: ' || v_pet_status);
    DBMS_OUTPUT.PUT_LINE('   Match #' || v_match1_id || ' status: ' || v_match_stat);

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 4: GOVERNANCE ENFORCEMENT TEST');
    DBMS_OUTPUT.PUT_LINE('Attempt approval by Staff 3 (Vikram Deshmukh from Shelter 2 / Mumbai)');
    DBMS_OUTPUT.PUT_LINE('Pet #' || v_pet1_id || ' belongs to Shelter 1 (Bangalore)');
    DBMS_OUTPUT.PUT_LINE('EXPECTED: ORA-20020 Authorization Violation');
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    BEGIN
        approve_adoption(
            p_application_id => v_app1_id,
            p_staff_id       => 3, -- Belongs to Shelter 2, unauthorized for Shelter 1 pet
            o_decision_id    => v_dec1_id
        );
        DBMS_OUTPUT.PUT_LINE('[SECURITY TEST FAILED] Unauthorized approval was NOT blocked!');
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20020 THEN
                v_gov_caught := TRUE;
                DBMS_OUTPUT.PUT_LINE('[GOVERNANCE TEST PASSED] Authorization blocked successfully:');
                DBMS_OUTPUT.PUT_LINE('   Error: ' || SQLERRM);
            ELSE
                DBMS_OUTPUT.PUT_LINE('[SECURITY TEST UNEXPECTED ERROR] ' || SQLERRM);
            END IF;
    END;

    IF NOT v_gov_caught THEN
        RAISE_APPLICATION_ERROR(-20099, 'Governance Test Failed: Cross-shelter approval did not raise expected error -20020');
    END IF;

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 5: AUTHORIZED APPROVAL');
    DBMS_OUTPUT.PUT_LINE('Staff 2 (Priya Menon, Shelter 1) approves Application #' || v_app1_id);
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    approve_adoption(
        p_application_id => v_app1_id,
        p_staff_id       => 2, -- Authorized staff belonging to Shelter 1
        o_decision_id    => v_dec1_id
    );

    SELECT status INTO v_pet_status FROM PET WHERE pet_id = v_pet1_id;
    SELECT status INTO v_match_stat FROM PET_MATCH WHERE match_id = v_match1_id;
    SELECT application_status INTO v_app_stat FROM ADOPTION_APPLICATION WHERE application_id = v_app1_id;

    DBMS_OUTPUT.PUT_LINE('-> State Check after Authorized Approval:');
    DBMS_OUTPUT.PUT_LINE('   Decision ID: ' || v_dec1_id);
    DBMS_OUTPUT.PUT_LINE('   Pet #' || v_pet1_id || ' status: ' || v_pet_status || ' (Expected: Adopted)');
    DBMS_OUTPUT.PUT_LINE('   Application #' || v_app1_id || ' status: ' || v_app_stat || ' (Expected: Approved)');
    DBMS_OUTPUT.PUT_LINE('   Match #' || v_match1_id || ' status: ' || v_match_stat || ' (Expected: Closed)');

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('STEP 6: REJECTION LIFECYCLE DEMONSTRATION');
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    -- 6a: Add second pet
    add_pet(
        p_shelter_id     => 1,
        p_breed_name     => 'Indie / Desi Dog',
        p_pet_name       => 'Rocky Jr.',
        p_gender         => 'Male',
        p_age_months     => 6,
        p_size           => 'Medium',
        p_behaviour_desc => 'Gentle puppy, vaccinated, alert',
        p_lifestyle_desc => 'Indoor home with moderate walks',
        o_pet_id         => v_pet2_id
    );

    -- 6b: Adopter 1 swiped right
    record_swipe(1, v_pet2_id, 'RIGHT', v_is_match2, v_match2_id);

    -- 6c: Submit application
    submit_adoption_application(v_match2_id, TRUNC(SYSDATE) + 7, v_app2_id);

    -- 6d: Reject application by authorized Staff 1 (Shelter 1)
    reject_adoption(v_app2_id, 1, v_dec2_id);

    SELECT status INTO v_pet_status FROM PET WHERE pet_id = v_pet2_id;
    SELECT status INTO v_match_stat FROM PET_MATCH WHERE match_id = v_match2_id;
    SELECT application_status INTO v_app_stat FROM ADOPTION_APPLICATION WHERE application_id = v_app2_id;

    DBMS_OUTPUT.PUT_LINE('-> State Check after Rejection:');
    DBMS_OUTPUT.PUT_LINE('   Decision ID: ' || v_dec2_id);
    DBMS_OUTPUT.PUT_LINE('   Pet #' || v_pet2_id || ' status: ' || v_pet_status || ' (Expected: Available)');
    DBMS_OUTPUT.PUT_LINE('   Application #' || v_app2_id || ' status: ' || v_app_stat || ' (Expected: Rejected)');
    DBMS_OUTPUT.PUT_LINE('   Match #' || v_match2_id || ' status: ' || v_match_stat || ' (Expected: Closed)');
END;
/

PROMPT ============================================================================
PROMPT TEST SUITE 9: USER-DEFINED FUNCTION EVALUATIONS
PROMPT ============================================================================

SELECT 
    get_available_pet_count() AS total_available_all_shelters,
    get_available_pet_count(1) AS shelter_1_blr_available,
    get_available_pet_count(2) AS shelter_2_mum_available,
    get_adopter_match_count(1) AS adopter_1_active_matches,
    is_pet_suitable_for_adopter(1, 1) AS adopter_1_pet_1_suitability,
    is_pet_suitable_for_adopter(1, 4) AS adopter_1_pet_4_suitability
FROM DUAL;

PROMPT ============================================================================
PROMPT TEST SUITE 10: FINAL SYSTEM AUDIT AND STATE VERIFICATION
PROMPT ============================================================================

PROMPT >>> 10.1 All Shelter Decisions (Audit Trail) <<<
SELECT 
    d.decision_id,
    d.decision AS verdict,
    p.pet_id,
    p.pet_name,
    a.full_name AS adopter_name,
    st.staff_name AS decided_by_staff,
    s.shelter_name,
    TO_CHAR(d.decided_at, 'YYYY-MM-DD HH24:MI:SS') AS decided_at
FROM SHELTER_DECISION d
INNER JOIN PET p ON d.pet_id = p.pet_id
INNER JOIN ADOPTER a ON d.adopter_id = a.adopter_id
INNER JOIN SHELTER_STAFF st ON d.staff_id = st.staff_id
INNER JOIN SHELTER s ON st.shelter_id = s.shelter_id
ORDER BY d.decision_id ASC;

PROMPT >>> 10.2 Final Application Pipeline Status <<<
SELECT 
    app.application_id,
    app.application_status,
    p.pet_name,
    p.status AS pet_status,
    a.full_name AS applicant,
    NVL(st.staff_name, 'Unassigned') AS reviewer
FROM ADOPTION_APPLICATION app
INNER JOIN PET_MATCH m ON app.match_id = m.match_id
INNER JOIN PET p ON m.pet_id = p.pet_id
INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
LEFT JOIN SHELTER_STAFF st ON app.staff_id = st.staff_id
ORDER BY app.application_id ASC;

PROMPT >>> 10.3 Final Table Row Counts <<<
SELECT 'PET' AS entity, COUNT(*) AS count FROM PET
UNION ALL SELECT 'SWIPE', COUNT(*) FROM SWIPE
UNION ALL SELECT 'PET_MATCH', COUNT(*) FROM PET_MATCH
UNION ALL SELECT 'ADOPTION_APPLICATION', COUNT(*) FROM ADOPTION_APPLICATION
UNION ALL SELECT 'SHELTER_DECISION', COUNT(*) FROM SHELTER_DECISION;

PROMPT ============================================================================
PROMPT ALL TEST SUITES EXECUTED SUCCESSFULLY!
PROMPT ============================================================================
