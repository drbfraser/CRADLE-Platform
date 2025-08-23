from functools import partial
from typing import Callable, Dict, TypeVar

import models as m
import server.service.datasourcing.custom_lookup as cl
from data import crud, marshal

M = TypeVar("M")


# TODO: query for form data
def __query_form_data():
    pass


def __query_object(model: type[M], query, id: str) -> Callable[[str], Dict]:
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


def get_catalogue() -> Dict[str, Callable[[str], Dict]]:
    """
    the data catalogue of supported datasource objects

    the catalogue maps datasource strings to a Callable that takes a string of id

    :returns: a dict of string keys corresponding to a query
    """
    return __object_catalogue


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
__object_catalogue = {
    "$assessment": partial(
        __query_object, m.AssessmentOrm, lambda _id: m.AssessmentOrm.id == _id
    ),
    "$medical_record": partial(
        __query_object, m.MedicalRecordOrm, lambda _id: m.MedicalRecordOrm.id == _id
    ),
    "$patient": {
        "query": partial(
            __query_object, m.PatientOrm, lambda _id: m.PatientOrm.id == _id
        ),
        "custom": {"age": partial(cl.patient_age)},
    },
    "$pregnancy": partial(
        __query_object, m.PregnancyOrm, lambda _id: m.PregnancyOrm.id == _id
    ),
    "$reading": partial(
        __query_object, m.ReadingOrm, lambda _id: m.ReadingOrm.patient_id == _id
    ),
    "$urine_test": partial(
        __query_object, m.UrineTestOrm, lambda _id: m.UrineTestOrm.id == _id
    ),
}
