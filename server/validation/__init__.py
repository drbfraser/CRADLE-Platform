from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CradleBaseModel(BaseModel):
    """
    Pydantic Base Model to define shared logic and configuration.
    All of our Pydantic Models should inherit from this instead of `BaseModel`.
    """

    # Common configs shared by all of our Pydantic models.
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True,
        validate_default=True,
        alias_generator=to_camel,  # Will allow Pydantic models to accept data in camel case. Internal fields will still be snake case. Will also allow serialization to camel case.
    )
