from typing import Optional

from pydantic import Field, RootModel

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.assessments import AssessmentResponse, CreateAssessmentRequest
from validation.referrals import CreateReferralRequest, ReferralResponse


class ReadingBase(CradleBaseModel):
    id: Optional[str] = None
    patient_id: str
    systolic_blood_pressure: int
    diastolic_blood_pressure: int
    heart_rate: int
    is_flagged_for_follow_up: bool = False
    symptoms: list[str] = []
    date_taken: int = Field(default_factory=get_current_time)
    last_edited: int = Field(default_factory=get_current_time)
    date_retest_needed: Optional[int] = None

    model_config = dict(
        openapi_extra={
            "example": {
                "patient_id": "123456",
                "systolic_blood_pressure": 150,
                "diastolic_blood_pressure": 150,
                "heart_rate": 55,
                "is_flagged_for_follow_up": True,
                "symptoms": ["Headache", "Blurred vision", "Bleeding", "Sleepy"],
                "date_taken": 868545,
                "last_edited": 868545,
            }
        }
    )


class CreateReadingRequest(ReadingBase):
    assessment: Optional[CreateAssessmentRequest] = None
    referral: Optional[CreateReferralRequest] = None


class ReadingResponse(ReadingBase):
    user_id: Optional[int] = None
    assessment: Optional[AssessmentResponse] = None
    referral: Optional[ReferralResponse] = None


class ReadingList(RootModel[list[ReadingResponse]]):
    pass


class UrineTestModel(CradleBaseModel):
    leukocytes: str
    nitrites: str
    glucose: str
    protein: str
    blood: str


class CreateReadingWithUrineTestRequest(CreateReadingRequest):
    urine_tests: Optional[UrineTestModel] = None


class ReadingWithUrineTestResponse(ReadingResponse):
    urine_tests: Optional[UrineTestModel] = None


class ReadingWithUrineTestList(RootModel[list[ReadingWithUrineTestResponse]]):
    pass


class ColorReadingStats(CradleBaseModel):
    GREEN: int
    YELLOW_DOWN: int
    YELLOW_UP: int
    RED_DOWN: int
    RED_UP: int
