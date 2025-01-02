import pytest
from pydantic import ValidationError

from validation.readings import ReadingValidator

READING_ID = "asdasd82314278226313803"
PATIENT_ID = "123456"
SOME_INTEGER = 120
LIST_OF_SYMPTOMS = ["Headache", "Blurred vision", "Bleeding", "sleepy"]
# unix epoch code for Monday, January 1, 2024 12:00:00 AM
TIMESTAMP = 1704067200
USER_ID = 1
ASSESSMENT = {
    "date_assessed": 1551447833,
    "healthcare_worker_id": 2,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

reading_with_valid_fields_should_return_none = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_optional_field_id_should_return_none = {
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_required_field_patient_id_should_throw_exception = {
    "id": READING_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_required_field_systolic_blood_pressure_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_required_field_diastolic_blood_pressure_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_required_field_heart_rate_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_optional_field_is_flagged_for_follow_up_should_return_none = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_required_field_symptoms_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_optional_field_date_taken_should_return_none = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

reading_missing_optional_field_user_id_should_return_none = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "assessment": ASSESSMENT,
}

reading_missing_optional_field_assessment_should_return_none = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
}

referral_field_id_has_wrong_type_should_throw_exception = {
    "id": SOME_INTEGER,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_patient_id_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": SOME_INTEGER,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_systolic_blood_pressure_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": "",
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_diastolic_blood_pressure_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": "",
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_heart_rate_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": "",
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_is_flagged_for_follow_up_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": SOME_INTEGER,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_symptoms_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": SOME_INTEGER,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_date_taken_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": "",
    "user_id": USER_ID,
    "assessment": ASSESSMENT,
}

referral_field_user_id_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": "",
    "assessment": ASSESSMENT,
}

referral_field_assessment_has_wrong_type_should_throw_exception = {
    "id": READING_ID,
    "patient_id": PATIENT_ID,
    "systolic_blood_pressure": SOME_INTEGER,
    "diastolic_blood_pressure": SOME_INTEGER,
    "heart_rate": SOME_INTEGER,
    "is_flagged_for_follow_up": True,
    "symptoms": LIST_OF_SYMPTOMS,
    "date_taken": TIMESTAMP,
    "user_id": USER_ID,
    "assessment": SOME_INTEGER,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (reading_with_valid_fields_should_return_none, None),
        (
            reading_missing_optional_field_id_should_return_none,
            None,
        ),
        (
            reading_missing_required_field_patient_id_should_throw_exception,
            ValidationError,
        ),
        (
            reading_missing_required_field_systolic_blood_pressure_should_throw_exception,
            ValidationError,
        ),
        (
            reading_missing_required_field_diastolic_blood_pressure_should_throw_exception,
            ValidationError,
        ),
        (
            reading_missing_required_field_heart_rate_should_throw_exception,
            ValidationError,
        ),
        (
            reading_missing_optional_field_is_flagged_for_follow_up_should_return_none,
            None,
        ),
        (
            reading_missing_required_field_symptoms_should_throw_exception,
            ValidationError,
        ),
        (reading_missing_optional_field_date_taken_should_return_none, None),
        (reading_missing_optional_field_user_id_should_return_none, None),
        (reading_missing_optional_field_assessment_should_return_none, None),
        (
            referral_field_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_patient_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_systolic_blood_pressure_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_diastolic_blood_pressure_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_heart_rate_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_is_flagged_for_follow_up_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_symptoms_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_date_taken_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_user_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            referral_field_assessment_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            ReadingValidator(**json)
    else:
        try:
            ReadingValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
