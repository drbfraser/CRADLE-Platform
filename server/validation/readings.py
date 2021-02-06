from validation.assessments import validate as validate_assessment
from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error code and message if the /api/readings post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "readingId": "asdasd82314278226313803", - required
                            "patientId": "123456", - required
                            "bpSystolic" : 150, - required
                            "bpDiastolic" : 150, - required
                            "heartRateBPM" : 35, - required
                            "isFlaggedForFollowup" : True,
                            "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"], - required
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
                                "followupInstructions": "pls help, give lots of tylenol"
                            }
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error_message = None

    # Check if required keys are present
    required_keys = [
        "readingId",
        "patientId",
        "bpSystolic",
        "bpDiastolic",
        "heartRateBPM",
        "symptoms",
    ]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["readingId"], str)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type int
    error_message = values_correct_type(
        request_body,
        [
            "patientId",
            "bpSystolic",
            "bpDiastolic",
            "heartRateBPM",
            "userId",
        ],
        int,
    )
    if error_message is not None:
        return error_message

    # Check that certain fields are an array
    error_message = values_correct_type(request_body, ["symptoms"], list)
    if error_message is not None:
        return error_message

    # Check if the nested assessment (followup) object is valid
    if "followup" in request_body:
        error_message = validate_assessment(request_body.get("followup"))
        if error_message is not None:
            return error_message

    return error_message
