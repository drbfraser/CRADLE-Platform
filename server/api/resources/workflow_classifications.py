import json

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data  # Used later for crud, marshal, etc. (also remember models)
from common import user_utils
from common.api_utils import (
    WorkflowClassificationIdPath,
)

from validation.workflow_classifications import (
    WorkflowClassificationExamples,
    WorkflowClassificationModel,
)

from typing import List
from validation import CradleBaseModel


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


# /api/workflow/classifications [POST]
@api_workflow_classifications.post("", responses={201: WorkflowClassificationModel})
def create_workflow_classification(body: WorkflowClassificationModel):
    """Create Workflow Classification"""
    # For now, return the example data
    return WorkflowClassificationExamples.example_01, 201


# /api/workflow/classifications [GET]
@api_workflow_classifications.get(
    "", responses={200: WorkflowClassificationListResponse}
)
def get_workflow_classifications():
    """Get All Workflow Classifications"""
    # For now, return list with example data wrapped in the response model
    return {"items": [WorkflowClassificationExamples.example_01]}, 200


# /api/workflow/classifications/<string:classification_id> [GET]
@api_workflow_classifications.get(
    "/<string:classification_id>", responses={200: WorkflowClassificationModel}
)
def get_workflow_classification(path: WorkflowClassificationIdPath):
    """Get Workflow Classification"""
    # For now, return the example data if ID matches
    if path.classification_id == WorkflowClassificationExamples.id:
        return WorkflowClassificationExamples.example_01, 200
    else:
        return abort(
            404,
            description=f"No workflow classification with ID: {path.classification_id}.",
        )


# /api/workflow/classifications/<string:classification_id> [PUT]
@api_workflow_classifications.put(
    "/<string:classification_id>", responses={200: WorkflowClassificationModel}
)
def update_workflow_classification(
    path: WorkflowClassificationIdPath, body: WorkflowClassificationModel
):
    """Update Workflow Classification"""
    # For now, return the updated body data if ID matches
    if path.classification_id == WorkflowClassificationExamples.id:
        updated_data = body.model_dump()
        updated_data["id"] = path.classification_id
        return updated_data, 200
    else:
        return abort(
            404,
            description=f"No workflow classification with ID: {path.classification_id}.",
        )


# /api/workflow/classifications/<string:classification_id> [DELETE]
@api_workflow_classifications.delete(
    "/<string:classification_id>", responses={204: None}
)
def delete_workflow_classification(path: WorkflowClassificationIdPath):
    """Delete Workflow Classification"""
    # For now, return success if ID matches
    if path.classification_id == WorkflowClassificationExamples.id:
        return "", 204
    else:
        return abort(
            404,
            description=f"No workflow classification with ID: {path.classification_id}.",
        )
