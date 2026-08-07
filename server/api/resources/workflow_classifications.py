from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import (
    WorkflowClassificationIdPath,
)
from common.commonUtil import get_uuid
from common.form_utils import (
    _extend_lang_version,
    resolve_string_text,
    upsert_multilang_versions,
)
from common.workflow_utils import (
    assign_workflow_template_or_instance_ids,
    check_workflow_classification_name_conflict,
    get_english_text,
)
from data import orm_serializer
from models import WorkflowClassificationOrm
from validation import CradleBaseModel
from validation.workflow_api_models import (
    WorkflowClassificationPatchModel,
    WorkflowClassificationUploadModel,
)
from validation.workflow_models import (
    WorkflowClassificationModel,
    WorkflowClassificationMultiLangModel,
)


# Create a response model for the list endpoint
class WorkflowClassificationListResponse(CradleBaseModel):
    items: list[WorkflowClassificationModel]


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


def _resolve_classification_dict(d: dict, lang: str) -> dict:
    """
    Mutate a marshalled classification dict in place, resolving
    name_string_id into the plain `name` text WorkflowClassificationModel
    expects (extra="forbid"), falling back to English if the requested
    language has no translation.
    """
    name_string_id = d.pop("name_string_id", None)
    if name_string_id is not None:
        d["name"] = resolve_string_text(name_string_id, lang) or resolve_string_text(
            name_string_id, "English"
        )
    return d


# /api/workflow/classifications [POST]
@api_workflow_classifications.post("", responses={201: WorkflowClassificationModel})
def create_workflow_classification(body: WorkflowClassificationUploadModel):
    """Create Workflow Classification"""
    workflow_classification_dict = body.model_dump()

    # Assign ID
    assign_workflow_template_or_instance_ids(
        WorkflowClassificationOrm, workflow_classification_dict
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

    name_map = workflow_classification_dict.pop("name")
    english_name = get_english_text(name_map)
    if not english_name:
        return abort(
            code=422,
            description="Workflow classification must have an English name.",
        )
    if check_workflow_classification_name_conflict(english_name):
        return abort(
            code=409,
            description=f"Workflow classification with name '{english_name}' already exists.",
        )

    name_string_id = get_uuid()
    workflow_classification_dict["name_string_id"] = name_string_id

    new_lang_versions = _extend_lang_version(
        name_map, name_string_id, new_template=True
    )
    for lang_version in new_lang_versions:
        crud.db_session.add(lang_version)

    workflow_classification_orm = orm_serializer.unmarshal(
        WorkflowClassificationOrm, workflow_classification_dict
    )

    crud.create(model=workflow_classification_orm, refresh=True)

    response_data = orm_serializer.marshal(
        obj=workflow_classification_orm, shallow=True
    )
    _resolve_classification_dict(response_data, "English")

    return response_data, 201


# /api/workflow/classifications [GET]
@api_workflow_classifications.get(
    "", responses={200: WorkflowClassificationListResponse}
)
def get_workflow_classifications():
    """Get All Workflow Classifications"""
    lang = request.args.get("lang", default="English")

    workflow_classifications = crud.read_workflow_classifications()

    response_data = []
    for classification in workflow_classifications:
        d = orm_serializer.marshal(classification, shallow=True)
        _resolve_classification_dict(d, lang)
        response_data.append(d)

    return {"items": response_data}, 200


# /api/workflow/classifications/<string:workflow_classification_id> [GET]
@api_workflow_classifications.get(
    "/<string:workflow_classification_id>", responses={200: WorkflowClassificationModel}
)
def get_workflow_classification(path: WorkflowClassificationIdPath):
    """Get Workflow Classification"""
    lang = request.args.get("lang", default="English")

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

    response_data = orm_serializer.marshal(obj=workflow_classification, shallow=True)
    _resolve_classification_dict(response_data, lang)

    return response_data, 200


# /api/workflow/classifications/<string:workflow_classification_id> [PUT]
@api_workflow_classifications.put(
    "/<string:workflow_classification_id>", responses={200: WorkflowClassificationModel}
)
def update_workflow_classification(
    path: WorkflowClassificationIdPath, body: WorkflowClassificationMultiLangModel
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

    name_map = body.name.root if hasattr(body.name, "root") else body.name
    english_name = get_english_text(name_map)
    if not english_name:
        return abort(
            code=422,
            description="Workflow classification must have an English name.",
        )
    if check_workflow_classification_name_conflict(
        english_name, exclude_string_id=workflow_classification.name_string_id
    ):
        return abort(
            code=409,
            description=f"Workflow classification with name '{english_name}' already exists.",
        )

    upsert_multilang_versions(workflow_classification.name_string_id, name_map)
    crud.db_session.commit()

    if body.collection_id != workflow_classification.collection_id:
        crud.update(
            WorkflowClassificationOrm,
            changes={"collection_id": body.collection_id},
            id=path.workflow_classification_id,
        )

    response_data = crud.read(
        WorkflowClassificationOrm, id=path.workflow_classification_id
    )
    response_data = orm_serializer.marshal(response_data, shallow=True)
    _resolve_classification_dict(response_data, "English")

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
        _resolve_classification_dict(response_data, "English")
        return response_data, 200

    name_map = workflow_classification_changes.pop("name", None)
    if name_map is not None:
        english_name = get_english_text(name_map)
        if not english_name:
            return abort(
                code=422,
                description="Workflow classification must have an English name.",
            )
        if check_workflow_classification_name_conflict(
            english_name, exclude_string_id=workflow_classification.name_string_id
        ):
            return abort(
                code=409,
                description=f"Workflow classification with name '{english_name}' already exists.",
            )

        upsert_multilang_versions(workflow_classification.name_string_id, name_map)
        crud.db_session.commit()

    # Apply any remaining changes (e.g. collection_id)
    if workflow_classification_changes:
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
    _resolve_classification_dict(response_data, "English")

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
