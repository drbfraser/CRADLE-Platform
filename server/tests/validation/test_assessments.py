import pytest

from validation.assessments import AssessmentValidator
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "date_assessed": 1551447833,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": 2,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

# date_assessed field is missing
missing_field = {
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": 2,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

missing_follow_up_instructions_when_follow_up_needed_true = {
    "date_assessed": 1551447833,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": 2,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "",
}

# date_assessed must be int
not_type_int = {
    "date_assessed": "2020-01-01",
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": 2,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationExceptionError),
        (
            missing_follow_up_instructions_when_follow_up_needed_true,
            ValidationExceptionError,
        ),
        (not_type_int, ValidationExceptionError),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            AssessmentValidator.validate(json)
    else:
        try:
            AssessmentValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
