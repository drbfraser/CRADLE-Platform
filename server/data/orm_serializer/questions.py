# orm_serializer/question.py
import json
import logging

from models import QuestionLangVersionOrm, QuestionOrm

from .api import marshal
from .registry import register_legacy
from .utils import __pre_process

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
        d["lang_versions"] = [marshal(v) for v in q.lang_versions]
    elif not if_include_versions and "lang_versions" in d:
        del d["lang_versions"]

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


# Ensure registry entry exists
register_legacy(QuestionOrm, helper=__marshal_question, mode="V", type_label="question")
register_legacy(
    QuestionLangVersionOrm,
    helper=__marshal_lang_version,
    mode="",
    type_label="question_lang_version",
)
