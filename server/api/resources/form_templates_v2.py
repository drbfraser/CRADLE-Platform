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
    url_prefix="/forms/v2",
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

@api_form_templates_v2.get("", responses={200: FormTemplateListV2Response})
def get_all_form_templates_v2(query: GetAllFormTemplatesV2Query):
    """
    Get All Form Templates V2
    
    Returns all form templates. By default, only returns non-archived templates.
    """
    filters: dict = {}
    if not query.include_archived:
        filters["archived"] = False

    form_templates = crud.read_all(FormTemplateOrmV2, **filters)

    shallow = not query.include_questions
    templates_list = []

    for ft in form_templates:
        template_dict = marshal.marshal(ft, shallow)
        template_dict["name"] = resolve_template_name(ft, query.lang)

        templates_list.append(template_dict)
    
    return {
        "templates": templates_list
    }


class GetFormTemplateQuery(CradleBaseModel):
    lang: Optional[str] = None


# # /api/forms/templates/<string:form_template_id> [GET]
# @api_form_templates_v2.get("/<string:form_template_id>", responses={200: FormTemplateLang})
# def get_form_template_language_version(
#     path: FormTemplateIdPath, query: GetFormTemplateQuery
# ):
#     """Get Form Template"""
#     form_template = crud.read(FormTemplateOrm, id=path.form_template_id)
#     if form_template is None:
#         return abort(404, description=f"No form with ID: {path.form_template_id}")

#     version = query.lang
#     if version is None:
#         # admin user get template of full versions
#         blank_template = marshal.marshal(
#             form_template,
#             shallow=False,
#             if_include_versions=True,
#         )

#         return blank_template

#     available_versions = crud.read_form_template_language_versions(
#         form_template,
#         refresh=True,
#     )

#     if version not in available_versions:
#         return abort(
#             404,
#             description=f"FormTemplate(id={path.form_template_id}) doesn't have language version = {version}",
#         )

#     blank_template = marshal.marshal_template_to_single_version(form_template, version)
#     return blank_template, 200


# def handle_form_template_upload(form_template: FormTemplateUpload):
#     """
#     Common logic for handling uploaded form template. Whether it was uploaded
#     as a file, or in the request body.
#     """
#     form_template_dict = form_template.model_dump()
#     form_utils.assign_form_or_template_ids_v2(FormTemplateOrm, form_template_dict)
#     form_classification_dict = form_template_dict["classification"]
#     del form_template_dict["classification"]

#     # FormClassification is basically the name of the FormTemplate. FormTemplates can have multiple versions, and the FormClassification is used to group different versions of the same FormTemplate.
#     form_classification_orm = crud.read(
#         FormClassificationOrm,
#         name=form_classification_dict["name"],
#     )
#     # If form classification (template name) doesn't exist yet, create it
#     if form_classification_orm is None:
#         form_classification_orm = marshal.unmarshal(
#             FormClassificationOrm, form_classification_dict
#         )
#         crud.create(form_classification_orm, refresh=True)
#     else:
#         existing_template = crud.read(
#             FormTemplateOrm,
#             form_classification_id=form_classification_orm.id,
#             version=form_template.version,
#         )
#         if existing_template:
#             raise ValueError(
#                 f"Form Template with the version {form_template.version} already exists for class {form_classification_orm.name} - change the version to upload."
#             )
#         # Archive the previous active template (if any)
#         previous_template = crud.read(
#             FormTemplateOrm,
#             form_classification_id=form_classification_orm.id,
#             archived=False,
#         )
#         if previous_template is not None:
#             previous_template.archived = True
#             crud.db_session.commit()

#     # Insert the new form template
#     form_template_dict["form_classification_id"] = form_classification_orm.id

#     form_template_orm = marshal.unmarshal(FormTemplateOrm, form_template_dict)
#     form_template_orm.classification = form_classification_orm
#     crud.create(form_template_orm, refresh=True)
#     return marshal.marshal(form_template_orm, shallow=True)

