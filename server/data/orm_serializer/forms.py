from models import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
)

from data import db_session

from common.form_utils import filter_template_questions_orm

from .utils import __pre_process, __load
from .core import marshal, unmarshal_question_list

from .questions import __marshal_question

from .questions import __marshal_question

def __marshal_form(f: FormOrm, shallow: bool) -> dict:
    """
    Serialize a ``FormOrm``; embed classification and optionally include questions.

    :param f: Form instance to serialize.
    :param shallow: If ``True``, omit questions from the output.
    :return: Form dictionary for API responses.
    """
    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    # Remove relationship object
    if d.get("patient"):
        del d["patient"]

    if shallow and "questions" in d:
        del d["questions"]

    if not shallow:
        d["questions"] = [marshal(q) for q in f.questions]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_form_template(
    f: FormTemplateOrm,
    shallow: bool = False,
    if_include_versions: bool = False,
) -> dict:
    """
    Serialize a ``FormTemplateOrm``; embed classification and (optionally) questions.

    :param f: Form template instance to serialize.
    :param shallow: If ``True``, omit questions.
    :param if_include_versions: If ``True``, include question language versions.
    :return: Form-template dictionary.
    """
    f = filter_template_questions_orm(f)

    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    if shallow:
        del d["questions"]
    else:
        d["questions"] = [
            __marshal_question(q, if_include_versions) for q in f.questions
        ]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_form_classification(
    fc: FormClassificationOrm,
    if_include_templates: bool = False,
) -> dict:
    """
    Serialize a ``FormClassificationOrm``; optionally embed its templates.

    :param fc: Form classification instance to serialize.
    :param if_include_templates: If ``True``, include serialized templates.
    :return: Classification dictionary.
    """
    d = vars(fc).copy()
    __pre_process(d)

    if d.get("templates") is not None:
        del d["templates"]

    if if_include_templates:
        d["templates"] = [__marshal_form_template(t) for t in fc.templates]

    return d


def __unmarshal_form_template(d: dict) -> FormTemplateOrm:
    """
    Construct a ``FormTemplateOrm``; load questions via ``unmarshal_question_list``.

    :param d: FormTemplate payload (may include a ``questions`` list).
    :return: ``FormTemplateOrm`` with questions attached.
    """
    with db_session.no_autoflush:
        questions = []
        if d.get("questions") is not None:
            questions = unmarshal_question_list(d["questions"])
            del d["questions"]

        form_template_orm = __load(FormTemplateOrm, d)

        form_template_orm.questions = questions

        return form_template_orm


def __unmarshal_form(d: dict) -> FormOrm:
    """
    Construct a ``FormOrm``; unmarshal nested questions if present.

    :param d: Form payload (may include a ``questions`` list).
    :return: ``FormOrm`` with optional questions attached.
    """
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])

    form = __load(FormOrm, d)

    if questions:
        form.questions = questions

    return form

