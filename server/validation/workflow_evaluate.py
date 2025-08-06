import json
from json import JSONDecodeError

from pydantic import field_validator

from validation import CradleBaseModel


class WorkflowEvaluateExamples:
    id = "workflow-evaluate-example-1"
    example_01 = {
        "result": {
            "value": True,
            "details": "test",
        }
    }


class WorkflowEvaluateResponseModel(CradleBaseModel):
    result: dict

class WorkflowEvaluateRequestModel(CradleBaseModel):
    id: str
    input_data: dict

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, id: str) -> str:
        if id == "":
            raise ValueError("missing id")
        return id

    @field_validator("input_data", mode="before")
    @classmethod
    def validate_data(cls, input_data: str) -> dict:
        try:
            obj = json.loads(input_data)
        except JSONDecodeError as e:
            raise JSONDecodeError(e)
        return obj
