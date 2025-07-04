from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import roles_required
from common.api_utils import (
    WorkflowTemplateIdPath,
    get_user_id,
)
from common.commonUtil import get_current_time
from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import crud, marshal
from enums import RoleEnum
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.workflow_templates import WorkflowTemplateModel


# Create a response model for the list endpoints
class WorkflowTemplateListResponse(CradleBaseModel):
    items: List[WorkflowTemplateModel]


# /api/workflow/templates
api_workflow_templates = APIBlueprint(
    name="workflow_templates",
    import_name=__name__,
    url_prefix="/workflow/templates",
    abp_tags=[Tag(name="Workflow Templates", description="")],
    abp_security=[{"jwt": []}],
)

workflow_template_not_found_message = "Workflow template with ID: ({}) not found."


def find_and_archive_previous_workflow_template(
    workflow_classification_id: str, last_edited_by: str
) -> None:
    previous_template = crud.read(
        WorkflowTemplateOrm,
        classification_id=workflow_classification_id,
        archived=False,
    )
    if previous_template:
        # Update the existing template
        changes = {
            "archived": True,
            "last_edited": get_current_time(),
            "last_edited_by": last_edited_by,
        }
        crud.update(
            m=WorkflowTemplateOrm,
            changes=changes,
            id=previous_template.id,
            classification_id=workflow_classification_id,
        )


# /api/workflow/templates [POST]
@api_workflow_templates.post("", responses={201: WorkflowTemplateModel})
@roles_required([RoleEnum.ADMIN])
def create_workflow_template(body: WorkflowTemplateModel):
    """
    Upload a Workflow Template
    """
    workflow_template_dict = body.model_dump()

    # Get ID of user
    try:
        user_id = get_user_id(workflow_template_dict, "last_edited_by")
        workflow_template_dict["last_edited_by"] = user_id

    except ValueError:
        return abort(code=404, description="User not found")

    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=workflow_template_dict
    )

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    # Find workflow classification in DB, if it exists
    workflow_classification_orm = None
    workflow_classification_orm = crud.read(
        WorkflowClassificationOrm, id=workflow_template_dict["classification_id"]
    )

    # If the workflow classification does not exist and the request has no classification, throw an error
    if (
        workflow_classification_orm is None
        and workflow_classification_dict is None
        and workflow_template_dict["classification_id"] is not None
    ):
        return abort(code=404, description="Classification not found")

    if workflow_classification_orm is None and workflow_classification_dict is not None:
        # If this workflow classification is completely new, then it will be added to the DB
        workflow_classification_orm = marshal.unmarshal(
            WorkflowClassificationOrm, workflow_classification_dict
        )

    elif workflow_classification_orm is not None:
        # Check if this template version already exists
        existing_template_version = crud.read(
            WorkflowTemplateOrm,
            classification_id=workflow_classification_orm.id,
            version=workflow_template_dict["version"],
        )

        if existing_template_version is not None:
            return abort(
                code=409,
                description="Workflow template with same version still exists - Change version before upload",
            )

        # Check if a previously existing version of this template exists, if it does, archive it
        find_and_archive_previous_workflow_template(
            workflow_classification_orm.id, workflow_template_dict["last_edited_by"]
        )

        workflow_template_dict["classification_id"] = workflow_classification_orm.id

    workflow_template_orm = marshal.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )

    workflow_template_orm.classification = workflow_classification_orm

    crud.create(model=workflow_template_orm, refresh=True)

    return marshal.marshal(obj=workflow_template_orm, shallow=True), 201


# /api/workflow/templates?classification_id=<str>&archived=<bool> [GET]
@api_workflow_templates.get("", responses={200: WorkflowTemplateListResponse})
def get_workflow_templates():
    """Get All Workflow Templates"""
    # Get query parameters
    workflow_classification_id = request.args.get(
        "classification_id", default=None, type=str
    )
    is_archived = request.args.get("archived", default=False, type=bool)

    workflow_templates = crud.read_workflow_templates(
        workflow_classification_id=workflow_classification_id,
        is_archived=is_archived,
    )

    response_data = [marshal.marshal(template) for template in workflow_templates]

    return {"items": response_data}, 200


# /api/workflow/templates/<string:template_id>?with_steps=<bool>&with_classification=<bool> [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def get_workflow_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template"""
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False, type=bool)
    with_classification = request.args.get(
        "with_classification", default=False, type=bool
    )

    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    response_data = marshal.marshal(obj=workflow_template, shallow=with_steps)

    if not with_classification:
        del response_data["classification"]

    return response_data, 200


# /api/workflow/templates/<string:template_id> [PUT]
@api_workflow_templates.put(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def update_workflow_template(path: WorkflowTemplateIdPath, body: WorkflowTemplateModel):
    """Update Workflow Template"""
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    workflow_template_changes = body.model_dump()

    # Get ID of the user who's updating this template
    try:
        user_id = get_user_id(workflow_template_changes, "last_edited_by")
        workflow_template_changes["last_edited_by"] = user_id
        workflow_template_changes["last_edited"] = get_current_time()

    except ValueError:
        return abort(code=404, description="User not found")

    crud.update(
        WorkflowTemplateOrm, changes=workflow_template_changes, id=path.template_id
    )

    response_data = crud.read(WorkflowTemplateOrm, id=path.template_id)

    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/templates/<string:template_id> [DELETE]
@api_workflow_templates.delete("/<string:workflow_template_id>", responses={204: None})
def delete_workflow_template(path: WorkflowTemplateIdPath):
    """Delete Workflow Template"""
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    crud.delete_workflow(WorkflowTemplateOrm, id=path.template_id)

    return None, 204
