from typing import Optional

from validation import CradleBaseModel


class WorkflowClassificationExamples:
    id = "workflow-classification-example-01"
    name = "PAPAGAIO Research Study"

    example_01 = {"id": id, "name": name}


class WorkflowClassificationModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str


class WorkflowClassificationUploadModel(WorkflowClassificationModel):
    id: Optional[str] = None


class WorkflowClassificationPatchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    name: Optional[str] = None
