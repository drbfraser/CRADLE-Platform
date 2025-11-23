from typing import Optional

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils
from common.api_utils import (
    FormClassificationIdPath,
)
from common.commonUtil import get_uuid
from data import marshal
from enums import RoleEnum
from models import FormClassificationOrmV2, FormTemplateOrmV2, LangVersionOrmV2
from validation.formsV2_models import (
    FormClassification,
    FormClassificationList,
    FormTemplateList,
)

# /api/forms/classifications
api_form_classifications_v2 = APIBlueprint(
    name="form_classifications_v2",
    import_name=__name__,
    url_prefix="/forms/v2/classifications",
    abp_tags=[Tag(name="Form Classifications", description="")],
    abp_security=[{"jwt": []}],
)


# /api/forms/v2/classifications [GET]
@api_form_classifications_v2.get("", responses={200: FormClassificationList})
def get_all_form_classifications():
    """Get All Form Classifications"""
    form_classifications = crud.read_all(FormClassificationOrmV2)
    out = []

    for fc in form_classifications:
        d = marshal.marshal(fc, shallow=True)
        d["name"] = {"english": form_utils.resolve_string_text(d.get("name_string_id"))}

        out.append(d)

    return FormClassificationList(classifications=out).model_dump(), 200


def check_name_conflict(english_name: str, exclude_string_id: Optional[str] = None):
    """
    Check if a FormClassification with the same English name exists.
    :param english_name: English text to check
    :param exclude_string_id: string_id to ignore (used for PUT)
    :raises: abort(409) if conflict exists
    """
    # Use read_all instead of read
    existing_langs = crud.read_all(LangVersionOrmV2, lang="English", text=english_name)

    for existing_lang in existing_langs:
        if exclude_string_id and existing_lang.string_id == exclude_string_id:
            continue

        fc = crud.read(FormClassificationOrmV2, name_string_id=existing_lang.string_id)
        if fc:
            abort(
                409, f"Form Classification with name=({english_name}) already exists."
            )


def upsert_multilang_versions(name_string_id: str, name_map: dict[str, str]):
    """
    Create or update LangVersionOrmV2 rows for all languages in name_map.
    :param name_string_id: shared string_id for this multilingual bundle
    :param name_map: dict of language -> text
    """
    for lang_key, text in name_map.items():
        lang = lang_key.strip().title()

        lv: LangVersionOrmV2 = crud.read(
            LangVersionOrmV2, string_id=name_string_id, lang=lang
        )
        if lv:
            lv.text = text  # update existing
        else:
            lv = LangVersionOrmV2(string_id=name_string_id, lang=lang, text=text)
            crud.create(lv)


# /api/forms/v2/classifications [POST]
@api_form_classifications_v2.post("")
@roles_required([RoleEnum.ADMIN])
def create_form_classification(body: FormClassification):
    """Create Form Classification"""
    name_map = body.name.root
    english_name = name_map.get("english") or name_map.get("English")
    if not english_name:
        abort(400, "English name is required.")

    check_name_conflict(english_name)  # no exclude_string_id for creation

    name_string_id = get_uuid()
    upsert_multilang_versions(name_string_id, name_map)

    fc_orm = FormClassificationOrmV2(id=get_uuid(), name_string_id=name_string_id)
    crud.create(fc_orm, refresh=True)

    return marshal.marshal(fc_orm, shallow=True), 201


# /api/forms/v2/classifications/<string:form_classification_id> [GET]
@api_form_classifications_v2.get(
    "/<string:form_classification_id>", responses={200: FormClassification}
)
def get_form_classification(path: FormClassificationIdPath):
    """Get Form Classification"""
    form_classification: FormClassificationOrmV2 = crud.read(
        FormClassificationOrmV2, id=path.form_classification_id
    )

    if form_classification is None:
        return abort(
            400,
            description=f"No Form Classification with id=({path.form_classification_id}) found.",
        )

    form_classification = marshal.marshal(form_classification, shallow=True)

    available_langs: list[LangVersionOrmV2] = form_utils.read_all_translations(
        form_classification.get("name_string_id")
    )
    form_classification["name"] = {lv.lang: lv.text for lv in available_langs}

    return form_classification, 200


# /api/forms/v2/classifications/<string:form_classification_id> [PUT]
@api_form_classifications_v2.put(
    "/<string:form_classification_id>", responses={200: FormClassification}
)
@roles_required([RoleEnum.ADMIN])
def edit_form_classification_name(
    path: FormClassificationIdPath, body: FormClassification
):
    """Edit Form Classification Name"""
    if body.id != path.form_classification_id:
        abort(400, "Cannot change id.")

    fc_orm: FormClassificationOrmV2 = crud.read(FormClassificationOrmV2, id=body.id)
    if not fc_orm:
        abort(404, f"No Form Classification with id=({body.id}) found.")

    name_map = body.name.root
    english_name = name_map.get("english") or name_map.get("English")
    if not english_name:
        abort(400, "English name is required.")

    check_name_conflict(english_name, exclude_string_id=fc_orm.name_string_id)
    upsert_multilang_versions(fc_orm.name_string_id, name_map)

    crud.db_session.commit()
    crud.db_session.refresh(fc_orm)

    return marshal.marshal(fc_orm, shallow=True), 200


# /api/forms/v2/classifications/summary [GET]
@api_form_classifications_v2.get("/summary", responses={200: FormTemplateList})
def get_form_classification_summary():
    """
    Get Form Classification Summary
    Get a list containing the most recent Form Template version of each Form Classification.
    """
    form_classifications = crud.read_all(FormClassificationOrmV2)
    valid_templates = []

    for form_classification in form_classifications:
        possible_templates = crud.find(
            FormTemplateOrmV2,
            FormTemplateOrmV2.form_classification_id == form_classification.id,
        )

        if len(possible_templates) == 0:
            continue

        latest_template = None
        for possible_template in possible_templates:
            if latest_template is None or (
                possible_template.date_created >= latest_template.date_created
                and possible_template.archived == False
            ):
                latest_template = possible_template

        if latest_template is not None:
            valid_templates.append(latest_template)

    marshaled_templates = []
    for template in valid_templates:
        marshaled_templates.append(marshal.marshal(template, shallow=False))
    return marshaled_templates, 200


# /api/forms/v2/classifications/<string:form_classification_id>/templates [GET]
@api_form_classifications_v2.get(
    "/<string:form_classification_id>/templates", responses={200: FormTemplateList}
)
def get_form_classification_templates(path: FormClassificationIdPath):
    """
    Get Form Classification Templates
    Get a list of all Form Template versions of a particular Form Classification.
    """
    form_templates = crud.read_all(
        FormTemplateOrmV2,
        form_classification_id=path.form_classification_id,
    )

    out = []

    for ft in form_templates:
        d = marshal.marshal(ft, shallow=True)
        d["classification"]["name"] = {
            "english": form_utils.resolve_string_text(
                d["classification"].get("name_string_id")
            )
        }

        out.append(d)

    return out, 200
