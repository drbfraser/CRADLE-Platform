import json

from common.form_utils import filter_template_questions_orm
from data import db_session
from models import (
    FormAnswerOrmV2,
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormOrm,
    FormSubmissionOrmV2,
    FormTemplateOrm,
    FormTemplateOrmV2,
)

from .questions import (
    __marshal_form_question_template_v2,
    __marshal_question,
    __unmarshal_form_question_template_v2,
    marshal_question_to_single_version,
    unmarshal_question_list,
)
from .utils import __load, __pre_process


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
            __marshal_question(q, if_include_versions=if_include_versions)
            for q in f.questions
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
        d["questions"] = [
            __marshal_question(q, if_include_versions=False) for q in f.questions
        ]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_form_classification_v2(fc: FormClassificationOrmV2, shallow=True) -> dict:
    """
    Serialize a ``FormClassificationOrmV2`` translation entry.

    :param fc: Language version instance to serialize.
    :param shallow: If ``True``, omit templates.
    :return: Form classification dictionary with id, name_string_id, and optionally templates.
    """
    d = vars(fc).copy()
    __pre_process(d)

    if shallow:
        if d.get("templates"):
            del d["templates"]
    else:
        d["templates"] = [
            __marshal_form_template_v2(ft, shallow=True) for ft in fc.templates
        ]

    return d


def __marshal_form_template_v2(
    ft: FormTemplateOrmV2,
    shallow: bool = False,
) -> dict:
    """
    Serialize a ``FormTemplateOrmV2``; embed classification and optionally questions.

    :param ft: Form template V2 instance to serialize.
    :param shallow: If ``True``, omit questions.
    :return: Form-template dictionary with version, archived, optionally questions, and is_latest flags.
    """
    d = vars(ft).copy()
    __pre_process(d)

    if ft.classification:
        d["classification"] = {
            "id": ft.classification.id,
            "name_string_id": ft.classification.name_string_id,
        }
    else:
        d["classification"] = None

    if shallow:
        if d.get("questions"):
            del d["questions"]
    else:
        d["questions"] = [__marshal_form_question_template_v2(q) for q in ft.questions]
        # Sort question list based on order in ascending order
        d["questions"].sort(key=lambda q: q["order"])

    return d


def __marshal_form_answer_v2(a: FormAnswerOrmV2) -> dict:
    """
    Serialize a ``FormAnswerOrmV2``; parse the answer JSON field.

    :param a: Form answer instance to serialize.
    :return: Answer dictionary with parsed answer field.
    """
    d = vars(a).copy()
    __pre_process(d)

    # Parse answer JSON field
    answer = d.get("answer")
    if answer is not None and answer != "":
        d["answer"] = json.loads(answer)
    else:
        d["answer"] = {}

    return d


def __marshal_form_submission_v2(
    fs: FormSubmissionOrmV2,
    shallow: bool = False,
) -> dict:
    """
    Serialize a ``FormSubmissionOrmV2``; optionally embed answers.

    :param fs: Form submission V2 instance to serialize.
    :param shallow: If ``True``, omit answers from the output.
    :return: Submission dictionary with metadata and optionally answers.
    """
    d = vars(fs).copy()
    __pre_process(d)

    if shallow:
        if d.get("answers"):
            del d["answers"]
    else:
        d["answers"] = [__marshal_form_answer_v2(a) for a in fs.answers]

    return d


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


def __unmarshal_form_template_v2(d: dict) -> FormTemplateOrmV2:
    """
    Construct a ``FormTemplateOrmV2``; load questions.

    :param d: Form template V2 payload (may include a ``questions`` list).
    :return: ``FormTemplateOrmV2`` with questions attached.
    """
    with db_session.no_autoflush:
        questions = []
        if d.get("questions") is not None:
            questions = [
                __unmarshal_form_question_template_v2(q) for q in d["questions"]
            ]
            del d["questions"]

        form_template_v2 = __load(FormTemplateOrmV2, d)

        if questions:
            form_template_v2.questions = questions

        return form_template_v2


def __unmarshal_form_submission_v2(d: dict) -> FormSubmissionOrmV2:
    """
    Construct a ``FormSubmissionOrmV2``; unmarshal nested answers if present.

    :param d: Form submission V2 payload (may include an ``answers`` list).
    :return: ``FormSubmissionOrmV2`` with answers attached.
    """
    with db_session.no_autoflush:
        answers = []
        if d.get("answers") is not None:
            answers = [__unmarshal_form_answer_v2(a) for a in d["answers"]]
            del d["answers"]

        form_submission_v2 = __load(FormSubmissionOrmV2, d)

        if answers:
            form_submission_v2.answers = answers

        return form_submission_v2


def __unmarshal_form_answer_v2(d: dict) -> FormAnswerOrmV2:
    """
    Construct a ``FormAnswerOrmV2``; encode answer dict to JSON string.

    :param d: Form answer V2 payload (may include ``answer`` as a dict).
    :return: ``FormAnswerOrmV2`` instance.
    """
    # Convert "answer" from json dict to string
    answer = d.get("answer")
    if answer is not None:
        if isinstance(answer, dict):
            d["answer"] = json.dumps(answer)

    form_answer_v2 = __load(FormAnswerOrmV2, d)

    return form_answer_v2


def marshal_template_to_single_version(f: FormTemplateOrm, version: str) -> dict:
    """
    Serialize a ``FormTemplateOrm`` restricting questions to a single language.

    :param f: Form template instance to serialize.
    :param version: Language code to select in question ``lang_versions``.
    :return: Form-template dictionary restricted to the requested language.
    """
    f = filter_template_questions_orm(f)

    d = vars(f).copy()
    __pre_process(d)

    d["lang"] = version
    d["questions"] = [
        marshal_question_to_single_version(q, version) for q in f.questions
    ]

    # sort question list based on question index in ascending order
    if d["questions"]:
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __unmarshal_form_classification_v2(d: dict) -> FormClassificationOrmV2:
    """
    Construct a ``FormClassificationOrmV2``; optionally load nested templates.

    :param d: Form classification V2 payload (may include a ``templates`` list).
    :return: ``FormClassificationOrmV2`` with optional templates attached.
    """
    with db_session.no_autoflush:
        templates = []
        if d.get("templates") is not None:
            templates = [__unmarshal_form_template_v2(t) for t in d["templates"]]
            del d["templates"]

        form_classification_v2 = __load(FormClassificationOrmV2, d)

        if templates:
            form_classification_v2.templates = templates

        return form_classification_v2
