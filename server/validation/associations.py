from typing import Optional

from validation import CradleBaseModel


class PatientAssociationModel(CradleBaseModel):
    patient_id: int
    health_facility_name: Optional[str] = None
    user_id: Optional[int] = None

    model_config = dict(
        openapi_extras={
            "example": {
                "patient_id": 47,
                "health_facility_name": "H0000",
                "user_id": 1,
            }
        }
    )
