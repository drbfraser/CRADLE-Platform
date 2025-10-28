from functools import partial
from typing import Any, Callable, Dict, TypeAlias, TypeVar, Union

import data.db_operations as crud
from data import marshal
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

ObjectCatalogue: TypeAlias = Dict[str, Union[ObjectResolver, Dict[str, CustomResolver]]]


# TODO: query for form data
def __query_form_data():
    pass


def __query_object(
    model: type[M], query: Callable[[str], bool], id: str
) -> Dict[str, Any]:
    """
    General function for querying system data

    :param model: the ORM data model being queried for
    :param predicate: the query to match on
    :param id: id for data querying, is partially applied

    :returns: a callable function that returns the object model
    """
    pred = query(id)
    data = crud.read(model, pred)

    if data is None:
        return None

    return marshal.marshal(data)


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
__data_catalogue = {
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
}
