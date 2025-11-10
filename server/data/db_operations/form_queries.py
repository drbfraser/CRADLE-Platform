"""
form_queries.py

This module provides database query helpers related to forms and their templates.
It focuses on retrieving form questions and supported language versions.

Functions:
    - read_questions(model: QuestionOrm, form_template_id: Optional[int] = None) -> List[QuestionOrm]:
        Fetches questions for a given form template or all questions if no template ID is provided.

    - read_form_template_language_versions(model: FormTemplateOrm, refresh: bool = False) -> List[str]:
        Retrieves the list of available language versions for a form template. Optionally refreshes
        the template from the database to ensure validity.
"""

import logging
from typing import List, Optional

from common.form_utils import filter_template_questions_orm
from data.db_operations import db_session
from models import FormTemplateOrm, FormTemplateOrmV2, LangVersionOrmV2, QuestionOrm

logger = logging.getLogger(__name__)


def read_questions(
    model: QuestionOrm,
    form_template_id: Optional[int] = None,
) -> List[QuestionOrm]:
    """
    Queries the database for questions

    :param form_template_id: ID of form templates; by default this filter is not applied

    :return: A list of questions
    """
    query = db_session.query(model)

    if form_template_id:
        query = query.filter(model.form_template_id == form_template_id)

    return query.all()


def read_form_template_language_versions(
    model: FormTemplateOrm, refresh=False
) -> List[str]:
    """
    Queries the template for current language versions

    :param model: FormTemplate model (here we assume the template is valid)
    :param refresh: refresh the model in case it is invalid for later use

    :return: A list of lang version texts
    """
    model = filter_template_questions_orm(model)
    lang_versions = model.questions[0].lang_versions
    if refresh:
        db_session.refresh(model)
    return [v.lang for v in lang_versions]


def read_form_template_language_versions_v2(
    model: FormTemplateOrmV2, refresh: bool = False
) -> list[str]:
    """
    Queries the template for its available language versions (V2)

    In V2, the classification stores a name_string_id which references LangVersionOrmV2 entries.
    Follows the same refresh logic as V1.
    """
    if refresh:
        db_session.refresh(model)

    classification = model.classification
    if not classification or not classification.name_string_id:
        return []

    # fetch all LangVersionOrmV2 entries for this classification name
    lang_versions = (
        db_session.query(LangVersionOrmV2)
        .filter(LangVersionOrmV2.string_id == classification.name_string_id)
        .all()
    )
    return [lv.lang for lv in lang_versions]
