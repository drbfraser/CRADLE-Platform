import pytest
import data
import data.crud as crud
import service.assoc as assoc
from models import Patient, Reading, Referral, FollowUp


@pytest.mark.skip(
    reason="TODO refactor: readings and referrals are no longer connected"
)
def test_vht_referring_new_patient_and_hcw_assessing_them(
    single_facility_actors, api, make_patient, make_assessment
):
    facility, _, hcw, _, vht = single_facility_actors

    patient_id = "35164646134547"
    reading_id = "0332bf3a-8dcd-4062-8afa-0cb374571bcb"

    try:
        # Create a new patient, reading, and referral as a VHT
        patient_dict = make_patient(
            patient_id=patient_id,
            reading_id=reading_id,
            refer_to=facility.healthFacilityName,
            created_by=vht.id,
        )
        response = api.post(
            endpoint="/api/patients",
            payload=patient_dict,
            email=vht.email,
            password="ftest",
        )
        assert response.status_code == 201

        # May need to force the database into committing changes
        data.db_session.commit()

        # Ensure that the patient, reading, and referral have been created
        referral = crud.read(Referral, readingId=reading_id)

        assert crud.read(Patient, patientId=patient_id) is not None
        assert crud.read(Reading, readingId=reading_id) is not None
        assert referral is not None

        # The referral should not be marked as assessed yet
        assert not referral.isAssessed

        # The patient should have an association with the facility and an association
        # with the VHT who created it
        assert assoc.has_association_by_id(
            patient_id=patient_id, facility_name=facility.healthFacilityName
        )
        assert assoc.has_association_by_id(patient_id=patient_id, user_id=vht.id)

        # Assess the patient as the health care worker
        assessment_dict = make_assessment(reading_id, assessed_by=hcw.id)
        response = api.post(
            endpoint="/api/assessments",
            payload=assessment_dict,
            email=hcw.email,
            password="ftest",
        )
        assert response.status_code == 201

        data.db_session.commit()

        # Ensure that the assessment has been created and that the referral has been
        # marked as assessed
        assert crud.read(FollowUp, readingId=reading_id) is not None
        assert referral.isAssessed

    finally:
        # Cleanup
        crud.delete_by(FollowUp, readingId=reading_id)
        crud.delete_by(Referral, readingId=reading_id)
        crud.delete_by(Reading, readingId=reading_id)
        crud.delete_by(Patient, patientId=patient_id)
        data.db_session.commit()
