from typing import List, Optional

from pydantic import BaseModel, ValidationError

from validation.assessments import Assessment
from validation.validation_exception import ValidationExceptionError


class ReadingValidator(BaseModel):
    readingId: str
    patientId: str
    bpSystolic: int
    bpDiastolic: int
    heartRateBPM: int
    isFlaggedForFollowup: Optional[bool] = None
    symptoms: List[str]
    dateTimeTaken: Optional[int] = None
    userId: Optional[int] = None
    followup: Optional[Assessment] = None

    @staticmethod
    def validate(request_body: dict):
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
                                "followup": {
                                    "dateAssessed": 1551447833,
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
        try:
            ReadingValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        # Check if the nested assessment (followup) object is valid
        if "followup" in request_body:
            try:
                Assessment(**(request_body.get("followup")))
            except ValidationError as e:
                raise ValidationExceptionError(str(e.errors()[0]["msg"]))
