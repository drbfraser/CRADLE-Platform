from typing import Optional

from validation import CradleBaseModel


class FormClassificationValidator(CradleBaseModel, extra="forbid"):
    name: str
    id: Optional[str] = None
