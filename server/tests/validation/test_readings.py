import pytest

from validation.readings import ReadingValidator
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "id": "asdasd82314278226313803",
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": 150,
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "date_taken": 868545,
    "user_id": 1,
    "follow_up": {
        "dateAssessed": 1551447833,
        "healthcare_worker_id": 2,
        "diagnosis": "patient is fine",
        "medication_prescribed": "tylenol",
        "special_investigations": "bcccccccccddeeeff",
        "treatment": "b",
        "patient_id": "test3",
        "follow_up_needed": "TRUE",
        "follow_up_instructions": "pls help, give lots of tylenol",
    },
}

# The id field is required
required_keys_missing = {
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": 150,
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "date_taken": 868545,
    "user_id": 1,
}

# The id field must be type string
not_type_string = {
    "id": 123,
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": 150,
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "date_taken": 868545,
    "user_id": 1,
}

# The systolic_blood_pressure field must be type int
not_type_int = {
    "id": 123,
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": "hello",
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "date_taken": 868545,
    "user_id": 1,
}

# The symptoms field must be type list
not_type_list = {
    "id": 123,
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": "hello",
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": "sleepy",
    "date_taken": 868545,
    "user_id": 1,
}

# The follow_up is invalid as it is missing the dateAssessed field
followup_invalid = {
    "id": "asdasd82314278226313803",
    "patient_id": "123456",
    "systolic_blood_pressure": 150,
    "diastolic_blood_pressure": 150,
    "heart_rate": 35,
    "is_flagged_for_follow_up": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "date_taken": 868545,
    "user_id": 1,
    "follow_up": {
        "healthcare_worker_id": 2,
        "diagnosis": "patient is fine",
        "medication_prescribed": "tylenol",
        "special_investigations": "bcccccccccddeeeff",
        "treatment": "b",
        "id": "test3",
        "follow_up_needed": "TRUE",
        "follow_up_instructions": "pls help, give lots of tylenol",
    },
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (required_keys_missing, ValidationExceptionError),
        (not_type_string, ValidationExceptionError),
        (not_type_int, ValidationExceptionError),
        (not_type_list, ValidationExceptionError),
        (followup_invalid, ValidationExceptionError),
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
