from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import form_utils
from common.api_utils import (
    FormTemplateIdPath,
)
from data import marshal
from models import (
    FormTemplateOrmV2,
    LangVersionOrmV2,
)
from validation.formsV2_models import (
    FormTemplateListV2Response,
    FormTemplateResponse,
    FormTemplateVersionPath,
    GetAllFormTemplatesV2Query,
    GetFormTemplateV2Query,
    FormTemplateModel,
    ArchiveFormTemplateQuery
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
        return abort(404, description=form_template_not_found_msg.format(path.form_template_id))

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
        return abort(404, description=form_template_not_found_msg.format(path.form_template_id))

    form_template_csv: str = form_utils.getCsvFromFormTemplateV2(form_template)

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id>
@api_form_templates_v2.get(
    "/<string:form_template_id>", responses={200: FormTemplateResponse}
)
def get_form_template_v2(path: FormTemplateIdPath, query: GetFormTemplateV2Query):
    """Get a single-language or full form template (V2)"""
    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    if form_template is None:
        abort(404, description=form_template_not_found_msg.format(path.form_template_id))

    lang = query.lang

    if lang is None:
        full_template = marshal.marshal(
            form_template,
            shallow=False,
        )
        full_template = form_utils.format_template(full_template, "English")
        return full_template, 200

    available_versions = crud.read_form_template_language_versions_v2(
        form_template,
        refresh=True,
    )

    if lang not in available_versions:
        abort(
            404,
            description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {lang}",
        )

    single_lang_template = marshal.marshal(form_template, shallow=False)
    single_lang_template = form_utils.format_template(single_lang_template, lang)
    single_lang_template["questions"].sort(key=lambda q: q["order"])

    return single_lang_template, 200


# /api/forms/v2/templates/<string:form_template_id> [PUT]
@api_form_templates_v2.put(
    "/<string:form_template_id>", responses={200: FormTemplateModel}
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
    result["name"] = form_utils.resolve_string_text(form_template.classification.name_string_id) if form_template.classification else ""
    
    if result.get("classification"):
        result.pop("classification", None)
    
    return result, 201