from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class FormClassificationValidator(BaseModel):
    name: str
    id: Optional[str] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the classification part in /api/forms/classifications POST or PUT
        request is not valid.

        :param request_body: The request body as a dict object
        """
        try:
            return FormClassificationValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
