import pytest
from Validation.readings import validate

valid_json = {
    "readingId": "asdasd82314278226313803",
    "patientId": "123456",
    "bpSystolic": 150,
    "bpDiastolic": 150,
    "heartRateBPM": 35,
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
        "readingId": "test3",
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
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
    "respiratoryRate": 14,
    "oxygenSaturation": 99,
    "temperature": 37,
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
    "json, output",
    [
        (valid_json, type(None)),
        (required_keys_missing, str),
        (not_type_string, str),
        (not_type_int, str),
        (not_type_list, str),
        (followup_invalid, str),
    ],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
