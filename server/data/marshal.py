from enum import Enum
from typing import Any, Dict

from models import Patient, Reading


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
