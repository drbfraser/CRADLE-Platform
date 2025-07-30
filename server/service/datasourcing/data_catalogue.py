from functools import partial
from typing import Any, Callable, Dict, TypeVar

import models as m
from data import crud, marshal

M = TypeVar("M")


# TODO: query for form data
def __query_form_data():
    pass


def __query_data(model: type[M], query, id: str, column: str) -> Callable:
    """
    General function for querying system data

    :param model: the ORM data model being queried for
    :param predicate: the query to match on
    :param id: id for data querying, is partially applied
    :param column: name of the column to query, is partially applied

    :returns: a callable function that returns the value queried for, None if not found
    """
    pred = query(id)
    data = crud.read(model, pred)

    if data is None:
        return None

    return marshal.marshal(data).get(column)


def get_catalogue() -> Dict[str, Callable[[str, str], Any]]:
    """
    the data catalogue of supported datasource strings

    the catalogue maps datasource strings to a Callable that takes a string of id and column

    :returns: a dict of string keys corresponding to a query
    """
    return __data_catalogue


# NOTE:
#   maintaining a datastring lookup vs dynamic lookup means it will be easier to reason about and debug
#   it also allows us to add our own behavior specific to each table
#   e.g. "$patient.age", `age` is not a column that exists, but we can define behavior for it:
#         current date - patient.date_of_birth** -> to_int
#         **given nuance that a patient may have a estimated or exact date of birth
__data_catalogue = {
    "$patient.name": partial(
        __query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id
    ),
    "$patient.sex": partial(
        __query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id
    ),
    "$patient.date_of_birth": partial(
        __query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id
    ),
    "$patient.is_pregnant": partial(
        __query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id
    ),
    "$reading.systolic_blood_pressure": partial(
        __query_data, m.ReadingOrm, lambda _id: m.ReadingOrm.patient_id == _id
    ),
    "$reading.traffic_light_status": partial(
        __query_data, m.ReadingOrm, lambda _id: m.ReadingOrm.patient_id == _id
    ),
}
