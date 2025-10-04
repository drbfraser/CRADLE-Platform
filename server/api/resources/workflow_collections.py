from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import roles_required
from common.api_utils import WorkflowCollectionIdPath, convert_query_parameter_to_bool
from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import marshal
from enums import RoleEnum
from models import WorkflowCollectionOrm
from validation import CradleBaseModel
from validation.workflow_models import (
    WorkflowClassificationModel,
    WorkflowCollectionModel,
)
from validation.workflow_api_models import WorkflowCollectionUploadModel


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


workflow_collection_not_found_message = "Workflow collection with ID: ({}) not found."


def check_if_existing_workflow_collection_exists(
    workflow_collection_dict: dict,
) -> None:
    """
    Checks the DB to verify if any other existing workflow collection has the same ID or name, throws an error if
    one does exist.

    :param workflow_collection_dict: A dictionary representing a workflow collection
    """
    existing_workflow_collection = crud.read(
        WorkflowCollectionOrm, id=workflow_collection_dict["id"]
    )

    if existing_workflow_collection is not None:
        return abort(
            code=409,
            description=f"Workflow collection with ID '{workflow_collection_dict['id']}' already exists.",
        )

    existing_workflow_collection = crud.read(
        WorkflowCollectionOrm, name=workflow_collection_dict["name"]
    )

    if existing_workflow_collection is not None:
        return abort(
            code=409,
            description=f"Workflow collection with name '{workflow_collection_dict['name']}' already exists.",
        )


def get_workflow_collection_from_db(collection_id: str) -> WorkflowCollectionOrm:
    workflow_collection = crud.read(WorkflowCollectionOrm, id=collection_id)

    if workflow_collection is None:
        return abort(
            code=404,
            description=workflow_collection_not_found_message.format(collection_id),
        )

    return workflow_collection


def check_if_workflow_collection_exists(collection_id: str) -> None:
    workflow_collection = crud.read(WorkflowCollectionOrm, id=collection_id)

    if workflow_collection is None:
        return abort(
            code=404,
            description=workflow_collection_not_found_message.format(collection_id),
        )


# /api/workflow/collections [POST]
@api_workflow_collections.post("", responses={201: WorkflowCollectionModel})
@roles_required([RoleEnum.ADMIN])
def create_workflow_collection(body: WorkflowCollectionUploadModel):
    """Create a new workflow collection"""
    workflow_collection_dict = body.model_dump()

    assign_workflow_template_or_instance_ids(
        WorkflowCollectionOrm, workflow_collection_dict
    )

    check_if_existing_workflow_collection_exists(workflow_collection_dict)

    workflow_collection_orm = marshal.unmarshal(
        WorkflowCollectionOrm, workflow_collection_dict
    )

    crud.create(model=workflow_collection_orm, refresh=True)

    return marshal.marshal(obj=workflow_collection_orm, shallow=True), 201


# /api/workflow/collections [GET]
@api_workflow_collections.get("", responses={200: WorkflowCollectionListResponse})
def get_workflow_collections():
    """Get all workflow collections"""
    data = crud.read_all(WorkflowCollectionModel)

    workflow_collections = [marshal.marshal(collection) for collection in data]

    return {"items": workflow_collections}, 200


# api/workflow/collections/<string:workflow_collection_id>?with_workflows=<bool> [GET]
@api_workflow_collections.get(
    "/<string:workflow_collection_id>", responses={200: WorkflowCollectionModel}
)
def get_workflow_collection(path: WorkflowCollectionIdPath):
    """
    Get a workflow collection by its ID

    If the with_workflows parameter is set to True, the workflow collection will be returned with all workflow
    classifications assigned to it. The idea is that users can then choose exactly which templates given by a
    specific classification they want via the other API calls, instead of being given every single workflow template
    all at once.
    """
    with_workflows = request.args.get("with_workflows", default=False)
    with_workflows = convert_query_parameter_to_bool(with_workflows)

    workflow_collection = get_workflow_collection_from_db(path.workflow_collection_id)

    if with_workflows:
        workflow_collection = marshal.marshal(workflow_collection, shallow=False)
    else:
        workflow_collection = marshal.marshal(workflow_collection, shallow=True)
    return workflow_collection, 200


# api/workflow/collections/<string:workflow_collection_id> [PUT]
@api_workflow_collections.put(
    "/<string:workflow_collection_id>", responses={200: WorkflowCollectionModel}
)
def update_workflow_collection(
    path: WorkflowCollectionIdPath, body: WorkflowCollectionModel
):
    workflow_collection_changes = body.model_dump()

    check_if_workflow_collection_exists(path.workflow_collection_id)

    crud.update(
        WorkflowCollectionOrm,
        changes=workflow_collection_changes,
        id=path.workflow_collection_id,
    )

    response_data = crud.read(WorkflowCollectionOrm, id=path.workflow_collection_id)
    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# api/workflow/collections/<string:workflow_collection_id> [DELETE]
@api_workflow_collections.delete(
    "/<string:workflow_collection_id>", responses={204: None}
)
def delete_workflow_collection(path: WorkflowCollectionIdPath):
    """Delete a workflow collection"""
    check_if_workflow_collection_exists(path.workflow_collection_id)

    crud.delete_by(WorkflowCollectionOrm, id=path.workflow_collection_id)

    return "", 204
