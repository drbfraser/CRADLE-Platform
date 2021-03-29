import pytest
from models import Patient
from validation.ReferralValidator import ReferralValidator

validator = ReferralValidator()


def test_validate_passes():
    try:
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.validate(sample_referral)
    except Exception as e:
        pytest.fail("Test failed. Unexpected exception: {0}".format(e))


def test_validate_fails():
    with pytest.raises(Exception):
        # Has invalid extra field, patientName
        sample_referral = {
            "patientName": "AP",
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.validate(sample_referral)


def test_is_string_passes():
    try:
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.isString("comment", sample_referral)
    except Exception as e:
        pytest.fail("Test failed. Unexpected exception: {0}".format(e))


def test_is_string_fails():
    with pytest.raises(Exception):
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.isString("dateReferred", sample_referral)


def test_is_int_passes():
    try:
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.isInt("dateReferred", sample_referral)
    except Exception as e:
        pytest.fail("Test failed. Unexpected exception: {0}".format(e))


def test_is_int_fails():
    with pytest.raises(Exception):
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.isInt("comment", sample_referral)


def test_exists_passes():
    try:
        validator.exists(Patient, "patientId", "49300028162")
    except Exception as e:
        pytest.fail("Test failed. Unexpected exception: {0}".format(e))


def test_exists_fails():
    with pytest.raises(Exception):
        validator.exists(Patient, "patientId", "nonExistantId")


def test_is_enforce_required_passes():
    try:
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "patientId": "49300028162",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.enforce_required(sample_referral)
    except Exception as e:
        pytest.fail("Test failed. Unexpected exception: {0}".format(e))


def test_is_enforce_required_fails():
    with pytest.raises(Exception):
        # patientId field missing
        sample_referral = {
            "id": "123456",
            "dateReferred": 1552311833,
            "comment": "Needs help stat!",
            "actionTaken": "Sent to hospital",
            "userId": "1",
            "referralHealthFacilityName": "H0000",
            "readingId": "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        }
        validator.isInt(sample_referral)
