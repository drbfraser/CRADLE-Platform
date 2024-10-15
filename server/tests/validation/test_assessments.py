import pytest

from validation.assessments import validate
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "dateAssessed": 1551447833,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": 2,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}

# dateAssessed field is missing
missing_field = {
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": 2,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}

missing_followupInstructions_when_followupNeeded_true = {
    "dateAssessed": 1551447833,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": 2,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "",
}

# dateAssessed must be int
not_type_int = {
    "dateAssessed": "2020-01-01",
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": 2,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "patientId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationExceptionError),
        (
            missing_followupInstructions_when_followupNeeded_true,
            ValidationExceptionError,
        ),
        (not_type_int, ValidationExceptionError),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            validate(json)
    else:
        message = validate(json)
        assert message is None, f"Expected None, but got {message}"
