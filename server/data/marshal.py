from enum import Enum
from typing import Any, Dict, Type, List, Optional

import collections

from data.crud import M, read_all
from models import Patient, Reading, Referral, FollowUp, Pregnancy
import service.invariant as invariant


def marshal(obj: Any, shallow=False) -> dict:
    """
    Recursively marshals an object to a dictionary.

    :param obj: The object to marshal
    :param shallow: If true, only the top level fields will be marshalled
    :return: A dictionary mapping fields to values
    """
    if isinstance(obj, Patient):
        return __marshal_patient(obj, shallow)
    elif isinstance(obj, Reading):
        return __marshal_reading(obj, shallow)
    elif isinstance(obj, Referral):
        return __marshal_referral(obj)
    elif isinstance(obj, FollowUp):
        return __marshal_followup(obj)
    elif isinstance(obj, Pregnancy):
        return __marshal_pregnancy(obj)
    else:
        d = vars(obj).copy()
        __pre_process(d)
        return d


def __marshal_patient(p: Patient, shallow) -> dict:
    d = vars(p).copy()
    __pre_process(d)
    if d.get("dob"):
        d["dob"] = str(d["dob"])

    # The API representation of a patient contains a "base" field which is used by
    # mobile for syncing. When getting a patient from an API, this value is always
    # equivalent to "lastEdited".
    d["base"] = d["lastEdited"]

    if not shallow:
        d["readings"] = [marshal(r) for r in p.readings]
    return d


def __marshal_reading(r: Reading, shallow) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    if not d.get("symptoms"):
        d["symptoms"] = []
    if d.get("symptoms"):
        d["symptoms"] = d["symptoms"].split(",")
    if not shallow and r.referral is not None:
        d["referral"] = marshal(r.referral)
    if not shallow and r.followup is not None:
        d["followup"] = marshal(r.followup)
    if not shallow and r.urineTests is not None:
        d["urineTests"] = marshal(r.urineTests)
    return d


def __marshal_referral(r: Referral) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("healthFacility"):
        del d["healthFacility"]
    if d.get("reading"):
        del d["reading"]
    if d.get("patient"):
        del d["patient"]
    return d


def __marshal_followup(f: FollowUp) -> dict:
    d = vars(f).copy()
    __pre_process(d)
    # Remove relationship objects
    if d.get("healthFacility"):
        del d["healthFacility"]
    if d.get("reading"):
        del d["reading"]
    return d


def __marshal_pregnancy(p: Pregnancy) -> dict:
    d = vars(p).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("patient"):
        del d["patient"]
    return d


def __pre_process(d: Dict[str, Any]):
    __strip_protected_attributes(d)
    __strip_none_values(d)
    for k, v in d.items():
        if isinstance(v, Enum):
            d[k] = v.value


def __strip_none_values(d: Dict[str, Any]):
    remove = [k for k in d if d[k] is None]
    for k in remove:
        del d[k]


def __strip_protected_attributes(d: Dict[str, Any]):
    remove = [k for k in d if k.startswith("_")]
    for k in remove:
        del d[k]


def unmarshal(m: Type[M], d: dict) -> M:
    """
    Converts a dictionary into a model instance by loading it from the model's schema.

    Special care is taken for ``Reading`` models (and any thing which contains a nested
    ``Reading`` model) because their database schema is different from their dictionary
    representation, most notably the symptoms field.

    For ``Patient`` and ``Reading`` types, the instance returned by this function may
    not be sound as there are various invariants that must be held for ``Reading``
    objects. One should call ``service.invariant.resolve_reading_invariants`` on the
    instance created by this function.

    :param m: The type of model to construct
    :param d: A dictionary mapping columns to values used to construct the model
    :return: A model
    """
    if m is Patient:
        return __unmarshal_patient(d)
    elif m is Reading:
        return __unmarshal_reading(d)
    else:
        return __load(m, d)


def __load(m: Type[M], d: dict) -> M:
    schema = m.schema()
    return schema().load(d)


def __unmarshal_patient(d: dict) -> Patient:
    # Unmarshal any readings found within the patient
    if d.get("readings") is not None:
        readings = [__unmarshal_reading(r) for r in d["readings"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["readings"]
    else:
        readings = []

    # Since "base" doesn't have a column in the database, we must remove it from its
    # marshalled representation before converting back to an object.
    if d.get("base"):
        del d["base"]

    # Put the readings back into the patient
    patient = __load(Patient, d)
    if readings:
        patient.readings = readings

    return patient


def __unmarshal_reading(d: dict) -> Reading:

    # Convert "symptoms" from array to string, if plural number of symptoms
    symptomsGiven = d.get("symptoms")
    if symptomsGiven is not None:
        if isinstance(symptomsGiven, list):
            d["symptoms"] = ",".join(d["symptoms"])

    reading = __load(Reading, d)

    invariant.resolve_reading_invariants(reading)

    return reading


## Functions taken from the original Database.py ##
## To-Do: Integrate them properly with the current marshal functions, it looks like there may be some overlap


def models_to_list(models: List[Any], schema) -> List[dict]:
    """
    Converts a list of models into a list of dictionaries mapping column names
    to values.

    :param models: A list of models
    :param schema: The schema of the models
    :return: A list of dictionaries
    """

    return schema(many=True).dump(models)


def model_to_dict(model: Any, schema) -> Optional[dict]:
    """
    Converts a model into a dictionary mapping column names to values.

    :param model: A model
    :param schema: The schema of the model
    :return: A dictionary or ``None`` if ``model`` is ``None``
    """
    if not model:
        return None
    if isinstance(model, collections.Mapping):  # Local database stub
        return model
    return schema().dump(model)
