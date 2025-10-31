from models import (
    PatientOrm,
    ReferralOrm,
    AssessmentOrm,
    FormOrm
)

from .utils import (
    __pre_process,
    __load
)

from .core import marshal, unmarshal, make_medical_record_from_patient, makePregnancyFromPatient

from .records import (
    __unmarshal_reading,

)

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

def __unmarshal_patient(d: dict) -> PatientOrm:
    """
    Construct a ``PatientOrm``; recursively unmarshal nested lists and fix fields.

    :param d: Patient payload (may include readings/referrals/assessments/forms).
    :return: ``PatientOrm`` with nested collections attached.
    """
    # Unmarshal any readings found within the patient
    if d.get("readings") is not None:
        readings = [__unmarshal_reading(r) for r in d["readings"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["readings"]
    else:
        readings = []

    # Unmarshal any referrals found within the patient
    if d.get("referrals") is not None:
        referrals = [unmarshal(ReferralOrm, r) for r in d["referrals"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["referrals"]
    else:
        referrals = []

    # Unmarshal any assessments found within the patient
    if d.get("assessments") is not None:
        assessments = [unmarshal(AssessmentOrm, a) for a in d["assessments"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["assessments"]
    else:
        assessments = []

    # Unmarshal any forms found within the patient
    if d.get("forms") is not None:
        forms = [unmarshal(FormOrm, f) for f in d["forms"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["forms"]
    else:
        forms = []

    medRecords = make_medical_record_from_patient(d)
    pregnancy = makePregnancyFromPatient(d)

    # Since "base" doesn't have a column in the database, we must remove it from its
    # marshalled representation before converting back to an object.
    if d.get("base"):
        del d["base"]

    # Put the readings back into the patient
    patient = __load(PatientOrm, d)
    if readings:
        patient.readings = readings
    if referrals:
        patient.referrals = referrals
    if assessments:
        patient.assessments = assessments
    if medRecords:
        patient.records = medRecords
    if pregnancy:
        patient.pregnancies = pregnancy
    if forms:
        patient.forms = forms

    return patient