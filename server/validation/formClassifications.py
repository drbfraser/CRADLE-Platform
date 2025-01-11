from typing import Optional

from validation import CradleBaseModel


class FormClassificationModel(CradleBaseModel, extra="forbid"):
    name: str
    id: Optional[str] = None
