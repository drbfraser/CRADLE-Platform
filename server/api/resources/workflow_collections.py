from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import crud, marshal
from models import WorkflowCollectionOrm
from validation import CradleBaseModel
from validation.workflow_classifications import WorkflowClassificationModel
from validation.workflow_collections import (
    WorkflowCollectionModel,
    WorkflowCollectionUploadModel,
)


# Response model for a list of workflow collections
class WorkflowCollectionListResponse(CradleBaseModel):
    items: List[WorkflowCollectionModel]


# Response model for a list of workflow classifications
class WorkflowClassificationListResponse(CradleBaseModel):
    items: List[WorkflowClassificationModel]


api_workflow_collections = APIBlueprint(
    name="workflow_collections",
    import_name=__name__,
    url_prefix="/workflow/collections",
    abp_tags=[Tag(name="Workflow Collections", description="")],
    abp_security=[{"jwt": []}],
)


workflow_collection_not_found_message = (
    "Workflow classification with ID: ({}) not found."
)


def check_if_existing_workflow_collection_exists(
    workflow_collection_dict: dict,
) -> None:
    existing_workflow_collection = crud.read(
        WorkflowCollectionOrm, id=workflow_collection_dict["id"]
    )

    if existing_workflow_collection is not None:
        return abort(
            code=409,
            description=f"Workflow collection with ID '{workflow_collection_dict['id']}' already exists.",
        )

    existing_workflow_collection = crud.read(
        WorkflowCollectionModel, name=workflow_collection_dict["name"]
    )

    if existing_workflow_collection is not None:
        return abort(
            code=409,
            description=f"Workflow collection with name '{workflow_collection_dict['name']}' already exists.",
        )


# /api/workflow/classifications/ [POST]
@api_workflow_collections.post("", responses={201, WorkflowCollectionModel})
def create_workflow_collection(body: WorkflowCollectionUploadModel):
    """Create a new workflow collection"""
    workflow_collection_dict = body.model_dump()

    assign_workflow_template_or_instance_ids(workflow_collection_dict)

    check_if_existing_workflow_collection_exists(workflow_collection_dict)

    workflow_collection_orm = marshal.unmarshal(
        WorkflowCollectionModel, workflow_collection_dict
    )

    crud.create(WorkflowCollectionOrm, workflow_collection_orm)

    return marshal.marshal(obj=workflow_collection_orm), 201
