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
from common import workflow_utils_v2
from common.api_utils import WorkflowTemplateIdPath, convert_query_parameter_to_bool
from common.commonUtil import get_current_time
from common.workflow_utils import (
    assign_workflow_template_or_instance_ids,
    check_branch_conditions,
    generate_updated_workflow_template,
    validate_workflow_template_step,
)
from data import orm_serializer
from enums import RoleEnum
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.file_upload import FileUploadForm
from validation.workflow_api_models import (
    GetWorkflowTemplatesQuery,
    WorkflowTemplatePatchBody,
    WorkflowTemplateUploadModel,
)
from validation.workflow_models import WorkflowTemplateModel


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


def _resolve_template_names(
    data: dict, template_orm: Optional[WorkflowTemplateOrm] = None, lang: str = "English"
) -> None:
    """
    Resolve ``name_string_id`` values to human-readable name strings
    in a marshalled template response dict.  Mutates *data* in place.

    Follows the FormsV2 pattern: templates do NOT have their own name.
    The display name is always derived from the classification's
    ``name_string_id``.
    """
    # Template name comes from classification
    if template_orm and template_orm.classification:
        data["name"] = workflow_utils_v2.resolve_name(
            template_orm.classification.name_string_id, lang
        )
    elif data.get("classification") and data["classification"].get("name_string_id"):
        data["name"] = workflow_utils_v2.resolve_name(
            data["classification"]["name_string_id"], lang
        )

    # Classification sub-object
    classification = data.get("classification")
    if classification and classification.get("name_string_id"):
        classification["name"] = workflow_utils_v2.resolve_name(
            classification["name_string_id"], lang
        )

    # Step names
    for step in data.get("steps", []):
        if step.get("name_string_id"):
            step["name"] = workflow_utils_v2.resolve_name(
                step["name_string_id"], lang)


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
        # Handle multi-lang name for new classification
        try:
            workflow_utils_v2.handle_classification_name(
                workflow_classification_dict)
        except ValueError as e:
            return abort(code=400, description=str(e))

        if "name" in workflow_classification_dict:
            del workflow_classification_dict["name"]

        workflow_classification_orm = orm_serializer.unmarshal(
            WorkflowClassificationOrm, workflow_classification_dict
        )

    elif workflow_classification_orm is not None:
        workflow_template_dict["classification_id"] = workflow_classification_orm.id

    return workflow_classification_orm


