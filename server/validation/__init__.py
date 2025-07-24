from pydantic import AliasChoices, AliasGenerator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel, to_snake


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
        # Alias generator will create aliases for all field names. The
        # validation_alias will allow our Pydantic models to accept data where
        # the field names are in either snake case or camel case.
        # The serialization_alias will allow our Pydantic models to be
        # serialized to camel case.
        alias_generator=AliasGenerator(
            validation_alias=lambda field_name: AliasChoices(
                to_snake(field_name), to_camel(field_name)
            ),
            serialization_alias=to_camel,
        ),
        from_attributes=True,  # Allows us to instantiate Pydantic models from our ORM models.
    )

    @classmethod
    def validate_subset_of_attributes(cls, attributes: dict):
        """
        Validates a subset of attributes for a Pydantic model and raises a validation error if any
        attribute in the subset has an invalid value or contains extra attributes

        :param cls: The Pydantic model to validate attributes to
        :param attributes: The attributes to validate
        """
        return cls.model_validate(attributes)
