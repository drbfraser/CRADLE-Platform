import pytest

from validation.assessments import validate

valid_json = {
    "dateAssessed": 1551447833,
    "diagnosis": "patient is fine",
    "medicationPrescribed": "tylenol",
    "healthcareWorkerId": 2,
    "specialInvestigations": "bcccccccccddeeeff",
    "treatment": "b",
    "readingId": "asdasd82314278226313803",
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
    "readingId": "asdasd82314278226313803",
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
    "readingId": "asdasd82314278226313803",
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
    "readingId": "asdasd82314278226313803",
    "followupNeeded": True,
    "followupInstructions": "pls help, give lots of tylenol",
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_json, type(None)),
        (missing_field, str),
        (missing_followupInstructions_when_followupNeeded_true, str),
        (not_type_int, str),
    ],
)
def test_validation(json, output_type):
    message = validate(json)
    assert type(message) is output_type
