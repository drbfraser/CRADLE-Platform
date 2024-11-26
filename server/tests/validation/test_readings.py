import pytest

from validation.readings import ReadingValidator
from validation.validation_exception import ValidationExceptionError

READING_ID = "asdasd82314278226313803"
PATIENT_ID = "123456"
SOME_INTEGER = 120
LIST_OF_SYMPTOMS = ["Headache,Blurred vision,Bleeding,sleepy"]
# unix epoch code for Monday, January 1, 2024 12:00:00 AM
TIMESTAMP = 1704067200
USER_ID = 1
FOLLOW_UP_INFO = {
    "dateAssessed": 1727766000,
    "healthcareWorkerId": 2,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "test3",
    "followupNeeded": "TRUE",
    "followupInstructions": "pls help, give lots of tylenol",
}

reading_with_valid_fields_should_return_none = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_readingId_should_throw_exception = {
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_patientId_should_throw_exception = {
    "readingId": READING_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_bpSystolic_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_bpDiastolic_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_heartRateBPM_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_optional_field_isFlaggedForFollowup_should_return_none = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_required_field_symptoms_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_optional_field_dateTimeTaken_should_return_none = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_optional_field_userId_should_return_none = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "followup": FOLLOW_UP_INFO,
}

reading_missing_optional_field_followup_should_return_none = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
}

referral_field_readingId_has_wrong_type_should_throw_exception = {
    "readingId": SOME_INTEGER,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_patientId_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": SOME_INTEGER,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_bpSystolic_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": "",
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_bpDiastolic_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": "",
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_heartRateBPM_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": "",
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_isFlaggedForFollowup_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": SOME_INTEGER,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_symptoms_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": SOME_INTEGER,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_dateTimeTaken_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": "",
    "userId": USER_ID,
    "followup": FOLLOW_UP_INFO,
}

referral_field_userId_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": "",
    "followup": FOLLOW_UP_INFO,
}

referral_field_followup_has_wrong_type_should_throw_exception = {
    "readingId": READING_ID,
    "patientId": PATIENT_ID,
    "bpSystolic": SOME_INTEGER,
    "bpDiastolic": SOME_INTEGER,
    "heartRateBPM": SOME_INTEGER,
    "isFlaggedForFollowup": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "dateTimeTaken": TIMESTAMP,
    "userId": USER_ID,
    "followup": SOME_INTEGER,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (reading_with_valid_fields_should_return_none, None),
        (
            reading_missing_required_field_readingId_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            reading_missing_required_field_patientId_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            reading_missing_required_field_bpSystolic_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            reading_missing_required_field_bpDiastolic_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            reading_missing_required_field_heartRateBPM_should_throw_exception,
            ValidationExceptionError,
        ),
        (reading_missing_optional_field_isFlaggedForFollowup_should_return_none, None),
        (
            reading_missing_required_field_symptoms_should_throw_exception,
            ValidationExceptionError,
        ),
        (reading_missing_optional_field_dateTimeTaken_should_return_none, None),
        (reading_missing_optional_field_userId_should_return_none, None),
        (reading_missing_optional_field_followup_should_return_none, None),
        (
            referral_field_readingId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_patientId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_bpSystolic_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_bpDiastolic_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_heartRateBPM_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_isFlaggedForFollowup_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_symptoms_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_dateTimeTaken_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_userId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            referral_field_followup_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            ReadingValidator.validate(json)
    else:
        try:
            ReadingValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
