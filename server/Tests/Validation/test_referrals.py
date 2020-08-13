from datetime import datetime, timedelta
import pytest
from Validation.referrals import validate

# Dynamically calculate valid gestatation age from todays date.
todays_date = datetime.today()
two_weeks_ago = int((todays_date - timedelta(weeks=2)).strftime("%s"))

valid_json = {
    "referralId": "e9b1d6b0-a098-4c0a-ab47-bda85a1890c7",
    "patient": {
        "gestationalTimestamp": two_weeks_ago,
        "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_MONTHS",
        "patientId": "2",
        "patientName": "A",
        "dob": "2000-01-01",
        "patientSex": "FEMALE",
        "isPregnant": True,
        "drugHistory": "",
        "medicalHistory": "",
        "lastEdited": 1596688734,
        "base": 1596688734,
        "readings": [
            {
                "readingId": "0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
                "patientId": "2",
                "dateTimeTaken": 1596938834,
                "bpSystolic": 55,
                "bpDiastolic": 65,
                "heartRateBPM": 75,
                "dateRecheckVitalsNeeded": 1596939723,
                "isFlaggedForFollowup": False,
                "symptoms": ["Blurred vision"],
                "referral": {
                    "dateReferred": 1596938834,
                    "comment": "here is a comment",
                    "patientId": "2",
                    "referralHealthFacilityName": "H0000",
                    "readingId": "0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
                    "isAssessed": False,
                },
                "urineTests": {
                    "urineTestLeuc": "-",
                    "urineTestNit": "+",
                    "urineTestPro": "++",
                    "urineTestBlood": "++",
                    "urineTestGlu": "-",
                },
                "retestOfPreviousReadingIds": "",
            }
        ],
    },
}

# @pytest.mark.parametrize(
#     "json, output",
#     [(valid_json, type(None))],
# )
# def test_validation(json, output):
#     message = validate(json)
#     assert type(message) == output
