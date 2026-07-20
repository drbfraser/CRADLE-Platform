import json
import logging

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import ValidationError

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils
from data import orm_serializer
from enums import ContentTypeEnum, RoleEnum
from models import (
    FormClassificationOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)
from validation.file_upload import FileUploadForm
from validation.formsV2_models import (
    ArchiveFormTemplateQuery,
    FormTemplate,
    FormTemplateIdPath,
    FormTemplateLangList,
    FormTemplateListV2Response,
    FormTemplateUploadRequest,
    FormTemplateV2Response,
    FormTemplateVersionPath,
    GetAllFormTemplatesV2Query,
    GetFormTemplateV2Query,
)

LOGGER = logging.getLogger(__name__)

api_form_templates_v2 = APIBlueprint(
    name="form_templates_v2",
    import_name=__name__,
    url_prefix="/forms/v2/templates",
    abp_tags=[
        Tag(
            name="Form Templates V2 API",
            description="Endpoints to get/create/archive/list form templates",
        )
    ],
    abp_security=[{"jwt": []}],
)

form_template_not_found_msg = "No form template found with ID: {}"


# /api/forms/v2/templates [GET]
@api_form_templates_v2.get("", responses={200: FormTemplateListV2Response})
def get_all_form_templates_v2(query: GetAllFormTemplatesV2Query):
    """
    Get All Form Templates V2

    Returns all form templates. By default, only returns non-archived templates.
    """
    LOGGER.info(
        "get_all_form_templates_v2: include_archived=%s lang=%s",
        query.include_archived,
        query.lang,
    )
    filters: dict = {}

    filters["archived"] = 1 if query.include_archived else 0

    form_templates = crud.read_all(FormTemplateOrmV2, **filters)
    LOGGER.info(
        "get_all_form_templates_v2: filters=%s found_count=%d",
        filters,
        len(form_templates),
    )

    templates_list = []

    for ft in form_templates:
        template_dict = orm_serializer.marshal(ft, shallow=True)
        template_dict["name"] = (
            form_utils.resolve_string_text(ft.classification.name_string_id, query.lang)
            if ft.classification
            else None
        )
        if template_dict.get("classification"):
            template_dict.pop("classification", None)

        templates_list.append(template_dict)

    response = {"templates": templates_list}
    LOGGER.info(
        "get_all_form_templates_v2: returning %d templates", len(templates_list)
    )

    return FormTemplateListV2Response(**response).model_dump(), 200


# /api/forms/v2/templates/<string:form_template_id>/languages [GET]
@api_form_templates_v2.get(
    "<string:form_template_id>/languages", responses={200: FormTemplateLangList}
)
def get_languages_for_form_template_v2(path: FormTemplateIdPath):
    """
    Returns all available languages for a given FormTemplateV2,
    based on the classification's name_string_id translations.
    """
    LOGGER.info(
        "get_languages_for_form_template_v2: form_template_id=%s",
        path.form_template_id,
    )
    template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    LOGGER.info(
        "get_languages_for_form_template_v2: found=%s has_classification=%s",
        template is not None,
        bool(template and template.classification),
    )
    if not template or not template.classification:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    classification = template.classification

    # Get all translations for this classification name
    filters: dict = {}

    filters["string_id"] = classification.name_string_id

    translations = crud.read_all(LangVersionOrmV2, **filters)
    translations = [orm_serializer.marshal(lang) for lang in translations]
    response = {
        "langVersions": [lang.get("lang") for lang in translations],
    }
    LOGGER.info(
        "get_languages_for_form_template_v2: name_string_id=%s langVersions=%s",
        classification.name_string_id,
        response["langVersions"],
    )

    return FormTemplateLangList(**response).model_dump(), 200


