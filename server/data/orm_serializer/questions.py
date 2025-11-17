import json
import logging
from typing import List

from models import (
    FormQuestionTemplateOrmV2,
    LangVersionOrmV2,
    QuestionLangVersionOrm,
    QuestionOrm,
)

from .utils import __load, __pre_process

LOGGER = logging.getLogger(__name__)


def __marshal_lang_version(v: QuestionLangVersionOrm) -> dict:
    """
    Serialize a ``QuestionLangVersionOrm``; cast ``mc_options`` and drop backrefs.

    :param v: Language-version instance to serialize.
    :return: Language-version dictionary with ``mc_options`` normalized.
    """
    d = vars(v).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("question"):
        del d["question"]
    # Remove mc_options if default empty list; otherwise parse from JSON string
    if d.get("mc_options") == "[]":
        del d["mc_options"]
    else:
        # marshal mc_options to json dict
        d["mc_options"] = json.loads(d["mc_options"])

    return d


def __marshal_lang_version_v2(lv: LangVersionOrmV2) -> dict:
    """
    Serialize a ``LangVersionOrmV2`` translation entry.

    :param lv: Language version instance to serialize.
    :return: Translation dictionary with string_id, lang, and text.
    """
    d = vars(lv).copy()
    __pre_process(d)
    return d


def __marshal_question(q: QuestionOrm, if_include_versions: bool) -> dict:
    """
    Serialize a ``QuestionOrm``; parse JSON fields and optionally include versions.

    :param q: Question instance to serialize.
    :param if_include_versions: If ``True``, include ``lang_versions``.
    :return: Question dictionary with parsed JSON fields.
    """
    d = vars(q).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("form"):
        del d["form"]
    if d.get("form_template"):
        del d["form_template"]
    if d.get("category_question"):
        del d["category_question"]

    # marshal visible_conditions, mc_options, answers to json dict
    visible_condition = d["visible_condition"]
    d["visible_condition"] = json.loads(visible_condition)
    mc_options = d["mc_options"]
    d["mc_options"] = json.loads(mc_options)
    answers = d["answers"]
    d["answers"] = json.loads(answers)

    if if_include_versions:
        d["lang_versions"] = [__marshal_lang_version(v) for v in q.lang_versions]
    elif not if_include_versions and "lang_versions" in d:
        del d["lang_versions"]

    return d


def __marshal_form_question_template_v2(q: FormQuestionTemplateOrmV2) -> dict:
    """
    Serialize a ``FormQuestionTemplateOrmV2``; parse JSON fields.

    :param q: Question template instance to serialize.
    :return: Question dictionary with parsed visible_condition and mc_options.
    """
    d = vars(q).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("template"):
        del d["template"]

    # Parse JSON fields
    visible_condition = d.get("visible_condition")
    if visible_condition is not None and visible_condition != "":
        d["visible_condition"] = json.loads(visible_condition)
    else:
        d["visible_condition"] = []

    mc_options = d.get("mc_options")
    if mc_options is not None and mc_options != "":
        d["mc_options"] = json.loads(mc_options)

    # If mc_options is None or empty, remove it from dict (it's optional)
    elif "mc_options" in d:
        del d["mc_options"]

    return d


def marshal_question_to_single_version(q: QuestionOrm, lang: str) -> dict:
    # Base shallow marshal without versions
    d = __marshal_question(q, if_include_versions=False)

    # Choose requested version
    versions = getattr(q, "lang_versions", None) or []
    chosen = next((v for v in versions if getattr(v, "lang", None) == lang), None)
    if chosen is None:
        return d

    # Override text if present
    qt = getattr(chosen, "question_text", None)
    if qt is not None:
        d["question_text"] = qt

    # Replace mc_options only if the version provides non-default options
    mc = getattr(chosen, "mc_options", None)
    if isinstance(mc, str) and mc != "[]":
        try:
            parsed = json.loads(mc)
            d["mc_options"] = parsed if isinstance(parsed, list) else [str(parsed)]
        except Exception:
            # leave base mc_options as-is if parsing fails
            LOGGER.debug("Failed to parse mc_options JSON in Question", exc_info=True)

    return d


def __unmarshal_lang_version(d: dict) -> QuestionLangVersionOrm:
    """
    Construct a ``QuestionLangVersionOrm``; convert ``mc_options`` list→JSON string.

    :param d: Language-version payload dictionary.
    :return: ``QuestionLangVersionOrm`` instance.
    """
    # Convert "mc_options" from json dict to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)

    lang_version = __load(QuestionLangVersionOrm, d)

    return lang_version


def __unmarshal_lang_version_v2(d: dict) -> LangVersionOrmV2:
    """
    Construct a ``LangVersionOrmV2`` translation entry.

    :param d: Language version V2 payload dictionary.
    :return: ``LangVersionOrmV2`` instance.
    """
    lang_version_v2 = __load(LangVersionOrmV2, d)
    return lang_version_v2


def __unmarshal_question(d: dict) -> QuestionOrm:
    """
    Construct a ``QuestionOrm``; encode JSON-able fields and attach ``lang_versions``.

    :param d: Question payload (may include ``visible_condition``/``mc_options``/
        ``answers`` and ``lang_versions``).
    :return: ``QuestionOrm`` with nested ``lang_versions`` attached if provided.
    """
    # Convert "visible_condition" from json dict to string
    visible_condition = d.get("visible_condition")
    if visible_condition is not None:
        d["visible_condition"] = json.dumps(visible_condition)
    # Convert "mc_options" from json dict to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)
    # Convert "answers" from json dict to string
    answers = d.get("answers")
    if answers is not None:
        d["answers"] = json.dumps(answers)

    # Unmarshal any lang versions found within the question
    question_lang_version_orms: list[QuestionLangVersionOrm] = []
    lang_version_dicts = d.get("lang_versions")
    if lang_version_dicts is not None:
        del d["lang_versions"]
        question_lang_version_orms = [
            __unmarshal_lang_version(v) for v in lang_version_dicts
        ]

    question_orm = __load(QuestionOrm, d)

    question_orm.lang_versions = question_lang_version_orms

    return question_orm


def unmarshal_question_list(d: list) -> List[QuestionOrm]:
    """
    Unmarshal a list of question dicts into ``QuestionOrm`` instances.

    :param d: List of question payload dictionaries.
    :return: List of ``QuestionOrm`` instances.
    """
    # Unmarshal any questions found within the list, return a list of questions
    return [__unmarshal_question(q) for q in d]


def __unmarshal_form_question_template_v2(d: dict) -> FormQuestionTemplateOrmV2:
    """
    Construct a ``FormQuestionTemplateOrmV2``; encode JSON-able fields.

    :param d: Question template payload (may include ``visible_condition`` and
        ``mc_options`` as lists/dicts).
    :return: ``FormQuestionTemplateOrmV2`` instance.
    """
    # Convert 'visible_condition' from json dict to string
    visible_condition = d.get("visible_condition")
    if visible_condition is not None:
        if isinstance(visible_condition, (list, dict)):
            d["visible_condition"] = json.dumps(visible_condition)

    # Convert "mc_options" from json list to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)

    question_template_v2 = __load(FormQuestionTemplateOrmV2, d)

    return question_template_v2
