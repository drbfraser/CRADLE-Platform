from models import PatientOrm

from .api import marshal
from .registry import register_legacy
from .utils import __pre_process


def __marshal_patient(p: PatientOrm, shallow: bool) -> dict:
    """
    Serialize a ``PatientOrm``, optionally including readings/referrals/assessments.

    :param p: Patient instance to serialize.
    :param shallow: If ``True``, omit nested relationships.
    :return: Patient dictionary suitable for API responses.
    """
    d = vars(p).copy()
    __pre_process(d)
    if d.get("date_of_birth"):
        d["date_of_birth"] = str(d["date_of_birth"])

    # The API representation of a patient contains a "base" field which is used by
    # mobile for syncing. When getting a patient from an API, this value is always
    # equivalent to "last_edited".
    d["base"] = d["last_edited"]
    if not shallow:
        d["readings"] = [marshal(r) for r in p.readings]
        d["referrals"] = [marshal(r) for r in p.referrals]
        d["assessments"] = [marshal(a) for a in p.assessments]
    return d


register_legacy(PatientOrm, marshal_helper=__marshal_patient, marshal_mode="S", type_label="patient")