# /api/forms/v2/templates/<string:form_template_id>/versions/<string:version>/csv [GET]
@api_form_templates_v2.get(
    "/<string:form_template_id>/versions/<string:version>/csv",
    responses={200: {"content": {"text/csv": {"schema": {"type": "string"}}}}},
)
def get_form_template_version_as_csv_v2(path: FormTemplateVersionPath):
    """Get Form Template Version as CSV"""
    filters: dict = {
        "id": path.form_template_id,
        "version": path.version,
    }
    LOGGER.info("get_form_template_version_as_csv_v2: filters=%s", filters)

    form_template = crud.read(
        FormTemplateOrmV2,
        **filters,
    )
    LOGGER.info(
        "get_form_template_version_as_csv_v2: found=%s", form_template is not None
    )

    if form_template is None:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    form_template_csv: str = form_utils.getCsvFromFormTemplateV2(form_template)
    LOGGER.info(
        "get_form_template_version_as_csv_v2: generated csv length=%d",
        len(form_template_csv),
    )

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id> [GET]
@api_form_templates_v2.get("/<string:form_template_id>", responses={200: FormTemplate})
def get_form_template_v2(path: FormTemplateIdPath, query: GetFormTemplateV2Query):
    """Get a single-language or full form template (V2)"""
    LOGGER.info(
        "get_form_template_v2: form_template_id=%s query_lang=%s",
        path.form_template_id,
        query.lang,
    )
    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    LOGGER.info("get_form_template_v2: found=%s", form_template is not None)
    if form_template is None:
        abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    lang = query.lang.capitalize() if query.lang else None

    available_langs = crud.read_form_template_language_versions_v2(
        form_template,
        refresh=True,
    )
    LOGGER.info(
        "get_form_template_v2: resolved_lang=%s available_langs=%s",
        lang,
        available_langs,
    )

    if lang is None:
        full_template = orm_serializer.marshal(
            form_template,
            shallow=False,
        )
        full_template = form_utils.format_template(full_template, available_langs)
        LOGGER.info("get_form_template_v2: returning full multi-lang template")
        return full_template, 200

    if lang not in available_langs:
        LOGGER.info(
            "get_form_template_v2: requested lang=%s not in available_langs=%s",
            lang,
            available_langs,
        )
        abort(
            404,
            description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {lang}",
        )

    single_lang_template = orm_serializer.marshal(form_template, shallow=False)
    single_lang_template = form_utils.format_template(single_lang_template, [lang])
    single_lang_template["questions"].sort(key=lambda q: q["order"])
    LOGGER.info(
        "get_form_template_v2: returning single-lang template lang=%s question_count=%d",
        lang,
        len(single_lang_template["questions"]),
    )

    return FormTemplate(**single_lang_template).model_dump(), 200


# /api/forms/v2/templates/<string:form_template_id> [PUT]
@api_form_templates_v2.put(
    "/<string:form_template_id>", responses={201: FormTemplateV2Response}
)
def archive_form_template_v2(path: FormTemplateIdPath, query: ArchiveFormTemplateQuery):
    """Archive or unarchive a Form Template"""
    LOGGER.info(
        "archive_form_template_v2: form_template_id=%s requested_archived=%s",
        path.form_template_id,
        query.archived,
    )
    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    LOGGER.info("archive_form_template_v2: found=%s", form_template is not None)

    if form_template is None:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    LOGGER.info(
        "archive_form_template_v2: archived %s -> %s",
        form_template.archived,
        query.archived,
    )
    form_template.archived = query.archived
    crud.db_session.commit()
    crud.db_session.refresh(form_template)

    result = orm_serializer.marshal(form_template, shallow=True)
    result["name"] = (
        form_utils.resolve_string_text(form_template.classification.name_string_id)
        if form_template.classification
        else ""
    )

    if result.get("classification"):
        result.pop("classification", None)

    LOGGER.info("archive_form_template_v2: result=%s", result)

    return FormTemplateV2Response(**result).model_dump(), 201


