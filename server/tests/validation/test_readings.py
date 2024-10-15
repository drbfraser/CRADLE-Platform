import pytest

from validation.readings import validate
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "readingId": "asdasd82314278226313803",
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": 150,
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "dateTimeTaken": 868545,
    "userId": 1,
    "followup": {
        "dateAssessed": 1551447833,
        "healthcareWorkerId": 2,
        "diagnosis": "patient is fine",
        "medicationPrescribed": "tylenol",
        "specialInvestigations": "bcccccccccddeeeff",
        "treatment": "b",
        "patientId": "test3",
        "followupNeeded": "TRUE",
        "followupInstructions": "pls help, give lots of tylenol",
    },
}

# The readingId field is required
required_keys_missing = {
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": 150,
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "dateTimeTaken": 868545,
    "userId": 1,
}

# The readingId field must be type string
not_type_string = {
    "readingId": 123,
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": 150,
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "dateTimeTaken": 868545,
    "userId": 1,
}

# The bpSystolic field must be type int
not_type_int = {
    "readingId": 123,
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": "hello",
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "dateTimeTaken": 868545,
    "userId": 1,
}

# The symptoms field must be type list
not_type_list = {
    "readingId": 123,
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": "hello",
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": "sleepy",
    "dateTimeTaken": 868545,
    "userId": 1,
}

# The followup is invalid as it is missing the dateAssessed field
followup_invalid = {
    "readingId": "asdasd82314278226313803",
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": 150,
    "heartRateBPM": 35,
    "isFlaggedForFollowup": True,
    "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"],
    "dateTimeTaken": 868545,
    "userId": 1,
    "followup": {
        "healthcareWorkerId": 2,
        "diagnosis": "patient is fine",
        "medicationPrescribed": "tylenol",
        "specialInvestigations": "bcccccccccddeeeff",
        "treatment": "b",
        "readingId": "test3",
        "followupNeeded": "TRUE",
        "followupInstructions": "pls help, give lots of tylenol",
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
            validate(json)
    else:
        message = validate(json)
        assert message is None, f"Expected None, but got {message}"
