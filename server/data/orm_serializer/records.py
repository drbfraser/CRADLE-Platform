from models import (
    AssessmentOrm,
    MedicalRecordOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
)

from .api import marshal
from .registry import register_legacy
from .utils import __pre_process


def __marshal_reading(r: ReadingOrm, shallow: bool) -> dict:
    """
    Serialize a ``ReadingOrm`` to a JSON-ready ``dict``.

    :param r: Reading instance to serialize.
    :param shallow: If ``True``, omit nested relationships.
    :return: Dictionary representation of the reading.
    """
    d = vars(r).copy()
    __pre_process(d)
    if not d.get("symptoms"):
        d["symptoms"] = []
    if d.get("symptoms"):
        d["symptoms"] = d["symptoms"].split(",")
    if not shallow and r.urine_tests is not None:
        d["urine_tests"] = marshal(r.urine_tests)
    else:
        # Remove relationship-only field(s) from the marshaled payload.
        # We intentionally exclude heavy nested collections here (shallow output).
        # Currently just "urine_tests", if needed, add more fields inside the list (eg. ["urine_tests", "protein",...]).
        for rel in ["urine_tests"]:
            if rel in d:
                del d[rel]
    return d


def __marshal_referral(r: ReferralOrm) -> dict:
    """
    Serialize a ``ReferralOrm`` and drop relationship objects (patient, facility).

    :param r: Referral instance to serialize.
    :return: Referral dictionary without relationship objects.
    """
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("health_facility"):
        del d["health_facility"]
    if d.get("patient"):
        del d["patient"]
    return d


def __marshal_assessment(f: AssessmentOrm) -> dict:
    """
    Serialize an ``AssessmentOrm`` and strip relationship objects.

    :param f: Assessment instance to serialize.
    :return: Assessment dictionary without facility/patient/worker relationships.
    """
    d = vars(f).copy()
    __pre_process(d)
    # Remove relationship objects
    if d.get("health_facility"):
        del d["health_facility"]
    if d.get("patient"):
        del d["patient"]
    if d.get("healthcare_worker"):
        del d["healthcare_worker"]
    return d


def __marshal_pregnancy(p: PregnancyOrm) -> dict:
    """
    Serialize a ``PregnancyOrm`` to a compact dictionary of scalar fields.

    :param p: Pregnancy instance to serialize.
    :return: Dict with ``id``, ``patient_id``, dates, ``outcome``, and ``last_edited``.
    """
    return {
        "id": p.id,
        "patient_id": p.patient_id,
        "start_date": p.start_date,
        "end_date": p.end_date,
        "outcome": p.outcome,
        "last_edited": p.last_edited,
    }


def __marshal_medical_record(r: MedicalRecordOrm) -> dict:
    """
    Serialize a ``MedicalRecordOrm`` and route information to the appropriate field.

    :param r: Medical record instance to serialize.
    :return: Dict with core fields and either ``drug_history`` or ``medical_history``.
    """
    d = {
        "id": r.id,
        "patient_id": r.patient_id,
        "date_created": r.date_created,
        "last_edited": r.last_edited,
    }

    if r.is_drug_record:
        d["drug_history"] = r.information
    else:
        d["medical_history"] = r.information

    return d


register_legacy(ReadingOrm, helper=__marshal_reading, mode="S", type_label="reading")
register_legacy(ReferralOrm, helper=__marshal_referral, mode="", type_label="referral")
register_legacy(
    AssessmentOrm, helper=__marshal_assessment, mode="", type_label="assessment"
)
register_legacy(
    PregnancyOrm, helper=__marshal_pregnancy, mode="", type_label="pregnancy"
)
register_legacy(
    MedicalRecordOrm,
    helper=__marshal_medical_record,
    mode="",
    type_label="medical_record",
)
