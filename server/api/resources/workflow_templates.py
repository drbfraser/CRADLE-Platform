from typing import Optional

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from sqlalchemy.exc import IntegrityError

import data.db_operations as crud
from api.authorization import require_role
from api.resources.workflow_template_steps import (
    WorkflowTemplateStepListResponse,
    _resolve_step_dict,
)
from common.api_utils import WorkflowTemplateIdPath, convert_query_parameter_to_bool
from common.commonUtil import get_current_time
from common.form_utils import _extend_lang_version
from common.workflow_utils import (
    assign_workflow_template_or_instance_ids,
    check_workflow_classification_name_conflict,
    check_workflow_template_branch_ownership,
    format_workflow_template,
    generate_updated_workflow_template,
    get_english_text,
    get_new_lang_versions_for_workflow_template,
    get_next_workflow_template_version,
    lock_workflow_classification_for_update,
    replace_workflow_template_step,
    update_workflow_template_form_links,
    validate_workflow_template_step,
)
from data import orm_serializer
from enums import RoleEnum
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)
from service.workflow.workflow_service import (
    WorkflowService,
    _resolve_workflow_template_text,
)
from validation import CradleBaseModel
from validation.workflow_api_models import (
    WorkflowTemplateLangList,
    WorkflowTemplatePatchBody,
    WorkflowTemplateUpdateModel,
    WorkflowTemplateUploadModel,
)
from validation.workflow_models import (
    WorkflowTemplateModel,
    WorkflowTemplateMultiLangModel,
)


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


def archive_active_workflow_templates(
    workflow_classification_id: str, edited_at: int
) -> None:
    for previous_template in crud.read_all(
        WorkflowTemplateOrm,
        classification_id=workflow_classification_id,
        archived=False,
    ):
        previous_template.archived = True
        previous_template.last_edited = edited_at


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
    check_workflow_template_branch_ownership(workflow_template_dict["steps"])
    edited_at = get_current_time()
    workflow_template_dict.update(
        date_created=edited_at,
        last_edited=edited_at,
        archived=False,
        has_branching_issues=False,
    )

    classification_dict = workflow_template_dict.get("classification")
    if classification_dict is not None:
        existing_classification = crud.read(
            WorkflowClassificationOrm, id=classification_dict.get("id")
        )
        if existing_classification is None:
            # Brand-new classification: every workflow classification must
            # have an English name (mirrors forms' handle_model_existence),
            # since English is the fallback language every read path relies on.
            english_name = get_english_text(classification_dict.get("name") or {})
            if not english_name:
                return abort(
                    code=422,
                    description="Workflow classification must have an English name.",
                )
            if check_workflow_classification_name_conflict(english_name):
                return abort(
                    code=409,
                    description=(
                        f"Workflow classification with name '{english_name}' already exists."
                    ),
                )

    for step in workflow_template_dict.get("steps") or []:
        step_name = get_english_text(step.get("name") or {})
        if not step_name:
            return abort(
                code=422,
                description="Every workflow template step must have an English name.",
            )

    # convert incoming translation maps into pointers
    new_lang_versions = get_new_lang_versions_for_workflow_template(
        workflow_template_dict, new_template=True
    )

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    if workflow_template_dict.get("name") is not None:
        del workflow_template_dict["name"]

    # Validate each step in the template
    if workflow_template_dict.get("steps") is not None:
        for workflow_template_step in workflow_template_dict["steps"]:
            workflow_template_step["last_edited"] = edited_at
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

            archive_active_workflow_templates(workflow_classification_orm.id, edited_at)

        else:
            workflow_template_dict["version"] = "V1"

    workflow_template_orm = orm_serializer.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )

    if workflow_classification_orm is not None:
        workflow_template_orm.classification = workflow_classification_orm

    for lang_version in new_lang_versions:
        crud.db_session.add(lang_version)

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

    result = orm_serializer.marshal(obj=workflow_template_orm, shallow=True)
    _resolve_workflow_template_text(result, "English")
    return result


# /api/workflow/templates/body [POST] - JSON body (like form templates)
@api_workflow_templates.post("/body", responses={201: WorkflowTemplateModel})
def upload_workflow_template_body(body: WorkflowTemplateUploadModel):
    """
    Upload Workflow Template VIA Request Body
    Accepts Workflow Template through the request body, rather than as a file.
    """
    require_role(RoleEnum.ADMIN)
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

    response_data = []
    for template in workflow_templates:
        d = orm_serializer.marshal(template, shallow=True)
        _resolve_workflow_template_text(d, "English")
        response_data.append(d)

    return {"items": response_data}, 200


# /api/workflow/templates/<string:template_id>?with_steps=<bool>&with_classification=<bool> [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def get_workflow_template(path: WorkflowTemplateIdPath):
    """
    Get Workflow Template.

    Returns the normal enlgish version unless
    GET .../translations is used for multi-lingual one (for mobile compatibility).
    """
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False)
    with_steps = convert_query_parameter_to_bool(with_steps)
    with_classification = request.args.get("with_classification", default=False)
    with_classification = convert_query_parameter_to_bool(with_classification)
    lang = request.args.get("lang", default="English")

    workflow_template = WorkflowService.get_workflow_template(
        path.workflow_template_id, lang=lang
    )

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    response_data = workflow_template.model_dump()

    if not with_steps:
        del response_data["steps"]
    if not with_classification:
        del response_data["classification"]

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id>/languages [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>/languages",
    responses={200: WorkflowTemplateLangList},
)
def get_workflow_template_languages(path: WorkflowTemplateIdPath):
    """
    Get the languages a workflow template fully supports (classification
    name, template description, and every step's name/description all
    have a translation in that language).
    """
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    lang_versions = crud.read_workflow_template_language_versions(
        path.workflow_template_id
    )
    return {"langVersions": lang_versions}, 200


