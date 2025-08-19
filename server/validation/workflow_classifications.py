from typing import Optional

from validation import CradleBaseModel


class WorkflowClassificationExamples:
    id = "workflow-classification-example-01"
    name = "PAPAGAIO Research Study"
    collection_id = None
    example_01 = {"id": id, "name": name, "collection_id": collection_id}


class WorkflowClassificationModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    collection_id: Optional[str] = None


class WorkflowClassificationUploadModel(WorkflowClassificationModel):
    id: Optional[str] = None


class WorkflowClassificationPatchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    name: Optional[str] = None
