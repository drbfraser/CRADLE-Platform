from typing import Any

from humps import decamelize
from pydantic import BaseModel, model_validator


class CradleBaseModel(BaseModel):
    """
    Pydantic Base Model that converts input data to be in snake case.
    All of our Pydantic Models should inherit from this instead of `BaseModel`.
    """

    @model_validator(mode="before")
    @classmethod
    def convert_to_snake_case(cls, data: Any):
        if isinstance(data, (list, dict, str)):
            return decamelize(data)
        return data
