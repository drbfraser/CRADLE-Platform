from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import workflow_utils_v2
from common.api_utils import (
    WorkflowClassificationIdPath,
)
from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import orm_serializer
from models import WorkflowClassificationOrm
from validation import CradleBaseModel
from validation.workflow_api_models import (
    GetWorkflowClassificationsQuery,
    WorkflowClassificationPatchModel,
    WorkflowClassificationUploadModel,
)
from validation.workflow_models import WorkflowClassificationModel


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

    # Handle multi-lang name
    try:
        workflow_utils_v2.handle_classification_name(
            workflow_classification_dict)
    except ValueError as e:
        return abort(code=400, description=str(e))

    # Check if classification with same name already exists
    # For now, we only check English name if provided as string or in dict
    # This check is a bit complex with MultiLang.
    # We can skip strict unique name check for now or check against English.

    # Check if classification with same ID already exists
    existing_classification_by_id = crud.read(
        WorkflowClassificationOrm, id=workflow_classification_dict["id"]
    )
    if existing_classification_by_id is not None:
        return abort(
            code=409,
            description=f"Workflow classification with ID '{workflow_classification_dict['id']}' already exists.",
        )

    # Prepare for ORM - remove 'name' as it's not in ORM (only name_string_id)
    if "name" in workflow_classification_dict:
        del workflow_classification_dict["name"]

    workflow_classification_orm = orm_serializer.unmarshal(
        WorkflowClassificationOrm, workflow_classification_dict
    )

    crud.create(model=workflow_classification_orm, refresh=True)

    response_data = orm_serializer.marshal(
        obj=workflow_classification_orm, shallow=True)
    response_data["name"] = workflow_utils_v2.resolve_name(
        workflow_classification_orm.name_string_id
    )

    return response_data, 201


# /api/workflow/classifications [GET]
@api_workflow_classifications.get(
    "", responses={200: WorkflowClassificationListResponse}
)
def get_workflow_classifications(query: GetWorkflowClassificationsQuery):
    """Get All Workflow Classifications"""
    workflow_classifications = crud.read_workflow_classifications()

    response_data = []
    for classification in workflow_classifications:
        data = orm_serializer.marshal(classification, shallow=True)
        data["name"] = workflow_utils_v2.resolve_name(
            classification.name_string_id, query.lang
        )
        response_data.append(data)

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

    lang = request.args.get("lang", default="English")
    response_data = orm_serializer.marshal(
        obj=workflow_classification, shallow=True)
    response_data["name"] = workflow_utils_v2.resolve_name(
        workflow_classification.name_string_id, lang
    )

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

    # Handle name update
    if workflow_classification_changes.get("name"):
        workflow_classification_changes["name_string_id"] = workflow_classification.name_string_id
        workflow_utils_v2.handle_classification_name(
            workflow_classification_changes, new_classification=False)
        del workflow_classification_changes["name"]

    crud.update(
        WorkflowClassificationOrm,
        changes=workflow_classification_changes,
        id=path.workflow_classification_id,
    )

    response_data = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )
    response_data = orm_serializer.marshal(response_data, shallow=True)
    response_data["name"] = workflow_utils_v2.resolve_name(
        workflow_classification.name_string_id
    )

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
        response_data = orm_serializer.marshal(
            obj=workflow_classification, shallow=True
        )
        response_data["name"] = workflow_utils_v2.resolve_name(
            workflow_classification.name_string_id
        )
        return response_data, 200

    if workflow_classification_changes.get("name"):
        workflow_classification_changes["name_string_id"] = workflow_classification.name_string_id
        workflow_utils_v2.handle_classification_name(
            workflow_classification_changes, new_classification=False)
        del workflow_classification_changes["name"]

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
    response_data = orm_serializer.marshal(response_data, shallow=True)
    response_data["name"] = workflow_utils_v2.resolve_name(
        workflow_classification.name_string_id
    )

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
