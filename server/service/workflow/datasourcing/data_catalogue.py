import json
from functools import partial
from typing import Any, Callable, TypeAlias, TypeVar

import data.db_operations as crud
from data import orm_serializer
from enums import QuestionTypeEnum
from models import (
    AssessmentOrm,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    LangVersionOrmV2,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    UrineTestOrm,
)
from service.workflow.datasourcing import custom_lookup as cl

M = TypeVar("M")

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[dict], Any]

# For object entries we use a dict with well-known keys like:
#   {"query": <callable>, "custom": {...}, "collection": bool}
ObjectCatalogue: TypeAlias = dict[str, dict[str, Any]]


def __query_vitals_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Query all readings (vitals) for a patient, ordered by date_taken (newest first).

    Each item is a plain dict produced via orm_serializer.marshal, optionally
    enriched with a nested "urine_test" dict if a urine test exists.
    """
    # Reuse existing patient query that already orders readings by date.
    readings: list[ReadingOrm] = crud.read_patient_all_records(
        patient_id, readings=True
    )

    result: list[dict[str, Any]] = []
    for reading in readings:
        reading_dict = orm_serializer.marshal(reading)

        # Attach nested urine_test if present on the ORM relationship.
        urine: UrineTestOrm | None = getattr(reading, "urine_tests", None)
        if urine is not None:
            urine_dict = orm_serializer.marshal(urine)
            reading_dict["urine_test"] = urine_dict

        result.append(reading_dict)

    return result


def __query_pregnancies_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Query all pregnancies for a patient, ordered by start_date (newest first).
    """
    pregnancies = crud.read_all(PregnancyOrm, patient_id=patient_id) or []
    pregnancies_sorted = sorted(
        pregnancies,
        key=lambda p: getattr(p, "start_date", 0) or 0,
        reverse=True,
    )
    return [orm_serializer.marshal(p) for p in pregnancies_sorted]


def __query_referrals_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Skeleton: query referrals collection for a patient.

    Phase 3 focuses on vitals and pregnancies; referrals will be
    implemented in a later phase.
    """
    # TODO: Implement referral collection query (Phase 3 extension).
    return []


def __query_assessments_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Skeleton: query assessments collection for a patient.
    """
    # TODO: Implement assessment collection query (Phase 3 extension).
    return []


