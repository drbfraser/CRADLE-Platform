from typing import List, Optional

from validation import CradleBaseModel
from validation.assessments import AssessmentValidator
from validation.referrals import ReferralEntityValidator


class ReadingValidator(CradleBaseModel):
    """
    {
        "patient_id": "123456",
        "systolic_blood_pressure" : 150,
        "diastolic_blood_pressure" : 150,
        "heart_rate" : 55,
        "is_flagged_for_follow_up" : true,
        "symptoms": ["Headache, "Blurred vision", "Bleeding", "Sleepy"],
        "date_taken": 868545,
        "assessment": {
            "date_assessed": 1551447833,
            "diagnosis": "Patient is fine.",
            "medication_prescribed": "Tylenol",
            "special_investigations": "Lorem ipsum.",
            "treatment": "Take Tylenol twice a day.",
            "follow_up_needed": true,
            "follow_up_instructions": "Give lots of Tylenol."
        }
    }
    """

    id: Optional[str] = None
    patient_id: str
    systolic_blood_pressure: int
    diastolic_blood_pressure: int
    heart_rate: int
    is_flagged_for_follow_up: Optional[bool] = None
    symptoms: List[str]
    date_taken: Optional[int] = None
    user_id: Optional[int] = None
    assessment: Optional[AssessmentValidator] = None
    referral: Optional[ReferralEntityValidator] = None
