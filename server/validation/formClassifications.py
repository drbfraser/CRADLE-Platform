from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class FormClassification(BaseModel):
    name: str
    id: Optional[str] = None

    class Config:
        extra = "forbid"


def validate_template(request_body: dict):
    """
    Returns an error message if the classification part in /api/forms/classifications POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        FormClassification(**request_body)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None
