import json

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import ValidationError

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils
from data import marshal
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

api_form_templates_v2 = APIBlueprint(
    name="form_templates_v2",
    import_name=__name__,
    url_prefix="/forms/v2/templates",
    abp_tags=[
        Tag(name="Form V2 API", description="Form V2 CRUD and testing endpoints")
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
    filters: dict = {}

    filters["archived"] = 1 if query.include_archived else 0

    form_templates = crud.read_all(FormTemplateOrmV2, **filters)

    templates_list = []

    for ft in form_templates:
        template_dict = marshal.marshal(ft, shallow=True)
        template_dict["name"] = (
            form_utils.resolve_string_text(ft.classification.name_string_id, query.lang)
            if ft.classification
            else None
        )
        if template_dict.get("classification"):
            template_dict.pop("classification", None)

        templates_list.append(template_dict)

    response = {"templates": templates_list}

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
    template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    if not template or not template.classification:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    classification = template.classification

    # Get all translations for this classification name
    filters: dict = {}

    filters["string_id"] = classification.name_string_id

    translations = crud.read_all(LangVersionOrmV2, **filters)
    translations = [marshal.marshal(lang) for lang in translations]
    response = {
        "langVersions": [lang.get("lang") for lang in translations],
    }

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

    form_template = crud.read(
        FormTemplateOrmV2,
        **filters,
    )

    if form_template is None:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    form_template_csv: str = form_utils.getCsvFromFormTemplateV2(form_template)

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id> [GET]
@api_form_templates_v2.get("/<string:form_template_id>", responses={200: FormTemplate})
def get_form_template_v2(path: FormTemplateIdPath, query: GetFormTemplateV2Query):
    """Get a single-language or full form template (V2)"""
    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    if form_template is None:
        abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    lang = query.lang.capitalize() if query.lang else None

    available_langs = crud.read_form_template_language_versions_v2(
        form_template,
        refresh=True,
    )

    if lang is None:
        full_template = marshal.marshal(
            form_template,
            shallow=False,
        )
        full_template = form_utils.format_template(full_template, available_langs)
        return full_template, 200

    if lang not in available_langs:
        abort(
            404,
            description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {lang}",
        )

    single_lang_template = marshal.marshal(form_template, shallow=False)
    single_lang_template = form_utils.format_template(single_lang_template, [lang])
    single_lang_template["questions"].sort(key=lambda q: q["order"])

    return FormTemplate(**single_lang_template).model_dump(), 200


# /api/forms/v2/templates/<string:form_template_id> [PUT]
@api_form_templates_v2.put(
    "/<string:form_template_id>", responses={201: FormTemplateV2Response}
)
def archive_form_template_v2(path: FormTemplateIdPath, query: ArchiveFormTemplateQuery):
    """Archive or unarchive a Form Template"""
    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)

    if form_template is None:
        return abort(
            404, description=form_template_not_found_msg.format(path.form_template_id)
        )

    form_template.archived = query.archived
    crud.db_session.commit()
    crud.db_session.refresh(form_template)

    result = marshal.marshal(form_template, shallow=True)
    result["name"] = (
        form_utils.resolve_string_text(form_template.classification.name_string_id)
        if form_template.classification
        else ""
    )

    if result.get("classification"):
        result.pop("classification", None)

    return FormTemplateV2Response(**result).model_dump(), 201


def handle_form_template_upload(
    form_template: FormTemplateUploadRequest,
) -> FormTemplateV2Response:
    """
    Common logic for handling uploaded form template. Whether it was uploaded
    as a file, or in the request body.
    """
    # Boolean to check whether user is creating a new template or editing an existing one
    new_template: bool = True

    if form_template.id is not None and crud.read(
        FormTemplateOrmV2, id=form_template.id
    ):
        new_template = False

    form_utils.assign_form_template_ids_v2(form_template)

    form_template_dict = form_template.model_dump(by_alias=False)

    form_classification_dict = form_template_dict.get("classification")
    form_template_dict.pop("classification", None)

    name_dict = form_classification_dict.get("name")
    english_name = name_dict.get("english") or name_dict.get("English")

    archive_previous_template, form_classification_orm = (
        form_utils.handle_model_existence(
            new_template=new_template,
            classification_dict=form_classification_dict,
            version=form_template_dict.get("version"),
            english_name=english_name,
        )
    )

    new_questions, new_lang_versions = form_utils.get_new_lang_versions_and_questions(
        form_classification_dict, new_template, form_template_dict.get("questions")
    )

    form_template_dict["questions"] = new_questions
    form_template_dict["form_classification_id"] = form_classification_dict.get("id")
    form_template_orm = marshal.unmarshal(FormTemplateOrmV2, form_template_dict)

    crud.create_all(new_lang_versions, autocommit=False)

    if not form_classification_orm:
        form_classification_orm = FormClassificationOrmV2(
            id=form_classification_dict.get("id"),
            name_string_id=form_classification_dict.get("name_string_id"),
        )
        crud.create(form_classification_orm, refresh=True)

    if archive_previous_template:
        previous_template = crud.read(
            FormTemplateOrmV2,
            form_classification_id=form_classification_dict.get("id"),
            archived=False,
        )
        if previous_template is not None:
            previous_template.archived = True

    form_template_orm.classification = form_classification_orm
    crud.create(form_template_orm, refresh=True)

    created_form_template = marshal.marshal(form_template_orm, shallow=True)
    created_form_template["name"] = english_name

    return created_form_template


# /api/forms/v2/templates/body [POST]
@api_form_templates_v2.post("/body", responses={201: FormTemplateV2Response})
@roles_required([RoleEnum.ADMIN])
def upload_form_template_body(body: FormTemplateUploadRequest):
    """
    Upload Form Template VIA Request Body
    Accepts Form Template through the request body, rather than as a file.
    """
    try:
        return FormTemplateV2Response(
            **(handle_form_template_upload(body))
        ).model_dump(), 201

    except ValueError as err:
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

    if file.content_type == ContentTypeEnum.JSON.value:
        try:
            file_contents = json.loads(file_str)
        except json.JSONDecodeError:
            return abort(415, description="File content is not valid JSON format")
    else:
        return abort(422, description="Invalid content-type.")

    try:
        form_template = FormTemplateUploadRequest(**file_contents)
        return FormTemplateV2Response(
            **(handle_form_template_upload(form_template))
        ).model_dump(), 201

    except ValidationError as e:
        return abort(422, description=e.errors())

    except ValueError as err:
        return abort(409, description=str(err))
