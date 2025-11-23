import json

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import ValidationError

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils
from common.api_utils import (
    FormTemplateIdPath,
)
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

    return templates_list


# /api/forms/v2/templates/<string:form_template_id>/languages [GET]
@api_form_templates_v2.get(
    "<string:form_template_id>/languages", responses={200: FormTemplateListV2Response}
)
def get_languages_for_form_template_v2(path: FormTemplateIdPath) -> list[str]:
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

    return {"langVersions": [lang.get("lang") for lang in translations]}


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

    return single_lang_template, 200


# /api/forms/v2/templates/<string:form_template_id> [PUT]
@api_form_templates_v2.put(
    "/<string:form_template_id>", responses={200: FormTemplateV2Response}
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

    return result, 201


QUESTION_FIELDS = {
    "id",
    "form_template_id",
    "order",
    "question_type",
    "question_string_id",
    "user_question_id",
    "has_comment_attached",
    "category_index",
    "required",
    "visible_condition",
    "units",
    "num_min",
    "num_max",
    "string_max_length",
    "string_max_lines",
    "allow_future_dates",
    "allow_past_dates",
}


def handle_form_template_upload(form_template: FormTemplateUploadRequest):
    """
    Common logic for handling uploaded form template. Whether it was uploaded
    as a file, or in the request body.
    """
    form_template_dict = form_template.model_dump(by_alias=False)
    form_utils.assign_form_template_ids_v2(form_template_dict)

    form_classification_dict = form_template_dict["classification"]
    form_template_dict.pop("classification", None)
    name_dict = form_classification_dict["name"]

    english_name = name_dict.get("english") or name_dict.get("English")
    if not english_name:
        raise ValueError("Form template must have an english lanuage version.")

    if form_classification_dict.get("name_string_id") is not None:
        existing_lang_row = crud.read(
            LangVersionOrmV2,
            string_id=form_classification_dict["name_string_id"],
            lang="English",
            text=english_name,
        )

    form_classification_orm = None
    if existing_lang_row:
        form_classification_orm = crud.read(
            FormClassificationOrmV2, name_string_id=existing_lang_row.string_id
        )

    # If form classification (template name) doesn't exist yet, create it
    if form_classification_orm is None:
        classification_for_orm = {
            "id": form_classification_dict.get("id"),
            "name_string_id": form_classification_dict.get("name_string_id"),
        }
        form_classification_orm = marshal.unmarshal(
            FormClassificationOrmV2, classification_for_orm
        )
        crud.create(form_classification_orm, refresh=True)

    else:
        existing_template = crud.read(
            FormTemplateOrmV2,
            form_classification_id=form_classification_orm.id,
            version=form_template.version,
        )
        if existing_template:
            raise ValueError(
                f"Form Template with version V{form_template.version} already exists for class {english_name} - change the version to upload."
            )
        # Archive the previous active template (if any)
        previous_template = crud.read(
            FormTemplateOrmV2,
            form_classification_id=form_classification_orm.id,
            archived=False,
        )
        if previous_template is not None:
            previous_template.archived = True
            crud.db_session.commit()

    # Create (or reuse) LangVersion rows for each translation
    for lang_key, text in form_classification_dict["name"].items():
        lang = lang_key.capitalize()

        existing = crud.read(
            LangVersionOrmV2,
            string_id=form_classification_dict["name_string_id"],
            lang=lang,
        )

        if not existing:
            lang_version = LangVersionOrmV2(
                string_id=form_classification_dict["name_string_id"],
                lang=lang,
                text=text,
            )
            crud.create(lang_version)

    # Insert the new form template
    form_template_dict["form_classification_id"] = form_classification_orm.id

    new_questions = []
    new_lang_versions = []  # new LangVersion rows to create

    for question in form_template_dict.get("questions", []):
        q = {k: question.get(k) for k in QUESTION_FIELDS if k in question}
        mc_opts = question.get("mc_options") or []
        q["mc_options"] = json.dumps([opt["string_id"] for opt in mc_opts])
        q["form_template_id"] = form_template_dict["id"]

        new_questions.append(q)

        q_string_id = question["question_string_id"]

        for lang, text in question["question_text"].items():
            if not form_utils.lang_version_exists(q_string_id, lang.capitalize()):
                new_lang_versions.append(
                    marshal.unmarshal(
                        LangVersionOrmV2,
                        {
                            "string_id": q_string_id,
                            "lang": lang.capitalize(),
                            "text": text,
                        },
                    )
                )

        for opt in mc_opts:
            opt_string_id = opt["string_id"]
            for lang, text in opt["translations"].items():
                if not form_utils.lang_version_exists(opt_string_id, lang.capitalize()):
                    new_lang_versions.append(
                        marshal.unmarshal(
                            LangVersionOrmV2,
                            {
                                "string_id": opt_string_id,
                                "lang": lang.capitalize(),
                                "text": text,
                            },
                        )
                    )

    crud.create_all(new_lang_versions)

    form_template_dict["questions"] = new_questions

    form_template_orm = marshal.unmarshal(FormTemplateOrmV2, form_template_dict)
    form_template_orm.classification = form_classification_orm
    crud.create(form_template_orm, refresh=True)
    created_form_template = marshal.marshal(form_template_orm, shallow=True)
    created_form_template["name"] = english_name
    if created_form_template.get("classification"):
        created_form_template.pop("classification", None)
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
        return handle_form_template_upload(body), 201

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
        return handle_form_template_upload(form_template), 201

    except ValidationError as e:
        return abort(422, description=e.errors())

    except ValueError as err:
        return abort(409, description=str(err))
