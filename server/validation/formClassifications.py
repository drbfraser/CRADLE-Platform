from typing import Optional

from pydantic import BaseModel, ValidationError


class FormClassification(BaseModel):
    id: Optional[str] = None
    name: str

    class Config:
        extra = "forbid"


def validate_template(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the classification part in /api/forms/classifications POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """

    try:
        FormClassification(**request_body)
    except ValidationError as e:
        return str(e)
    return None