def handle_form_template_upload(
    form_template: FormTemplateUploadRequest,
) -> FormTemplateV2Response:
    """
    Common logic for handling uploaded form template. Whether it was uploaded
    as a file, or in the request body.
    """
    LOGGER.info(
        "handle_form_template_upload: incoming form_template=%s",
        form_template.model_dump(),
    )
    # Boolean to check whether user is creating a new template or editing an existing one
    new_template: bool = True

    if form_template.id is not None and crud.read(
        FormTemplateOrmV2, id=form_template.id
    ):
        new_template = False
    LOGGER.info(
        "handle_form_template_upload: template_id=%s new_template=%s",
        form_template.id,
        new_template,
    )

    form_utils.assign_form_template_ids_v2(form_template)

    form_template_dict = form_template.model_dump(by_alias=False)

    form_classification_dict = form_template_dict.get("classification")
    form_template_dict.pop("classification", None)

    name_dict = form_classification_dict.get("name")
    english_name = name_dict.get("english") or name_dict.get("English")
    LOGGER.info(
        "handle_form_template_upload: classification=%s english_name=%s",
        form_classification_dict,
        english_name,
    )

    archive_previous_template, form_classification_orm = (
        form_utils.handle_model_existence(
            new_template=new_template,
            classification_dict=form_classification_dict,
            version=form_template_dict.get("version"),
            english_name=english_name,
        )
    )
    LOGGER.info(
        "handle_form_template_upload: archive_previous_template=%s "
        "existing_classification_orm=%s",
        archive_previous_template,
        form_classification_orm is not None,
    )

    new_questions, new_lang_versions = form_utils.get_new_lang_versions_and_questions(
        form_classification_dict, new_template, form_template_dict.get("questions")
    )
    LOGGER.info(
        "handle_form_template_upload: new_question_count=%d new_lang_version_count=%d",
        len(new_questions),
        len(new_lang_versions),
    )

    form_template_dict["questions"] = new_questions
    form_template_dict["form_classification_id"] = form_classification_dict.get("id")
    form_template_orm = orm_serializer.unmarshal(FormTemplateOrmV2, form_template_dict)

    crud.db_session.commit()
    try:
        crud.create_all(new_lang_versions, autocommit=False)

        if not form_classification_orm:
            form_classification_orm = FormClassificationOrmV2(
                id=form_classification_dict.get("id"),
                name_string_id=form_classification_dict.get("name_string_id"),
            )
            crud.create(form_classification_orm, refresh=True, autocommit=False)
            LOGGER.info(
                "handle_form_template_upload: created new classification id=%s",
                form_classification_orm.id,
            )

        if archive_previous_template:
            previous_template = crud.read(
                FormTemplateOrmV2,
                form_classification_id=form_classification_dict.get("id"),
                archived=False,
            )
            if previous_template is not None:
                previous_template.archived = True
                LOGGER.info(
                    "handle_form_template_upload: archived previous template id=%s",
                    previous_template.id,
                )

        form_template_orm.classification = form_classification_orm
        crud.create(form_template_orm, refresh=True, autocommit=False)

        created_form_template = orm_serializer.marshal(form_template_orm, shallow=True)
        created_form_template["name"] = english_name

        crud.db_session.commit()
        LOGGER.info(
            "handle_form_template_upload: committed, result=%s", created_form_template
        )
        return created_form_template
    except Exception:
        LOGGER.exception("handle_form_template_upload: rolling back due to error")
        crud.db_session.rollback()
        raise


# /api/forms/v2/templates/body [POST]
@api_form_templates_v2.post("/body", responses={201: FormTemplateV2Response})
@roles_required([RoleEnum.ADMIN])
def upload_form_template_body(body: FormTemplateUploadRequest):
    """
    Upload Form Template VIA Request Body
    Accepts Form Template through the request body, rather than as a file.
    """
    LOGGER.info("upload_form_template_body: incoming body=%s", body.model_dump())
    try:
        result = (
            FormTemplateV2Response(**(handle_form_template_upload(body))).model_dump(),
            201,
        )
        LOGGER.info("upload_form_template_body: success result=%s", result[0])
        return result

    except ValueError as err:
        LOGGER.info("upload_form_template_body: ValueError=%s", err)
        return abort(409, description=str(err))


# /api/forms/v2/templates [POST]
@api_form_templates_v2.post("", responses={201: FormTemplateV2Response})
@roles_required([RoleEnum.ADMIN])
def upload_form_template_file(form: FileUploadForm):
    """
    Upload Form Template VIA a JSON File
    Accepts Form Template as a file.
    Supports `.json` file format only.
    """
    file_contents = {}
    file = form.file
    file_str = str(file.stream.read(), "utf-8")
    LOGGER.info(
        "upload_form_template_file: filename=%s content_type=%s",
        file.filename,
        file.content_type,
    )

    if file.content_type == ContentTypeEnum.JSON.value:
        try:
            file_contents = json.loads(file_str)
        except json.JSONDecodeError:
            LOGGER.info("upload_form_template_file: invalid JSON in uploaded file")
            return abort(415, description="File content is not valid JSON format")
    else:
        return abort(422, description="Invalid content-type.")

    try:
        form_template = FormTemplateUploadRequest(**file_contents)
        result = (
            FormTemplateV2Response(
                **(handle_form_template_upload(form_template))
            ).model_dump(),
            201,
        )
        LOGGER.info("upload_form_template_file: success result=%s", result[0])
        return result

    except ValidationError as e:
        LOGGER.info("upload_form_template_file: ValidationError=%s", e.errors())
        return abort(422, description=e.errors())

    except ValueError as err:
        LOGGER.info("upload_form_template_file: ValueError=%s", err)
        return abort(409, description=str(err))
