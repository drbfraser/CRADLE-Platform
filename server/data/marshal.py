from enum import Enum
from typing import Any, Dict, Type

from data.crud import M
from models import Patient, Reading, Referral


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
    else:
        d = vars(obj).copy()
        __pre_process(d)
        return d


def __marshal_patient(p: Patient, shallow) -> dict:
    d = vars(p).copy()
    __pre_process(d)
    if not shallow:
        d["readings"] = [marshal(r) for r in p.readings]
    return d


def __marshal_reading(r: Reading, shallow) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    if not shallow and r.referral is not None:
        d["referral"] = marshal(r.referral)
    if not shallow and r.followup is not None:
        d["followup"] = marshal(r.followup)
    return d


def __marshal_referral(r: Referral) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("healthFacility"):
        del d["healthFacility"]
    return d


def __pre_process(d: Dict[str, Any]):
    __strip_protected_attributes(d)
    __strip_none_values(d)
    for k, v in d.items():
        if isinstance(v, Enum):
            d[k] = v.value


def __strip_protected_attributes(d: Dict[str, Any]):
    remove = [k for k in d if not d[k]]
    for k in remove:
        del d[k]


def __strip_none_values(d: Dict[str, Any]):
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

    # Put the readings back into the patient
    patient = __load(Patient, d)
    if readings:
        patient.readings = readings

    return patient


def __unmarshal_reading(d: dict) -> Reading:
    # Convert "symptoms" from array to string
    if d.get("symptoms") is not None:
        d["symptoms"] = ",".join(d["symptoms"])
    reading = __load(Reading, d)
    return reading
