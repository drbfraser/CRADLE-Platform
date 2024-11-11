from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class Association(BaseModel):
    patient_id: int
    health_facility_name: Optional[str] = None
    user_id: Optional[int] = None


def validate(request_body: dict):
    """
    Returns an error message if the /api/associations post request
    is not valid. Else, returns None.
    :param request_body: The request body as a dict object
                        {
                            "patient_id": 47, - required
                            "health_facility_name": "H0000",
                            "user_id": 1,
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    try:
        Association(**request_body)
    except ValidationError as e:
        raise ValidationExceptionError(e.errors()[0]["msg"])
