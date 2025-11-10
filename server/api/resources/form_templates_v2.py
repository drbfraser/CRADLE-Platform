import json
import logging
from typing import Optional

from flask import abort, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import Field, ValidationError

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils
from common.commonUtil import get_uuid
from common.api_utils import (
    FormTemplateIdPath,
)
from data import marshal
from enums import ContentTypeEnum, RoleEnum
from models import FormClassificationOrm, FormTemplateOrm
from service import serialize
from validation import CradleBaseModel
from validation.file_upload import FileUploadForm

logger = logging.getLogger(__name__)

api_form_templates_v2 = APIBlueprint(
    name="form_templates_v2",
    import_name=__name__,
    url_prefix="/forms/v2/templates",
    abp_tags=[Tag(name="Form V2 API", description="Form V2 CRUD and testing endpoints")],
    abp_security=[{"jwt": []}],
)

from models import (
    FormClassificationOrmV2,
    FormTemplateOrmV2,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormAnswerOrmV2,
    LangVersionOrmV2,
)

from validation.formsV2_models import (
    FormClassificationV2Response,
    FormTemplateListV2Response,
    FormTemplateV2Response,
    GetFormTemplateV2Query,
    GetAllFormTemplatesV2Query,
    FormTemplateResponse
)


def resolve_template_name(template: FormTemplateOrmV2, lang: str = "English") -> Optional[str]:
    """
    Resolve the template name by looking up the classification's name_string_id.
    
    :param template: Form template instance
    :param lang: Language code for translation
    :return: Translated name or None if not found
    """
    if not template.classification:
        return None
    
    name_translation = crud.read(
        LangVersionOrmV2,
        string_id=template.classification.name_string_id,
        lang=lang,
    )
    
    return name_translation.text if name_translation else None

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
        template_dict["name"] = resolve_template_name(ft, query.lang)

        templates_list.append(template_dict)
    
    return templates_list


class GetFormTemplateQuery(CradleBaseModel):
    lang: Optional[str] = None


# /api/forms/v2/templates/<string:form_template_id>/versions [GET]
@api_form_templates_v2.get("<string:form_template_id>/versions", responses={200: FormTemplateListV2Response})
def get_languages_for_form_template_v2(path: FormTemplateIdPath) -> list[str]:
    """
    Returns all available languages for a given FormTemplateV2,
    based on the classification's name_string_id translations.
    """
    template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    if not template or not template.classification:
        return []

    classification = template.classification

    # Get all translations for this classification name
    translations = (
        crud.db_session.query(LangVersionOrmV2.lang)
        .filter(LangVersionOrmV2.string_id == classification.name_string_id)
        .distinct()
        .all()
    )

    return {
        'langVersions': [lang for (lang,) in translations]
    }

# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv
class FormTemplateVersionPath(FormTemplateIdPath):
    version: str = Field(..., description="Form Template version.")


# /api/forms/v2/templates/<string:form_template_id>/versions/<string:version>/csv [GET]
@api_form_templates_v2.get("/<string:form_template_id>/versions/<string:version>/csv",
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
        return abort(404, description=f"No form with ID: {path.form_template_id}")

    form_template_csv: str = form_utils.getCsvFromFormTemplateV2(form_template)

    response = make_response(form_template_csv)
    response.headers["Content-Disposition"] = "attachment; filename=form_template.csv"
    response.headers["Content-Type"] = "text/csv"
    return response


# /api/forms/templates/<string:form_template_id>
class GetFormTemplateQuery(CradleBaseModel):
    lang: Optional[str] = None


@api_form_templates_v2.get("/<string:form_template_id>", responses={200: FormTemplateResponse})
def get_form_template_v2(path: FormTemplateIdPath, query: GetFormTemplateQuery):
    """Get a single-language or full form template (V2)"""

    form_template = crud.read(FormTemplateOrmV2, id=path.form_template_id)
    if form_template is None:
        abort(404, description=f"Abe oooo - No form with ID: {path.form_template_id}")

    version = query.lang

    if version is None:
        full_template = marshal.marshal(
            form_template,
            shallow=False,
            if_include_versions=True,
        )
        return full_template, 200

    available_versions = crud.read_form_template_language_versions_v2(
        form_template,
        refresh=True,
    )

    logger.debug("%s", available_versions)

    if version not in available_versions:
        abort(
            404,
            description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {version}",
        )

    single_lang_template = marshal.marshal_template_to_single_version(
        form_template, version
    )
    return single_lang_template, 200
