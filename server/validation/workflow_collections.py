from typing import Optional

from validation import CradleBaseModel


class WorkflowCollectionExamples:
    id = "workflow-collection-example-01"
    name = "Facility H10000 Workflows"

    example_01 = {"id": id, "name": name}


class WorkflowCollectionModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str


class WorkflowCollectionUploadModel(WorkflowCollectionModel):
    id: Optional[str] = None
