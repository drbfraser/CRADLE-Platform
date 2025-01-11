from typing import Optional

from validation import CradleBaseModel


class FormClassificationModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str

    model_config = dict(
        openapi_extra={
            "example": {
                "id": "dc9",
                "name": "Personal Intake Form",
            }
        }
    )


class FormClassificationModelOptionalId(FormClassificationModel):
    id: Optional[str] = None

    model_config = dict(
        openapi_extra={
            "example": {
                "name": "Some Form",
            }
        }
    )
