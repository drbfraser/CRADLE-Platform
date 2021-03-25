from typing import Optional
from validation.patients import validate as validate_patient
from validation.readings import validate as validate_reading
from validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/referrals post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                        "referralId":"e9b1d6b0-a098-4c0a-ab47-bda85a1890c7",
                        "patient":{
                                "gestationalTimestamp":two_weeks_ago,
                                "gestationalAgeUnit":"MONTHS",
                                "patientId":"2",
                                "patientName":"A",
                                "dob":"2000-01-01",
                                "patientSex":"FEMALE",
                                "isPregnant":True,
                                "drugHistory":"",
                                "medicalHistory":"",
                                "lastEdited":1596688734,
                                "base":1596688734,
                                "readings":[
                                    {
                                    "readingId":"0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
                                    "patientId":"2",
                                    "dateTimeTaken":1596938834,
                                    "bpSystolic":55,
                                    "bpDiastolic":65,
                                    "heartRateBPM":75,
                                    "dateRecheckVitalsNeeded":1596939723,
                                    "isFlaggedForFollowup":False,
                                    "symptoms":[
                                        "Blurred vision"
                                    ],
                                    "referral":{
                                        "dateReferred":1596938834,
                                        "comment":"here is a comment",
                                        "patientId":"2",
                                        "referralHealthFacilityName":"H0000",
                                        "readingId":"0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
                                        "isAssessed":False
                                    },
                                    "urineTests":{
                                        "urineTestLeuc":"-",
                                        "urineTestNit":"+",
                                        "urineTestPro":"++",
                                        "urineTestBlood":"++",
                                        "urineTestGlu":"-"
                                    },
                                    "retestOfPreviousReadingIds":""
                                    }
                                ]
                            }
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error_message = None

    # Check if required keys are present
    required_keys = ["referralId"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that nested `patient` JSON is valid
    error_message = validate_patient(request_body.get("patient"))
    if error_message is not None:
        return error_message

    # Check that each element in the nested `readings` array is valid
    list_of_readings = request_body.get("patient").get("readings")

    for reading_body in list_of_readings:
        # Validate the reading itself
        error_message = validate_reading(reading_body)
        if error_message is not None:
            return error_message

        referral_body = reading_body.get("referral")

        # Check if required keys are present
        error_message = required_keys_present(
            referral_body,
            [
                "dateReferred",
                "readingId",
                "isAssessed",
                "patientId",
                "referralHealthFacilityName",
            ],
        )
        if error_message is not None:
            return error_message

        # Check that certain fields are of type int
        error_message = values_correct_type(request_body, ["dateReferred"], int)
        if error_message is not None:
            return error_message

        # Check that certain fields are of type string
        error_message = values_correct_type(request_body, ["readingId"], str)
        if error_message is not None:
            return error_message

    return error_message
