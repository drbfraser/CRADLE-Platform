# Create a simple CSV representation of the workflow template
import csv
import io
import json
from typing import List, Optional

from flask import abort, make_response, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import roles_required
from api.resources.workflow_template_steps import WorkflowTemplateStepListResponse
from common.api_utils import (
    WorkflowTemplateIdPath,
    convert_query_parameter_to_bool,
)
from common.commonUtil import get_current_time
from common.workflow_utils import (
    apply_changes_to_model,
    assign_workflow_template_or_instance_ids,
    validate_workflow_template_step,
)
from data import marshal
from enums import RoleEnum
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.file_upload import FileUploadForm
from validation.workflow_templates import (
    WorkflowTemplateModel,
    WorkflowTemplatePatchBody,
    WorkflowTemplateUploadModel,
)


# Path model for CSV endpoint
class WorkflowTemplateVersionPath(CradleBaseModel):
    workflow_template_id: str
    version: str


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
    workflow_classification_id: str,
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
    workflow_classification_id: str, workflow_template_version: str
) -> None:
    """
    Checks if a workflow template with the same version under the same classification already exists

    :param workflow_classification_id: ID of the workflow classification
    :param workflow_template_dict: Dictionary consisting of attributes for a workflow template
    """
    existing_template_version = crud.read(
        WorkflowTemplateOrm,
        classification_id=workflow_classification_id,
        version=workflow_template_version,
    )

    if existing_template_version is not None:
        return abort(
            code=409,
            description="Workflow template with same version still exists - Change version before upload.",
        )


def handle_workflow_template_upload(workflow_template_dict: dict):
    """
    Common logic for handling uploaded workflow template. Whether it was uploaded
    as a file, or in the request body.
    """
    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=workflow_template_dict
    )

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    # Validate each step in the template
    if workflow_template_dict.get("steps") is None:
        for workflow_template_step in workflow_template_dict["steps"]:
            validate_workflow_template_step(workflow_template_step)

    workflow_template_orm = marshal.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )

    with crud.db_session.no_autoflush:
        workflow_classification_orm = get_workflow_classification_from_dict(
            workflow_template_dict, workflow_classification_dict
        )

        if workflow_classification_orm is not None:
            check_for_existing_template_version(
                workflow_classification_orm.id, workflow_template_dict["version"]
            )
            workflow_template_orm.classification = workflow_classification_orm

            """ 
            There should only be one unarchived version of the workflow template, so this 
            checks if a previously unarchived version of the workflow template exists and
            archives it
            """
            # Check if a previously existing version of this template exists, if so, archive it
            find_and_archive_previous_workflow_template(
                workflow_classification_orm.id,
            )

    crud.create(model=workflow_template_orm, refresh=True)

    return marshal.marshal(obj=workflow_template_orm, shallow=True)


# /api/workflow/templates [POST] - File upload (like form templates)
@api_workflow_templates.post("", responses={201: WorkflowTemplateModel})
@roles_required([RoleEnum.ADMIN])
def upload_workflow_template_file(form: FileUploadForm):
    """
    Upload Workflow Template VIA File
    Accepts Workflow Template as a file.
    Supports `.json` and `.csv` file formats.
    """
    file = form.file
    file_str = str(file.stream.read(), "utf-8")

    try:
        workflow_template_dict = json.loads(file_str)
    except json.JSONDecodeError as e:
        return abort(400, description=f"Invalid JSON file: {e!s}")

    result = handle_workflow_template_upload(workflow_template_dict)
    return result, 201


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
    is_archived = convert_query_parameter_to_bool(archived_param)

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

    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id> [PATCH]
@api_workflow_templates.patch(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
@roles_required([RoleEnum.ADMIN])
def update_workflow_template_patch(
    path: WorkflowTemplateIdPath, body: WorkflowTemplatePatchBody
):
    """
    Update Workflow Template with only specific fields

    Because workflow templates are large objects, this endpoint allows only the necessary attributes to be sent
    from the frontend to the backend, instead of the entire object itself
    """
    body = body.model_dump(
        exclude_unset=True
    )  # Only include the fields that are set in the request body

    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    # Create an entirely new workflow template with the new attributes
    copy_workflow_template_dict = marshal.marshal(workflow_template)
    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=copy_workflow_template_dict, auto_assign_id=True
    )
    new_workflow_template = marshal.unmarshal(
        WorkflowTemplateOrm, copy_workflow_template_dict
    )

    # If the request body includes a new workflow classification, process it
    if body.get("classification", None):
        assign_workflow_template_or_instance_ids(
            m=WorkflowTemplateOrm, workflow=body["classification"]
        )
        body["classification"] = get_workflow_classification_from_dict(
            body, body["classification"]
        )

    # This assumes that the request body has every step in the workflow template, all old steps will be overwritten
    # If the request body includes any new/modified steps, process it
    if body.get("steps", None):
        for step in body["steps"]:
            validate_workflow_template_step(step)

    apply_changes_to_model(new_workflow_template, body)

    check_for_existing_template_version(
        new_workflow_template.classification.id, new_workflow_template.version
    )

    # Archive the old workflow template
    find_and_archive_previous_workflow_template(workflow_template.classification_id)

    crud.create(model=new_workflow_template, refresh=True)

    response_data = crud.read(WorkflowTemplateOrm, id=copy_workflow_template_dict["id"])

    response_data = marshal.marshal(response_data, shallow=True)

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
    return marshal.marshal(updated_template, shallow=True), 200


# /api/workflow/templates/<string:workflow_template_id>/versions/<string:version>/csv [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>/versions/<string:version>/csv",
    responses={
        200: {"content": {"text/csv": {"schema": {"type": "string"}}}},
        404: {"description": "Workflow template not found"},
    },
)
def get_workflow_template_version_as_csv(path: WorkflowTemplateVersionPath):
    """Get Workflow Template Version as CSV"""
    filters: dict = {
        "id": path.workflow_template_id,
        "version": path.version,
    }

    workflow_template = crud.read(
        WorkflowTemplateOrm,
        **filters,
    )

    if workflow_template is None:
        return abort(
            404,
            description=f"No workflow template with ID: {path.workflow_template_id}",
        )

    csv_data = io.StringIO()
    writer = csv.writer(csv_data)

    # Write header
    writer.writerow(["Field", "Value"])

    # Write template data
    writer.writerow(["ID", workflow_template.id])
    writer.writerow(["Name", workflow_template.name])
    writer.writerow(["Description", workflow_template.description or ""])
    writer.writerow(["Version", workflow_template.version])
    writer.writerow(
        [
            "Classification",
            workflow_template.classification.name
            if workflow_template.classification
            else "",
        ]
    )
    writer.writerow(["Date Created", workflow_template.date_created])
    writer.writerow(["Last Edited", workflow_template.last_edited])
    writer.writerow(["Archived", workflow_template.archived])

    csv_content = csv_data.getvalue()
    csv_data.close()

    response = make_response(csv_content)
    response.headers["Content-Disposition"] = (
        f"attachment; filename=workflow_template_{workflow_template.id}.csv"
    )
    response.headers["Content-Type"] = "text/csv"
    return response
