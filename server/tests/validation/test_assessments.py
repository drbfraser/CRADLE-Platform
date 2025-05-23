import pytest
from pydantic import ValidationError

from validation.assessments import AssessmentPostBody

ASSESSED_DATE = 1551447833
HEALTHCARE_WORKER_ID = 2

assessments_with_valid_fields_should_return_none = {
    "date_assessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_optional_field_diagnosis_should_return_none = {
    "date_assessed": ASSESSED_DATE,
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_required_field_date_assessed_should_throw_none = {
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_field_date_assessed_has_invalid_type_should_throw_exception = {
    "date_assessed": "2020-01-01",
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_required_field_follow_up_needed_should_throw_exception = {
    "date_assessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_has_follow_up_instructions_when_follow_up_needed_true_should_return_none = {
    "date_assessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_follow_up_instructions_when_follow_up_needed_true_should_throw_exception = {
    "date_assessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medication_prescribed": "tylenol",
    "healthcare_worker_id": HEALTHCARE_WORKER_ID,
    "special_investigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (assessments_with_valid_fields_should_return_none, None),
        (assessments_missing_optional_field_diagnosis_should_return_none, None),
        (
            assessments_missing_required_field_date_assessed_should_throw_none,
            None,
        ),
        (
            assessments_field_date_assessed_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            assessments_missing_required_field_follow_up_needed_should_throw_exception,
            ValidationError,
        ),
        (
            assessments_has_follow_up_instructions_when_follow_up_needed_true_should_return_none,
            None,
        ),
        (
            assessments_missing_follow_up_instructions_when_follow_up_needed_true_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            AssessmentPostBody(**json)
    else:
        try:
            AssessmentPostBody(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected error: {e}") from e
