from typing import Optional

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from sqlalchemy.exc import IntegrityError

import data.db_operations as crud
from api.decorator import roles_required
from api.resources.workflow_template_steps import WorkflowTemplateStepListResponse
from common.api_utils import WorkflowTemplateIdPath, convert_query_parameter_to_bool
from common.commonUtil import get_current_time
from common.workflow_utils import (
    assign_workflow_template_or_instance_ids,
    check_form_compatibility_for_workflow,
    generate_updated_workflow_template,
    get_next_workflow_template_version,
    lock_workflow_classification_for_update,
    validate_workflow_template_step,
)
from data import orm_serializer
from enums import RoleEnum
from models import (
    FormTemplateOrmV2,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.workflow_api_models import (
    WorkflowTemplatePatchBody,
    WorkflowTemplateUploadModel,
)
from validation.workflow_models import WorkflowTemplateModel


# Create a response model for the list endpoints
class WorkflowTemplateListResponse(CradleBaseModel):
    items: list[WorkflowTemplateModel]


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
    workflow_classification_id: str,
) -> None:
    """Archive the currently active template for a given workflow classification, if one exists."""
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
        workflow_classification_orm = orm_serializer.unmarshal(
            WorkflowClassificationOrm, workflow_classification_dict
        )

    elif workflow_classification_orm is not None:
        workflow_template_dict["classification_id"] = workflow_classification_orm.id

    return workflow_classification_orm


def handle_workflow_template_upload(workflow_template_dict: dict):
    """
    Common logic for handling workflow template creation from request body payloads.
    """
    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=workflow_template_dict
    )

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    if workflow_template_dict.get("name") is not None:
        del workflow_template_dict["name"]

    # Validate each step in the template
    if workflow_template_dict.get("steps") is not None:
        for workflow_template_step in workflow_template_dict["steps"]:
            validate_workflow_template_step(
                workflow_template_step, allow_missing_template=True
            )

    with crud.db_session.no_autoflush:
        workflow_classification_orm = get_workflow_classification_from_dict(
            workflow_template_dict, workflow_classification_dict
        )

        if workflow_classification_orm is not None:
            locked_classification = lock_workflow_classification_for_update(
                workflow_classification_orm.id
            )

            if locked_classification is not None:
                workflow_classification_orm = locked_classification

            workflow_template_dict["classification_id"] = workflow_classification_orm.id
            workflow_template_dict["version"] = get_next_workflow_template_version(
                workflow_classification_orm.id
            )

            """
            There should only be one unarchived version of the workflow template, so this
            checks if a previously unarchived version of the workflow template exists and
            archives it
            """
            # Check if a previously existing version of this template exists, if so, archive it
            find_and_archive_previous_workflow_template(
                workflow_classification_orm.id,
            )

        else:
            workflow_template_dict["version"] = "V1"

    workflow_template_orm = orm_serializer.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )

    if workflow_classification_orm is not None:
        workflow_template_orm.classification = workflow_classification_orm

    try:
        crud.create(model=workflow_template_orm, refresh=True)
    except IntegrityError as err:
        crud.db_session.rollback()

        db_error_msg = str(getattr(err, "orig", err)).lower()
        is_version_conflict = (
            "uq_workflow_template_classification_version" in db_error_msg
            or (
                "workflow_template" in db_error_msg
                and "classification_id" in db_error_msg
                and "version" in db_error_msg
                and ("duplicate" in db_error_msg or "unique" in db_error_msg)
            )
        )

        if not is_version_conflict:
            return abort(
                code=422,
                description=(
                    "Workflow template could not be created because one or more references are invalid."
                ),
            )

        return abort(
            code=409,
            description=(
                "Workflow template version conflict. Please retry the request."
            ),
        )

    return orm_serializer.marshal(obj=workflow_template_orm, shallow=True)


# /api/workflow/templates/body [POST] - JSON body (like form templates)
@api_workflow_templates.post("/body", responses={201: WorkflowTemplateModel})
@roles_required([RoleEnum.ADMIN])
def upload_workflow_template_body(body: WorkflowTemplateUploadModel):
    """
    Upload Workflow Template VIA Request Body
    Accepts Workflow Template through the request body, rather than as a file.
    """
    workflow_template_dict = body.model_dump()

    result = handle_workflow_template_upload(workflow_template_dict)
    return result, 201


# /api/workflow/templates?classification_id=<str>&archived=<bool> [GET]
@api_workflow_templates.get("", responses={200: WorkflowTemplateListResponse})
def get_workflow_templates():
    """Get All Workflow Templates"""
    # Get query parameters
    workflow_classification_id = request.args.get("classification_id", default=None)

    archived_param = request.args.get("archived")
    is_archived = None if convert_query_parameter_to_bool(archived_param) else False

    workflow_templates = crud.read_workflow_templates(
        workflow_classification_id=workflow_classification_id,
        is_archived=is_archived,
    )

    response_data = [
        orm_serializer.marshal(template, shallow=True)
        for template in workflow_templates
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

    response_data = orm_serializer.marshal(obj=workflow_template, shallow=False)

    if not with_steps:
        del response_data["steps"]
    if not with_classification and "classification" in response_data:
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
        orm_serializer.marshal(template_step) for template_step in template_steps
    ]

    return {"items": template_steps}, 200