# /api/workflow/templates/<string:workflow_template_id>/translations [GET]
@api_workflow_templates.get(
    "/<string:workflow_template_id>/translations",
    responses={200: WorkflowTemplateMultiLangModel},
)
def get_workflow_template_translations(path: WorkflowTemplateIdPath):
    """
    Get the raw multi-language shape of a workflow template (every
    translatable field as a {lang: text} map), for the admin editor only.
    """
    require_role(RoleEnum.ADMIN)
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    available_langs = crud.read_workflow_template_language_versions(
        path.workflow_template_id
    )
    marshalled = orm_serializer.marshal(workflow_template, shallow=False)
    formatted = format_workflow_template(marshalled, available_langs)
    return formatted, 200


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
    lang = request.args.get("lang", default="English")

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
    response_data = []
    for template_step in template_steps:
        d = orm_serializer.marshal(template_step)
        _resolve_step_dict(d, lang)
        response_data.append(d)

    return {"items": response_data}, 200


# /api/workflow/templates/<string:workflow_template_id> [PUT]
# TODO: This endpoint is kinda redundant now because of the PATCH request
@api_workflow_templates.put(
    "/<string:workflow_template_id>", responses={200: WorkflowTemplateModel}
)
def update_workflow_template(
    path: WorkflowTemplateIdPath, body: WorkflowTemplateUpdateModel
):
    """Update Workflow Template"""
    require_role(RoleEnum.ADMIN)
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_message.format(
                path.workflow_template_id
            ),
        )

    changes = body.model_dump()
    check_workflow_template_branch_ownership(changes["steps"])
    edited_at = get_current_time()
    classification_id = (changes["classification"] or {}).get(
        "id"
    ) or body.classification_id
    if "classification_id" not in body.model_fields_set and body.classification is None:
        classification_id = workflow_template.classification_id

    existing_steps = {step.id: step for step in workflow_template.steps}
    saved_steps = []
    with crud.db_session.no_autoflush:
        if (
            classification_id is not None
            and crud.read(WorkflowClassificationOrm, id=classification_id) is None
        ):
            return abort(404, description="Classification not found.")

        for step in changes["steps"]:
            existing_step = existing_steps.pop(step["id"], None)
            if (
                existing_step is None
                and crud.read(WorkflowTemplateStepOrm, id=step["id"]) is not None
            ):
                return abort(
                    409, description="Step belongs to another workflow template."
                )
            step["name"] = {"English": step["name"]}
            step["description"] = {"English": step["description"]}
            saved_steps.append(
                replace_workflow_template_step(
                    step, workflow_template.id, edited_at, existing_step
                )
            )

        for step in existing_steps.values():
            crud.db_session.delete(step)

        workflow_template.steps = saved_steps
        workflow_template.starting_step_id = changes["starting_step_id"]
        workflow_template.classification_id = classification_id
        workflow_template.last_edited = edited_at
        crud.db_session.add_all(
            _extend_lang_version(
                {"English": changes["description"]},
                workflow_template.description_string_id,
                new_template=False,
            )
        )
        update_workflow_template_form_links(workflow_template)

    crud.db_session.commit()
    response_data = orm_serializer.marshal(workflow_template, shallow=True)
    _resolve_workflow_template_text(response_data, "English")

    return response_data, 200


# /api/workflow/templates/<string:workflow_template_id> [PATCH]
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
    require_role(RoleEnum.ADMIN)
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

        name_map = body_dict["classification"].get("name")
        if name_map is not None:
            english_name = get_english_text(name_map)
            if not english_name:
                return abort(
                    code=422,
                    description="Workflow classification must have an English name.",
                )
            if check_workflow_classification_name_conflict(
                english_name, exclude_string_id=classification_orm.name_string_id
            ):
                return abort(
                    code=409,
                    description=(
                        f"Workflow classification with name '{english_name}' already exists."
                    ),
                )
            crud.db_session.add_all(
                _extend_lang_version(
                    name_map, classification_orm.name_string_id, new_template=False
                )
            )

        # Always keep template bound to its existing classification ID.
        body_dict["classification_id"] = existing_classification_id
        # Avoid passing nested classification dict into template generator
        del body_dict["classification"]

    if body_dict.get("steps") is None:
        body_dict.pop("steps", None)

    for step in body_dict.get("steps", []):
        step_name = get_english_text(step.get("name") or {})
        if not step_name:
            return abort(
                code=422,
                description="Every workflow template step must have an English name.",
            )

    # Convert any remaining translation maps string id pointers
    new_lang_versions = get_new_lang_versions_for_workflow_template(
        body_dict, new_template=True
    )

    classification_id = (
        body_dict.get("classification_id") or workflow_template.classification_id
    )

    lock_workflow_classification_for_update(classification_id)

    edited_at = get_current_time()
    body_dict.update(
        version=get_next_workflow_template_version(classification_id),
        date_created=edited_at,
        last_edited=edited_at,
    )

    new_workflow_template = generate_updated_workflow_template(
        existing_template=workflow_template, patch_body=body_dict, auto_assign_id=True
    )

    for lang_version in new_lang_versions:
        crud.db_session.add(lang_version)

    with crud.db_session.no_autoflush:
        update_workflow_template_form_links(new_workflow_template)

    workflow_template.archived = True
    workflow_template.last_edited = edited_at

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

    updated_workflow_template = WorkflowService.get_workflow_template(
        new_workflow_template.id, lang="English"
    )
    response_data = updated_workflow_template.model_dump()
    del response_data["steps"]

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
    result = orm_serializer.marshal(updated_template, shallow=True)
    _resolve_workflow_template_text(result, "English")
    return result, 200
