from typing import Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from validation import CradleBaseModel


class WorkflowCollectionExamples:
    id = "workflow-collection-example-01"
    name = "Facility H10000 Workflows"

    example_01 = {"id": id, "name": name}


class WorkflowCollectionModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self


class WorkflowCollectionUploadModel(WorkflowCollectionModel):
    id: Optional[str] = None