# /api/workflow/templates/<string:workflow_template_id> [PUT]
# TODO: This endpoint is kinda redundant now because of the PATCH request
@roles_required([RoleEnum.ADMIN])
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

    if workflow_template_changes.get("steps", None):
        for step in workflow_template_changes["steps"]:
            validate_workflow_template_step(step)

    workflow_template_changes["last_edited"] = get_current_time()

    crud.update(
        WorkflowTemplateOrm,
        changes=workflow_template_changes,
        id=path.workflow_template_id,
    )

    response_data = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    response_data = orm_serializer.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id> [PATCH]
@roles_required([RoleEnum.ADMIN])
@api_workflow_templates.patch(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def update_workflow_template_patch(
    path: WorkflowTemplateIdPath, body: WorkflowTemplatePatchBody
):
    """
    Update Workflow Template with only specific fields
    Because workflow templates are large objects, this endpoint allows only the necessary attributes to be sent
    from the frontend to the backend, instead of the entire object itself
    """
    body_dict = body.model_dump(exclude_unset=True)

    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    if body_dict.get("name") is not None:
        return abort(
            code=400,
            description=(
                "Template name is derived from classification. "
                "Update classification.name instead."
            ),
        )

    # If classification is provided during template edit, rename the existing
    # classification in place (do not create or relink classifications).
    if body_dict.get("classification") is not None:
        existing_classification_id = workflow_template.classification_id
        if existing_classification_id is None:
            return abort(code=404, description="Classification not found.")

        classification_orm = crud.read(
            WorkflowClassificationOrm, id=existing_classification_id
        )
        if classification_orm is None:
            return abort(code=404, description="Classification not found.")

        classification_name = body_dict["classification"].get("name")
        if classification_name is not None:
            crud.update(
                WorkflowClassificationOrm,
                changes={"name": classification_name},
                autocommit=False,
                id=existing_classification_id,
            )

        # Always keep template bound to its existing classification ID.
        body_dict["classification_id"] = existing_classification_id
        # Avoid passing nested classification dict into template generator
        del body_dict["classification"]

    classification_id = (
        body_dict.get("classification_id") or workflow_template.classification_id
    )

    lock_workflow_classification_for_update(classification_id)

    body_dict["version"] = get_next_workflow_template_version(classification_id)

    new_workflow_template = generate_updated_workflow_template(
        existing_template=workflow_template, patch_body=body_dict, auto_assign_id=True
    )

    # For each step, check compatibility against the latest non-archived form for
    # that step's classification. If compatible, update the step to the latest form.
    # If any step is incompatible, mark has_branching_issues without updating form_ids.
    has_issues = False
    for old_step, new_step in zip(
        workflow_template.steps, new_workflow_template.steps
    ):
        if not old_step.form_id:
            continue
        current_form = crud.read(FormTemplateOrmV2, id=old_step.form_id)
        if current_form is None or not current_form.form_classification_id:
            continue
        latest_form = (
            crud.db_session.query(FormTemplateOrmV2)
            .filter(
                FormTemplateOrmV2.form_classification_id
                == current_form.form_classification_id
            )
            .filter(FormTemplateOrmV2.archived == False)
            .first()
        )
        if latest_form is None or latest_form.id == old_step.form_id:
            continue
        compatible, _ = check_form_compatibility_for_workflow(
            new_workflow_template, current_form, latest_form
        )
        if compatible:
            new_step.form_id = latest_form.id
        else:
            has_issues = True

    new_workflow_template.has_branching_issues = has_issues

    workflow_template.archived = True

    try:
        crud.create(model=new_workflow_template, refresh=True)
    except IntegrityError:
        crud.db_session.rollback()
        return abort(
            code=409,
            description=(
                "Workflow template version conflict. Please retry the request."
            ),
        )

    response_data = crud.read(WorkflowTemplateOrm, id=new_workflow_template.id)

    response_data = orm_serializer.marshal(response_data, shallow=True)

    return response_data, 200


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


# Create a query model for archive operations
class ArchiveWorkflowTemplateQuery(CradleBaseModel):
    archive: Optional[bool] = True


# /api/workflow/templates/<string:workflow_template_id>/archive [PUT]
@api_workflow_templates.put(
    "/<string:workflow_template_id>/archive", responses={200: WorkflowTemplateModel}
)
def archive_workflow_template(
    path: WorkflowTemplateIdPath, query: ArchiveWorkflowTemplateQuery
):
    """Archive / Unarchive Workflow Template"""
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    changes = {
        "archived": bool(query.archive),
        "last_edited": get_current_time(),
    }

    crud.update(
        WorkflowTemplateOrm,
        changes=changes,
        id=path.workflow_template_id,
    )

    updated_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    return orm_serializer.marshal(updated_template, shallow=True), 200
