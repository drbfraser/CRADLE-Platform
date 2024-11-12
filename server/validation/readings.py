from typing import List, Optional

from pydantic import BaseModel, ValidationError

from validation.assessments import AssessmentValidator
from validation.validation_exception import ValidationExceptionError


class ReadingValidator(BaseModel):
    patient_id: str
    systolic_blood_pressure: int
    diastolic_blood_pressure: int
    heart_rate: int
    is_flagged_for_follow_up: Optional[bool] = None
    symptoms: List[str]
    date_taken: Optional[int] = None
    user_id: Optional[int] = None
    follow_up: Optional[AssessmentValidator] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/readings post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                    "patient_id": "123456", - required
                                "systolic_blood_pressure" : 150, - required
                                "diastolic_blood_pressure" : 150, - required
                                "heart_rate" : 35, - required
                                "is_flagged_for_follow_up" : True,
                                "symptoms": ["Headache,Blurred vision,Bleeding,sleepy"], - required
                                "date_taken": 868545,
                                "follow_up": {
                                    "date_assessed": 1551447833,
                                    "diagnosis": "patient is fine",
                                    "medication_prescribed": "tylenol",
                                    "special_investigations": "bcccccccccddeeeff",
                                    "treatment": "b",
                                    "reading_id": "test3",
                                    "follow_up_needed": "TRUE",
                                    "follow_up_instructions": "pls help, give lots of tylenol"
                                }
                            }
        """
        try:
            ReadingValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        # Check if the nested assessment (follow_up) object is valid
        if "follow_up" in request_body:
            try:
                AssessmentValidator(**(request_body["follow_up"]))
            except ValidationError as e:
                print(e)
                raise ValidationExceptionError(str(e.errors()[0]["msg"]))
