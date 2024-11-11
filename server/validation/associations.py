from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class AssociationValidator(BaseModel):
    patientId: int
    healthFacilityName: Optional[str] = None
    userId: Optional[int] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/associations post request
        is not valid.
        :param request_body: The request body as a dict object
                            {
                                "patientId": 47, - required
                                "healthFacilityName": "H0000",
                                "userId": 1,
                            }
        """
        try:
            AssociationValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(e.errors()[0]["msg"])
