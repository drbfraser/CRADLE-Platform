from validation import CradleBaseModel


class CreatePatientAssociationRequest(CradleBaseModel):
    patient_id: str

    model_config = dict(
        openapi_extras={
            "example": {
                "patient_id": "49300028161",
            }
        }
    )
