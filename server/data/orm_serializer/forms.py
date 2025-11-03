from common.form_utils import filter_template_questions_orm
from models import FormClassificationOrm, FormOrm, FormTemplateOrm

from .api import marshal
from .registry import register_legacy
from .utils import __pre_process


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
            marshal(q, shallow=True, if_include_versions=if_include_versions)
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
        d["questions"] = [marshal(q) for q in f.questions]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


register_legacy(FormOrm, helper=__marshal_form, mode="S", type_label="form")
register_legacy(
    FormTemplateOrm,
    helper=__marshal_form_template,
    mode="SV",
    type_label="form_template",
)
register_legacy(
    FormClassificationOrm,
    helper=__marshal_form_classification,
    mode="V",
    type_label="form_classification",
)
