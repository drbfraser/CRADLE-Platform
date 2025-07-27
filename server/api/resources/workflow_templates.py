from typing import List, Optional

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import ValidationError

from api.decorator import roles_required
from api.resources.workflow_template_steps import WorkflowTemplateStepListResponse
from common.api_utils import (
    WorkflowTemplateIdPath,
    convert_query_parameter_to_bool,
    get_user_id,
)
from common.commonUtil import get_current_time
from common.workflow_utils import (
    apply_changes_to_model,
    assign_workflow_template_or_instance_ids,
)
from data import crud, db_session, marshal
from enums import RoleEnum
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.workflow_templates import (
    WorkflowTemplateModel,
    WorkflowTemplateUploadModel,
)


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


def get_workflow_classification_from_dict(
    workflow_template_dict: dict, workflow_classification_dict: Optional[dict]
) -> WorkflowClassificationOrm:
    """
    Retrieves or creates a WorkflowClassificationOrm object

    :param workflow_template_dict: Dictionary consisting of attributes for a workflow template that belongs
    to this classification
    :param workflow_classification_dict: Dictionary consisting of attributes for a workflow classification

    :return: A WorkflowClassificationOrm object
    """
    # Find workflow classification in DB, if it exists
    workflow_classification_orm = crud.read(
        WorkflowClassificationOrm, id=workflow_template_dict["classification_id"]
    )

    # If no classification exists but workflow_template_dict references it, throw an error
    if (
        workflow_classification_orm is None
        and workflow_classification_dict is None
        and workflow_template_dict["classification_id"] is not None
    ):
        return abort(code=404, description="Classification not found.")

    if workflow_classification_orm is None and workflow_classification_dict is not None:
        # If this workflow classification is completely new, then it will be returned
        workflow_classification_orm = marshal.unmarshal(
            WorkflowClassificationOrm, workflow_classification_dict
        )

    elif workflow_classification_orm is not None:
        workflow_template_dict["classification_id"] = workflow_classification_orm.id

    return workflow_classification_orm


def check_for_existing_template_version(
    workflow_classification_id: str, workflow_template_dict: dict
) -> None:
    """
    Checks if a workflow template with the same version under the same classification already exists

    :param workflow_classification_id: ID of the workflow classification
    :param workflow_template_dict: Dictionary consisting of attributes for a workflow template
    """
    existing_template_version = crud.read(
        WorkflowTemplateOrm,
        classification_id=workflow_classification_id,
        version=workflow_template_dict["version"],
    )

    if existing_template_version is not None:
        return abort(
            code=409,
            description="Workflow template with same version still exists - Change version before upload.",
        )


# /api/workflow/templates [POST]
@api_workflow_templates.post("", responses={201: WorkflowTemplateModel})
@roles_required([RoleEnum.ADMIN])
def create_workflow_template(body: WorkflowTemplateUploadModel):
    """
    Upload a Workflow Template
    """
    workflow_template_dict = body.model_dump()

    # Get ID of user
    try:
        user_id = get_user_id(workflow_template_dict, "last_edited_by")
        workflow_template_dict["last_edited_by"] = user_id

    except ValueError:
        return abort(code=404, description="User not found.")

    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=workflow_template_dict
    )

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    workflow_template_orm = marshal.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )

    with db_session.no_autoflush:
        workflow_classification_orm = get_workflow_classification_from_dict(
            workflow_template_dict, workflow_classification_dict
        )

        if workflow_classification_orm is not None:
            check_for_existing_template_version(
                workflow_classification_orm.id, workflow_template_dict
            )
            workflow_template_orm.classification = workflow_classification_orm

            # Check if a previously existing version of this template exists, if it does, archive it
            find_and_archive_previous_workflow_template(
                workflow_classification_orm.id, workflow_template_dict["last_edited_by"]
            )

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
    is_archived = request.args.get("archived", default=False)
    is_archived = convert_query_parameter_to_bool(is_archived)

    workflow_templates = crud.read_workflow_templates(
        workflow_classification_id=workflow_classification_id,
        is_archived=is_archived,
    )
    print(f"Workflow Templates: {workflow_templates}")
    response_data = [
        marshal.marshal(template, shallow=True) for template in workflow_templates
    ]

    return {"items": response_data}, 200


# /api/workflow/templates/<string:template_id>?with_steps=<bool>&with_classification=<bool> [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def get_workflow_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template"""
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False)
    with_steps = convert_query_parameter_to_bool(with_steps)
    with_classification = request.args.get("with_classification", default=False)
    with_classification = convert_query_parameter_to_bool(with_classification)

    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    response_data = marshal.marshal(obj=workflow_template, shallow=False)

    if not with_steps:
        del response_data["steps"]
    if not with_classification:
        del response_data["classification"]

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id>/steps [GET]
"""
This is different from api/workflow/templates/<string:template_id>?with_steps=<bool>&with_classification=<bool> [GET]
because that returns a workflow template + steps if desired, whereas this endpoint only returns the steps
"""


@api_workflow_templates.get(
    "<string:workflow_template_id>/steps",
    responses={200: WorkflowTemplateStepListResponse},
)
def get_workflow_template_steps_by_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template Steps by Template ID"""
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    template_steps = crud.read_template_steps(
        workflow_template_id=path.workflow_template_id
    )
    template_steps = [
        marshal.marshal(template_step) for template_step in template_steps
    ]

    return {"items": template_steps}, 200


# /api/workflow/templates/<string:workflow_template_id> [PUT]
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
        return abort(code=404, description="User not found.")

    crud.update(
        WorkflowTemplateOrm,
        changes=workflow_template_changes,
        id=path.workflow_template_id,
    )

    response_data = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id> [PATCH]
@api_workflow_templates.patch(
    "/steps/<string:workflow_template_id>", responses={204: None}
)
def update_workflow_template_patch(path: WorkflowTemplateIdPath, body):
    """
    Update Workflow Template with only specific fields

    Because workflow templates are large objects, this endpoint allows only the necessary attributes to be sent
    from the frontend to the backend, instead of the entire object itself
    """
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    try:
        """
        It is assumed that the changes include a version attribute, since any updates to a template 
        mark a new version of the template itself
        """

        # Get ID of user
        user_id = get_user_id(body, "last_edited_by")
        body["last_edited_by"] = user_id

        # Validate the request body using Pydantic
        WorkflowTemplateModel.validate_subset_of_attributes(attributes=body)

    except ValidationError as e:
        return abort(code=422, description=str(e))

    except ValueError:
        return abort(code=404, description="User not found.")

    # Create an entirely new workflow template with the new attributes
    copy_workflow_template_dict = marshal.marshal(workflow_template)
    assign_workflow_template_or_instance_ids(
        copy_workflow_template_dict, auto_assign_id=True
    )
    new_workflow_template = marshal.unmarshal(copy_workflow_template_dict)

    if body["classification"]:
        assign_workflow_template_or_instance_ids(body["classification"])
        body["classification"] = get_workflow_classification_from_dict(
            body, body["classification"]
        )

    apply_changes_to_model(new_workflow_template, body)
    check_for_existing_template_version(
        new_workflow_template.classification.id, new_workflow_template.version
    )

    # Archive the old workflow template
    find_and_archive_previous_workflow_template(
        workflow_template.classification_id, last_edited_by=body["last_edited_by"]
    )

    crud.create(model=new_workflow_template, refresh=True)

    return "", 204


# /api/workflow/templates/<string:workflow_template_id> [DELETE]
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

    crud.delete_workflow(WorkflowTemplateOrm, id=path.workflow_template_id)

    return "", 204
