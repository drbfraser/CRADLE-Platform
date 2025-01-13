from typing import Optional

from pydantic import Field, RootModel

from enums import FacilityTypeEnum
from validation import CradleBaseModel
from validation.phone_numbers import PhoneNumberE164


class HealthFacilityExamples:
    names = ["H1221", "H2345"]
    phone_numbers = ["+16047152845", "+16048952872"]
    abouts = ["This is a description.", "This is another description."]
    types = [FacilityTypeEnum.HOSPITAL, FacilityTypeEnum.HCF_2]
    locations = ["KAMPALA", "KIRA"]
    new_referrals = 1551447833

    without_new_referrals_01 = {
        "name": names[0],
        "phone_number": phone_numbers[0],
        "about": abouts[0],
        "type": types[0],
        "location": locations[0],
    }
    without_new_referrals_02 = {
        "name": names[1],
        "phone_number": phone_numbers[1],
        "about": abouts[1],
        "type": types[1],
        "location": locations[1],
    }
    with_new_referrals_01 = dict(without_new_referrals_01)
    with_new_referrals_01["new_referrals"] = new_referrals
    with_new_referrals_02 = dict(without_new_referrals_02)
    with_new_referrals_02["new_referrals"] = new_referrals


# Define a Pydantic model for incoming requests
class HealthFacilityModel(CradleBaseModel):
    name: str
    phone_number: Optional[PhoneNumberE164] = None
    location: str
    about: str = ""
    type: FacilityTypeEnum
    new_referrals: Optional[int] = Field(
        None, description="Timestamp of most recent referral to this facility."
    )

    model_config = dict(
        openapi_extra={
            "description": "A HealthFacility object",
            "example": HealthFacilityExamples.without_new_referrals_01,
        }
    )


class HealthFacilityListResponse(RootModel[list[HealthFacilityModel]]):
    model_config = dict(
        openapi_extra={
            "description": "An array of HealthFacility objects.",
            "example": [
                HealthFacilityExamples.with_new_referrals_01,
                HealthFacilityExamples.with_new_referrals_02,
            ],
        }
    )  # type: ignore[reportAssignmentType]


class HealthFacilityNameListResponse(RootModel[list[str]]):
    model_config = dict(
        openapi_extra={
            "description": "An array containing names of HealthFacility objects.",
            "example": HealthFacilityExamples.names,
        }
    )  # type: ignore[reportAssignmentType]


class HealthFacilityNewReferrals(CradleBaseModel):
    new_referrals: Optional[int] = None
    model_config = dict(
        openapi_extra={
            "description": "An object containing a timestamp of the most recent referral to the HealthFacility.",
            "example": {"new_referrals": HealthFacilityExamples.new_referrals},
        }
    )
