from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class AssociationValidator(BaseModel):
    patient_id: int
    health_facility_name: Optional[str] = None
    user_id: Optional[int] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/associations post request is not valid.
        :param request_body: The request body as a dict object
                            {
                                "patient_id": 47, - required
                                "health_facility_name": "H0000",
                                "user_id": 1,
                            }
        """
        try:
            return AssociationValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(e.errors()[0]["msg"])
