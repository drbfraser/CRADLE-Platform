from typing import Optional

from validation import CradleBaseModel


class PatientAssociationModel(CradleBaseModel):
    """
    {
        "patient_id": 47, - required
        "health_facility_name": "H0000",
        "user_id": 1,
    }
    """

    patient_id: int
    health_facility_name: Optional[str] = None
    user_id: Optional[int] = None