def check_for_existing_template_version(
    workflow_classification_id: str,
    workflow_template_version: str,
) -> None:
    """
    Checks if a workflow template with the same version under the same classification already exists.
    :param workflow_classification_id: ID of the workflow classification
    :param workflow_template_version: Version string to check
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
    # NOTE: We use check_branch_conditions + form upload directly instead of
    # validate_workflow_template_step(), because that function requires the
    # template to exist in DB already (which it doesn't during creation).
    # Step IDs are already assigned by assign_workflow_template_or_instance_ids.
    if workflow_template_dict.get("steps") is not None:
        for workflow_template_step in workflow_template_dict["steps"]:
            check_branch_conditions(workflow_template_step)
            # Handle form template upload if provided
            if workflow_template_step.get("form") is not None:
                from api.resources.form_templates import handle_form_template_upload
                from validation.formTemplates import FormTemplateUpload

                try:
                    form_template = FormTemplateUpload(
                        **workflow_template_step["form"]
                    )
                    form_template = handle_form_template_upload(form_template)
                    workflow_template_step["form"] = form_template
                except ValueError as err:
                    return abort(code=409, description=str(err))
            # Handle multi-lang name for steps
            workflow_utils_v2.handle_template_step_name(workflow_template_step)
            if "name" in workflow_template_step:
                del workflow_template_step["name"]

    # Handle multi-lang name for the template itself
    # Templates don't have their own name — name comes from classification.
    # Remove transient 'name' key so the ORM doesn't choke.
    if "name" in workflow_template_dict:
        del workflow_template_dict["name"]

    workflow_template_orm = orm_serializer.unmarshal(
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

    response_data = orm_serializer.marshal(
        obj=workflow_template_orm, shallow=True)
    _resolve_template_names(response_data, workflow_template_orm)
    return response_data


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


# /api/workflow/templates?classification_id=<str>&archived=<bool>&lang=<str> [GET]
@api_workflow_templates.get("", responses={200: WorkflowTemplateListResponse})
def get_workflow_templates(query: GetWorkflowTemplatesQuery):
    """Get All Workflow Templates"""
    workflow_templates = crud.read_workflow_templates(
        workflow_classification_id=query.classification_id,
        is_archived=query.archived,
    )

    response_data = []
    for template in workflow_templates:
        data = orm_serializer.marshal(template, shallow=True)
        _resolve_template_names(data, template, lang=query.lang)
        response_data.append(data)

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
    with_classification = request.args.get(
        "with_classification", default=False)
    with_classification = convert_query_parameter_to_bool(with_classification)
    lang = request.args.get("lang", default="English")

    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    response_data = orm_serializer.marshal(
        obj=workflow_template, shallow=False)
    _resolve_template_names(response_data, workflow_template, lang=lang)

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
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)
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
    template_steps_data = []
    for template_step in template_steps:
        data = orm_serializer.marshal(template_step)
        if data.get("name_string_id"):
            data["name"] = workflow_utils_v2.resolve_name(
                data["name_string_id"]
            )
        template_steps_data.append(data)

    return {"items": template_steps_data}, 200


# /api/workflow/templates/<string:workflow_template_id> [PUT]
# TODO: This endpoint is kinda redundant now because of the PATCH request
@roles_required([RoleEnum.ADMIN])
@api_workflow_templates.put(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def update_workflow_template(path: WorkflowTemplateIdPath, body: WorkflowTemplateModel):
    """Update Workflow Template"""
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

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

    updated_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

    response_data = orm_serializer.marshal(updated_template, shallow=True)
    _resolve_template_names(response_data, updated_template)

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

    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    # ── Extract name payload (templates don't have their own name) ──
    body_dict.pop("name", None)

    # If the request body includes a new workflow classification, process it
    if body_dict.get("classification") is not None:
        # Use the existing classification_id as a fallback if one isn't provided
        classification_context = {
            "classification_id": body_dict.get(
                "classification_id", workflow_template.classification_id
            )
        }
        get_workflow_classification_from_dict(
            classification_context, body_dict["classification"]
        )
        body_dict["classification_id"] = classification_context["classification_id"]
        # Avoid passing nested classification dict into template generator
        del body_dict["classification"]

    # ── Validate version BEFORE any DB side-effects ──
    classification_id = (
        body_dict.get(
            "classification_id") or workflow_template.classification_id
    )

    new_version = body_dict.get("version")
    if new_version and classification_id:
        check_for_existing_template_version(
            classification_id,
            new_version,
        )

    # ── Now safe to persist translations (validation passed) ──

    # Handle step name translations
    if body_dict.get("steps"):
        for step in body_dict["steps"]:
            workflow_utils_v2.handle_template_step_name(step)
            # Remove name dict so ORM unmarshal doesn't choke
            step.pop("name", None)

    # Re-read the template: translation upserts above trigger db_session.commit()
    # which expires all loaded ORM attributes. Without this refresh the subsequent
    # marshal(existing_template) would produce an incomplete dict (missing
    # description, version, etc.) and unmarshal would raise a ValidationError.
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

    new_workflow_template = generate_updated_workflow_template(
        existing_template=workflow_template, patch_body=body_dict, auto_assign_id=True
    )

    # Ensure the new version keeps the same classification.
    # generate_updated_workflow_template preserves classification_id in the dict,
    # but unmarshal leaves the classification relationship as None.  SQLAlchemy
    # syncs the None relationship back to the FK on commit, so we must set the
    # actual relationship object.
    if workflow_template.classification_id:
        classification_orm = crud.read(
            WorkflowClassificationOrm, id=workflow_template.classification_id
        )
        if classification_orm:
            new_workflow_template.classification = classification_orm

    # New versions must always be non-archived; archive only the old version
    new_workflow_template.archived = False
    workflow_template.archived = True

    crud.create(model=new_workflow_template, refresh=True)

    updated_template = crud.read(
        WorkflowTemplateOrm, id=new_workflow_template.id)

    response_data = orm_serializer.marshal(updated_template, shallow=True)
    _resolve_template_names(response_data, updated_template)

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id> [DELETE]
@api_workflow_templates.delete("/<string:workflow_template_id>", responses={204: None})
def delete_workflow_template(path: WorkflowTemplateIdPath):
    """Delete Workflow Template"""
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

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
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)

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

    updated_template = crud.read(
        WorkflowTemplateOrm, id=path.workflow_template_id)
    response_data = orm_serializer.marshal(updated_template, shallow=True)
    _resolve_template_names(response_data, updated_template)
    return response_data, 200


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
    # Resolve template name from classification
    template_name = ""
    if (
        workflow_template.classification
        and workflow_template.classification.name_string_id
    ):
        template_name = workflow_utils_v2.resolve_name(
            workflow_template.classification.name_string_id
        ) or ""
    writer.writerow(["Name", template_name])
    writer.writerow(["Description", workflow_template.description or ""])
    writer.writerow(["Version", workflow_template.version])
    writer.writerow(
        [
            "Classification",
            (
                workflow_utils_v2.resolve_name(
                    workflow_template.classification.name_string_id
                ) or ""
                if workflow_template.classification and workflow_template.classification.name_string_id
                else ""
            ),
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
