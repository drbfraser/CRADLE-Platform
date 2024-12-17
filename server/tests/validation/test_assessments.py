import pytest

from validation.assessments import AssessmentValidator
from validation.validation_exception import ValidationExceptionError

ASSESSED_DATE = 1551447833

HEALTHCARE_WORKER_ID = 2

assessments_with_valid_fields_should_return_none = {
    "dateAssessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_optional_field_diagnosis_should_return_none = {
    "dateAssessed": ASSESSED_DATE,
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_required_field_dateAssessed_should_throw_exception = {
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}

assessments_field_dateAssessed_has_invalid_type_should_throw_exception = {
    "dateAssessed": "2020-01-01",
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}

assessments_missing_required_field_followupNeeded_should_throw_exception = {
    "dateAssessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupInstructions": "pls help, give lots of tylenol",
}

assessments_has_followupInstructions_when_followupNeeded_true_should_return_none = {
    "dateAssessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patient_id": "asdasd82314278226313803",
    "follow_up_needed": True,
    "follow_up_instructions": "pls help, give lots of tylenol",
}

assessments_missing_followupInstructions_when_followupNeeded_true_should_throw_exception = {
    "dateAssessed": ASSESSED_DATE,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": HEALTHCARE_WORKER_ID,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (assessments_with_valid_fields_should_return_none, None),
        (assessments_missing_optional_field_diagnosis_should_return_none, None),
        (
            assessments_missing_required_field_dateAssessed_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            assessments_field_dateAssessed_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            assessments_missing_required_field_followupNeeded_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            assessments_has_followupInstructions_when_followupNeeded_true_should_return_none,
            None,
        ),
        (
            assessments_missing_followupInstructions_when_followupNeeded_true_should_throw_exception,
            ValidationExceptionError,
        ),
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
