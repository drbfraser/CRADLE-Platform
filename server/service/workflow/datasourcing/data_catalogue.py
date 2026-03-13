from functools import partial
from typing import Any, Callable, Dict, List, TypeAlias, TypeVar

import data.db_operations as crud
from data import orm_serializer
from models import (
    AssessmentOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    UrineTestOrm,
)
from service.workflow.datasourcing import custom_lookup as cl

M = TypeVar("M")

ObjectResolver = Callable[[str, str], Any]
CustomResolver = Callable[[Dict], Any]

# For object entries we use a dict with well-known keys like:
#   {"query": <callable>, "custom": {...}, "collection": bool}
ObjectCatalogue: TypeAlias = Dict[str, Dict[str, Any]]


def __query_vitals_collection(patient_id: str) -> List[Dict[str, Any]]:
    """
    Query all readings (vitals) for a patient, ordered by date_taken (newest first).

    Each item is a plain dict produced via orm_serializer.marshal, optionally
    enriched with a nested "urine_test" dict if a urine test exists.
    """
    # Reuse existing patient query that already orders readings by date.
    readings: List[ReadingOrm] = crud.read_patient_all_records(
        patient_id, readings=True
    )

    result: List[Dict[str, Any]] = []
    for reading in readings:
        reading_dict = orm_serializer.marshal(reading)

        # Attach nested urine_test if present on the ORM relationship.
        urine: UrineTestOrm | None = getattr(reading, "urine_tests", None)
        if urine is not None:
            urine_dict = orm_serializer.marshal(urine)
            reading_dict["urine_test"] = urine_dict

        result.append(reading_dict)

    return result


def __query_pregnancies_collection(patient_id: str) -> List[Dict[str, Any]]:
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


def __query_referrals_collection(patient_id: str) -> List[Dict[str, Any]]:
    """
    Skeleton: query referrals collection for a patient.

    Phase 3 focuses on vitals and pregnancies; referrals will be
    implemented in a later phase.
    """
    # TODO: Implement referral collection query (Phase 3 extension).
    return []


def __query_assessments_collection(patient_id: str) -> List[Dict[str, Any]]:
    """
    Skeleton: query assessments collection for a patient.
    """
    # TODO: Implement assessment collection query (Phase 3 extension).
    return []


def __query_forms_collection(patient_id: str) -> List[Dict[str, Any]]:
    """
    Skeleton: query forms collection for a patient.
    """
    # TODO: Implement forms collection query (Phase 4).
    return []


def __query_all_workflows_collection(patient_id: str) -> List[Dict[str, Any]]:
    """
    Skeleton: query all workflows collection for a patient.
    """
    # TODO: Implement all_wf collection query (Phase 5).
    return []


def __query_object(
    model: type[M], query: Callable[[str], bool], id: str
) -> Dict[str, Any]:
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


def get_catalogue() -> Dict[str, ObjectCatalogue]:
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
__data_catalogue: Dict[str, ObjectCatalogue] = {
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