def __query_forms_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Query all form submissions for a patient, ordered newest-first.

    Each item is a flat dict keyed by user_question_id with the scalar answer
    value. This is how values are converted:
    INTEGER/DECIMAL → float
    STRING → str,
    DATE/DATETIME → str,
    MULTIPLE_CHOICE → English option text str
    """
    submissions = (
        crud.db_session.query(FormSubmissionOrmV2)
        .filter(FormSubmissionOrmV2.patient_id == patient_id)
        .order_by(FormSubmissionOrmV2.date_submitted.desc())
        .all()
    )

    if not submissions:
        return []

    all_question_ids = {
        answer.question_id
        for submission in submissions
        for answer in submission.answers
    }

    if not all_question_ids:
        return [{} for _ in submissions]

    questions = (
        crud.db_session.query(FormQuestionTemplateOrmV2)
        .filter(FormQuestionTemplateOrmV2.id.in_(all_question_ids))
        .all()
    )
    question_map: dict[str, FormQuestionTemplateOrmV2] = {q.id: q for q in questions}

    # fetch eng translations for all mc option string ids
    mc_options_map: dict[str, list[str]] = {}
    mc_string_ids: set[str] = set()
    for q in questions:
        if (
            q.question_type
            in (QuestionTypeEnum.MULTIPLE_CHOICE, QuestionTypeEnum.MULTIPLE_SELECT)
            and q.mc_options
        ):
            try:
                option_ids: list[str] = json.loads(q.mc_options)
                mc_options_map[q.id] = option_ids
                mc_string_ids.update(option_ids)
            except (ValueError, TypeError):
                pass

    option_text_map: dict[str, str] = {}
    if mc_string_ids:
        lang_versions = (
            crud.db_session.query(LangVersionOrmV2)
            .filter(
                LangVersionOrmV2.string_id.in_(mc_string_ids),
                LangVersionOrmV2.lang == "English",
            )
            .all()
        )
        option_text_map = {lv.string_id: lv.text for lv in lang_versions}

    result: list[dict[str, Any]] = []
    for submission in submissions:
        flat: dict[str, Any] = {}
        for answer in submission.answers:
            question = question_map.get(answer.question_id)
            if question is None:
                continue
            try:
                raw: dict[str, Any] = json.loads(answer.answer)
            except (ValueError, TypeError):
                continue
            q_type = question.question_type
            if q_type in (QuestionTypeEnum.INTEGER, QuestionTypeEnum.DECIMAL):
                value = raw.get("number")
            elif q_type == QuestionTypeEnum.STRING:
                value = raw.get("text")
            elif q_type in (QuestionTypeEnum.DATE, QuestionTypeEnum.DATETIME):
                value = raw.get("date")
            elif q_type == QuestionTypeEnum.MULTIPLE_CHOICE:
                selected = raw.get("mc_id_array", [])
                option_ids = mc_options_map.get(question.id, [])
                if selected and option_ids and selected[0] < len(option_ids):
                    value = option_text_map.get(option_ids[selected[0]])
                else:
                    value = None
            elif q_type == QuestionTypeEnum.MULTIPLE_SELECT:
                selected = raw.get("mc_id_array", [])
                option_ids = mc_options_map.get(question.id, [])
                for idx in selected:
                    if idx < len(option_ids):
                        text = option_text_map.get(option_ids[idx])
                        if text is not None:
                            flat[f"{question.user_question_id}_{text}"] = True
                continue
            else:
                continue
            if value is not None:
                flat[question.user_question_id] = value
        result.append(flat)

    return result


def __query_all_workflows_collection(patient_id: str) -> list[dict[str, Any]]:
    """
    Query all workflow instances for a patient, ordered newest-first by start_date
    (then ``last_edited``), for ``all_wf[latest]`` and related rule variables.
    """
    instances = crud.read_workflow_instances(patient_id=patient_id) or []
    instances_sorted = sorted(
        instances,
        key=lambda wi: (wi.start_date or 0, wi.last_edited or 0),
        reverse=True,
    )
    return [orm_serializer.marshal(wi, shallow=True) for wi in instances_sorted]


def __query_object(
    model: type[M], query: Callable[[str], bool], id: str
) -> dict[str, Any]:
    """
    General function for querying system data

    :param model: the ORM data model being queried for
    :param query: SQLAlchemy filter expression (e.g., lambda _id: Model.field == _id)
    :param id: id value for the filter
    :returns: a dict of the marshaled object or None
    """
    filter_condition = query(id)
    data = crud.read_by_filter(model, filter_condition)

    if data is None:
        return None

    return orm_serializer.marshal(data)


def get_catalogue() -> dict[str, ObjectCatalogue]:
    """
    The data catalogue of supported datasource objects

    the catalogue maps to an object catalogue dict
    which has two keys:
    1. "query" : a callable that resolves an instance of the object
    2. "custom" : a dict of support custom attributes, returns a callable

    :returns: a dict of string keys corresponding to an object catalogue
    """
    return __data_catalogue


"""
    Maintaining a datastring lookup vs dynamic lookup means:
    - it will be easier to reason about and debug
    - it allows us to add our own behavior specific to each object

    e.g. "$patient.age", `age` is not a attribute that exists, but we can define behavior for it:
        current date - patient.date_of_birth** -> to_int
        **given nuance that a patient may have a estimated or exact date of birth

    Objects below are from the spike on relevant system data used in a workflow
    see: https://docs.google.com/document/d/1e_O503r6fJRSulMRpjfFUkVSp_jJRdmlQenqlD28EJw/edit?tab=t.pcgl1q1na507
"""
__data_catalogue: dict[str, ObjectCatalogue] = {
    "assessment": {
        "query": partial(
            __query_object, AssessmentOrm, lambda _id: AssessmentOrm.id == _id
        ),
        "custom": {},
    },
    "medical_record": {
        "query": partial(
            __query_object, MedicalRecordOrm, lambda _id: MedicalRecordOrm.id == _id
        ),
        "custom": {},
    },
    "patient": {
        "query": partial(__query_object, PatientOrm, lambda _id: PatientOrm.id == _id),
        "custom": {"age": partial(cl.patient_age)},
    },
    "pregnancy": {
        "query": partial(
            __query_object, PregnancyOrm, lambda _id: PregnancyOrm.id == _id
        ),
        "custom": {},
    },
    # Simple reading object access (non-collection).
    "reading": {
        "query": partial(
            __query_object, ReadingOrm, lambda _id: ReadingOrm.patient_id == _id
        ),
        "custom": {},
    },
    "urine_test": {
        "query": partial(
            __query_object, UrineTestOrm, lambda _id: UrineTestOrm.id == _id
        ),
        "custom": {},
    },
    # Collection namespaces used by VariablePath-based resolution.
    "vitals": {
        "query": __query_vitals_collection,
        "collection": True,
    },
    "pregnancies": {
        "query": __query_pregnancies_collection,
        "collection": True,
    },
    "referrals": {
        "query": __query_referrals_collection,
        "collection": True,
    },
    "assessments": {
        "query": __query_assessments_collection,
        "collection": True,
    },
    "forms": {
        "query": __query_forms_collection,
        "collection": True,
    },
    "all_wf": {
        "query": __query_all_workflows_collection,
        "collection": True,
    },
}
