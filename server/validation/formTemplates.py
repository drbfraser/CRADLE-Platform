from typing import List, Optional

from pydantic import BaseModel, ValidationError

from validation.questions import TemplateQuestionValidator
from validation.validation_exception import ValidationExceptionError


class ClassificationValidator(BaseModel):
    name: str
    id: Optional[str] = None


class FormTemplateValidator(BaseModel, extra="forbid"):
    classification: ClassificationValidator
    version: str
    questions: List[TemplateQuestionValidator]
    id: Optional[str] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the template part in /api/forms/templates POST or PUT
        request is not valid.

        :param request_body: The request body as a dict object
        """
        try:
            return FormTemplateValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
