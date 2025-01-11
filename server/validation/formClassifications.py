from typing import Optional

from validation import CradleBaseModel


class FormClassificationExamples:
    id = "dc9"
    name = "Personal Intake Form"

    example_01 = {"id": id, "name": name}


class FormClassificationModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str

    model_config = dict(
        openapi_extra={"example": FormClassificationExamples.example_01}
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
