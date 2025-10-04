from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import (
    WorkflowClassificationIdPath,
)
from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import marshal
from models import WorkflowClassificationOrm
from validation import CradleBaseModel
from validation.workflow_models import WorkflowClassificationModel
from validation.workflow_api_models import (
    WorkflowClassificationPatchModel,
    WorkflowClassificationUploadModel,
)


# Create a response model for the list endpoint
class WorkflowClassificationListResponse(CradleBaseModel):
    items: List[WorkflowClassificationModel]


# /api/workflow/classifications
api_workflow_classifications = APIBlueprint(
    name="workflow_classifications",
    import_name=__name__,
    url_prefix="/workflow/classifications",
    abp_tags=[Tag(name="Workflow Classifications", description="")],
    abp_security=[{"jwt": []}],
)

workflow_classification_not_found_message = (
    "Workflow classification with ID: ({}) not found."
)


# /api/workflow/classifications [POST]
@api_workflow_classifications.post("", responses={201: WorkflowClassificationModel})
def create_workflow_classification(body: WorkflowClassificationUploadModel):
    """Create Workflow Classification"""
    workflow_classification_dict = body.model_dump()

    # Assign ID
    assign_workflow_template_or_instance_ids(
        WorkflowClassificationOrm, workflow_classification_dict
    )

    # Check if classification with same name already exists
    existing_classification_by_name = crud.read(
        WorkflowClassificationOrm, name=workflow_classification_dict["name"]
    )
    if existing_classification_by_name is not None:
        return abort(
            code=409,
            description=f"Workflow classification with name '{workflow_classification_dict['name']}' already exists.",
        )

    # Check if classification with same ID already exists
    existing_classification_by_id = crud.read(
        WorkflowClassificationOrm, id=workflow_classification_dict["id"]
    )
    if existing_classification_by_id is not None:
        return abort(
            code=409,
            description=f"Workflow classification with ID '{workflow_classification_dict['id']}' already exists.",
        )

    workflow_classification_orm = marshal.unmarshal(
        WorkflowClassificationOrm, workflow_classification_dict
    )

    crud.create(model=workflow_classification_orm, refresh=True)

    return marshal.marshal(obj=workflow_classification_orm, shallow=True), 201


# /api/workflow/classifications [GET]
@api_workflow_classifications.get(
    "", responses={200: WorkflowClassificationListResponse}
)
def get_workflow_classifications():
    """Get All Workflow Classifications"""
    workflow_classifications = crud.read_workflow_classifications()

    response_data = [
        marshal.marshal(classification, shallow=True)
        for classification in workflow_classifications
    ]

    return {"items": response_data}, 200


# /api/workflow/classifications/<string:workflow_classification_id> [GET]
@api_workflow_classifications.get(
    "/<string:workflow_classification_id>", responses={200: WorkflowClassificationModel}
)
def get_workflow_classification(path: WorkflowClassificationIdPath):
    """Get Workflow Classification"""
    workflow_classification = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )

    if workflow_classification is None:
        return abort(
            code=404,
            description=workflow_classification_not_found_message.format(
                path.workflow_classification_id
            ),
        )

    response_data = marshal.marshal(obj=workflow_classification, shallow=True)

    return response_data, 200


# /api/workflow/classifications/<string:workflow_classification_id> [PUT]
@api_workflow_classifications.put(
    "/<string:workflow_classification_id>", responses={200: WorkflowClassificationModel}
)
def update_workflow_classification(
    path: WorkflowClassificationIdPath, body: WorkflowClassificationModel
):
    """Update Workflow Classification"""
    workflow_classification = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )

    if workflow_classification is None:
        return abort(
            code=404,
            description=workflow_classification_not_found_message.format(
                path.workflow_classification_id
            ),
        )

    workflow_classification_changes = body.model_dump()

    # Check if another classification with the same name already exists (excluding current one)
    existing_classification_by_name = crud.read(
        WorkflowClassificationOrm, name=workflow_classification_changes["name"]
    )
    if (
        existing_classification_by_name is not None
        and existing_classification_by_name.id != path.workflow_classification_id
    ):
        return abort(
            code=409,
            description=f"Workflow classification with name '{workflow_classification_changes['name']}' already exists.",
        )

    crud.update(
        WorkflowClassificationOrm,
        changes=workflow_classification_changes,
        id=path.workflow_classification_id,
    )

    response_data = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )
    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/classifications/<string:workflow_classification_id> [PATCH]
@api_workflow_classifications.patch(
    "/<string:workflow_classification_id>", responses={200: WorkflowClassificationModel}
)
def patch_workflow_classification(
    path: WorkflowClassificationIdPath, body: WorkflowClassificationPatchModel
):
    """Partially (PATCH) Update Workflow Classification"""
    workflow_classification = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )

    if workflow_classification is None:
        return abort(
            code=404,
            description=workflow_classification_not_found_message.format(
                path.workflow_classification_id
            ),
        )

    # Get only the fields that were provided (exclude None values)
    workflow_classification_changes = body.model_dump(exclude_none=True)

    # If no changes provided, return the current resource
    if not workflow_classification_changes:
        response_data = marshal.marshal(obj=workflow_classification, shallow=True)
        return response_data, 200

    # Rules here to check for duplicate names/ids?

    # Apply the partial update
    crud.update(
        WorkflowClassificationOrm,
        changes=workflow_classification_changes,
        id=path.workflow_classification_id,
    )

    # Return the updated classification
    response_data = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )
    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/classifications/<string:workflow_classification_id> [DELETE]
@api_workflow_classifications.delete(
    "/<string:workflow_classification_id>", responses={204: None}
)
def delete_workflow_classification(path: WorkflowClassificationIdPath):
    """Delete Workflow Classification"""
    workflow_classification = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )

    if workflow_classification is None:
        return abort(
            code=404,
            description=workflow_classification_not_found_message.format(
                path.workflow_classification_id
            ),
        )

    crud.delete_workflow_classification(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )

    return "", 204
