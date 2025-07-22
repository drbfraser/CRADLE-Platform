import json
from json import JSONDecodeError
from validation import CradleBaseModel
from typing import Optional

from pydantic import field_validator

class WorkflowEvaluateExamples(CradleBaseModel):
    id = "workflow-evaluate-example-1"
    example_01 = {
        "result":{
            "value": True,
            "details": "test" # we probably won't need this?
        }
    }
    
class WorkflowEvaluateResponseModel(CradleBaseModel):
    result: bool
    detail: Optional[str]

class WorkflowEvaluateRequestModel(CradleBaseModel):
    id: str
    input_data: dict

    @field_validator("id",mode="before")
    def validate_id(cls, id: str) -> str:
        if id == "":
            raise ValueError("missing id")
        return id

    @field_validator("data", mode="before")
    def validate_data(cls, data: str) -> dict:
        try:
            obj = json.loads(data)
        except JSONDecodeError as e:
            raise JSONDecodeError("data is not a json string")
        return obj