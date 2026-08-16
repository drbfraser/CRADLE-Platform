from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import (
    WorkflowTemplateStepIdPath,
    WorkflowTemplateStepListResponse,
    convert_query_parameter_to_bool,
)
from common.commonUtil import get_current_time
from common.form_utils import resolve_string_text
from common.workflow_utils import (
    check_branch_conditions,
    get_new_lang_versions_for_workflow_step,
    validate_workflow_template_step,
)
from data import orm_serializer
from models import WorkflowTemplateStepOrm
from validation.workflow_api_models import WorkflowTemplateStepUploadModel
from validation.workflow_models import (
    WorkflowTemplateStepModel,
    WorkflowTemplateStepMultiLangModel,
)

workflow_template_step_not_found_msg = "Workflow template step with ID: ({}) not found."

# /api/workflow/template/steps
api_workflow_template_steps = APIBlueprint(
    name="workflow_template_steps",
    import_name=__name__,
    url_prefix="/workflow/template/steps",
    abp_tags=[Tag(name="Workflow Template Steps", description="")],
    abp_security=[{"jwt": []}],
)


def _resolve_step_dict(d: dict, lang: str) -> dict:
    """
    Mutate a marshalled step dict in place, resolving name_string_id/
    description_string_id into the plain name/description text
    WorkflowTemplateStepModel expects (extra="forbid"), falling back to
    English if the requested language has no translation.
    """
    name_string_id = d.pop("name_string_id", None)
    if name_string_id is not None:
        d["name"] = resolve_string_text(name_string_id, lang) or resolve_string_text(
            name_string_id, "English"
        )

    description_string_id = d.pop("description_string_id", None)
    if description_string_id is not None:
        d["description"] = (
            resolve_string_text(description_string_id, lang)
            or resolve_string_text(description_string_id, "English")
            or ""
        )

    return d


# /api/workflow/template/steps [POST]
@api_workflow_template_steps.post("", responses={201: WorkflowTemplateStepModel})
def create_workflow_template_step(body: WorkflowTemplateStepUploadModel):
    """Create Workflow Template Step"""
    template_step = body.model_dump()

    validate_workflow_template_step(template_step)

    new_lang_versions = get_new_lang_versions_for_workflow_step(
        template_step, new_template=True
    )

    template_step_orm = orm_serializer.unmarshal(WorkflowTemplateStepOrm, template_step)

    for lang_version in new_lang_versions:
        crud.db_session.add(lang_version)

    crud.create(template_step_orm, refresh=True)

    response_data = orm_serializer.marshal(template_step_orm, shallow=True)
    _resolve_step_dict(response_data, "English")

    return response_data, 201


# /api/workflow/template/steps [GET]
@api_workflow_template_steps.get("", responses={200: WorkflowTemplateStepListResponse})
def get_workflow_template_steps():
    """Get All Workflow Template Steps"""
    lang = request.args.get("lang", default="English")

    template_steps = crud.read_template_steps()
    response_data = []
    for template_step in template_steps:
        d = orm_serializer.marshal(template_step)
        _resolve_step_dict(d, lang)
        response_data.append(d)

    return {"items": response_data}, 200


# /api/workflow/template/steps/<string:workflow_template_step_id>?with_form=<bool>&with_branches=<bool> [GET]
@api_workflow_template_steps.get(
    "/<string:workflow_template_step_id>", responses={200: WorkflowTemplateStepModel}
)
def get_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Get Workflow Template Step"""
    with_form = request.args.get("with_form", default=False)
    with_form = convert_query_parameter_to_bool(with_form)
    with_branches = request.args.get("with_branches", default=False)
    with_branches = convert_query_parameter_to_bool(with_branches)
    lang = request.args.get("lang", default="English")

    workflow_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if workflow_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    workflow_step = orm_serializer.marshal(workflow_step, shallow=False)
    _resolve_step_dict(workflow_step, lang)

    if not with_branches:
        del workflow_step["branches"]

    if not with_form:
        del workflow_step["form"]

    return workflow_step, 200


# /api/workflow/template/steps/<string:step_id> [PUT]
@api_workflow_template_steps.put(
    "/<string:workflow_template_step_id>", responses={200: WorkflowTemplateStepModel}
)
def update_workflow_template_step(
    path: WorkflowTemplateStepIdPath, body: WorkflowTemplateStepMultiLangModel
):
    """Update Workflow Template Step"""
    template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if template_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    workflow_template_step_changes = body.model_dump()
    workflow_template_step_changes["last_edited"] = get_current_time()

    check_branch_conditions(
        workflow_template_step_changes
    )  # If new branches are being added to the step

    workflow_template_step_changes["name_string_id"] = template_step.name_string_id
    workflow_template_step_changes["description_string_id"] = (
        template_step.description_string_id
    )

    new_lang_versions = get_new_lang_versions_for_workflow_step(
        workflow_template_step_changes, new_template=False
    )

    crud.update(
        WorkflowTemplateStepOrm,
        changes=workflow_template_step_changes,
        id=path.workflow_template_step_id,
    )

    for lang_version in new_lang_versions:
        crud.db_session.add(lang_version)
    crud.db_session.commit()

    updated_template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    updated_template_step = orm_serializer.marshal(updated_template_step, shallow=True)
    _resolve_step_dict(updated_template_step, "English")

    return updated_template_step, 200


# @api_workflow_template_steps.patch(
#     "/<string:workflow_template_step_id>", responses={204: None}
# )
# def update_workflow_template_step_patch(path: WorkflowTemplateStepIdPath, body):
#     """Update Workflow Template Step with only specific fields"""
#     workflow_template_step = crud.read(WorkflowTemplateStepOrm, id=path.workflow_template_step_id)
#
#     return '', 204


# /api/workflow/template/steps/<string:step_id> [DELETE]
@api_workflow_template_steps.delete(
    "/<string:workflow_template_step_id>", responses={204: None}
)
def delete_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Delete Workflow Template Step"""
    # For now, return success if ID matches

    template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if template_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    crud.delete_workflow_step(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    return "", 204
