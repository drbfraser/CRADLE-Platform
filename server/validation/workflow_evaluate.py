import json
from json import JSONDecodeError
from typing import Optional

from pydantic import field_validator

from validation import CradleBaseModel


class WorkflowEvaluateExamples(CradleBaseModel):
    id = "workflow-evaluate-example-1"
    example_01 = {
        "result": {
            "value": True,
            "details": "test",  # we probably won't need this?
        }
    }


class WorkflowEvaluateResponseModel(CradleBaseModel):
    result: bool
    detail: Optional[str]


class WorkflowEvaluateRequestModel(CradleBaseModel):
    id: str
    input_data: dict

    @field_validator("id", mode="before")
    def validate_id(self, id: str) -> str:
        if id == "":
            raise ValueError("missing id")
        return id

    @field_validator("data", mode="before")
    def validate_data(self, data: str) -> dict:
        try:
            obj = json.loads(data)
        except JSONDecodeError as e:
            raise JSONDecodeError(e)
        return obj
