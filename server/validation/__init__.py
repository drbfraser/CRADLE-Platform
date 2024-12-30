from typing import Any

from humps import decamelize
from pydantic import BaseModel, ConfigDict, model_validator


class CradleBaseModel(BaseModel):
    """
    Pydantic Base Model to define shared logic and configuration.
    All of our Pydantic Models should inherit from this instead of `BaseModel`.
    """

    # Common configs shared by all of our Pydantic models.
    model_config = ConfigDict(validate_assignment=True, use_enum_values=True)

    # Convert input data to be in snake case.
    @model_validator(mode="before")
    @classmethod
    def convert_to_snake_case(cls, data: Any):
        if isinstance(data, (list, dict, str)):
            return decamelize(data)
        return data
