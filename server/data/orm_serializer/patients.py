from typing import List, Optional

from common import commonUtil
from models import (
    AssessmentOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReferralOrm,
)

from .forms import __unmarshal_form
from .records import (
    __marshal_assessment,
    __marshal_reading,
    __marshal_referral,
    __unmarshal_reading,
)
from .utils import __load, __pre_process


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
        d["readings"] = [__marshal_reading(r, shallow=True) for r in p.readings]
        d["referrals"] = [__marshal_referral(r) for r in p.referrals]
        d["assessments"] = [__marshal_assessment(a) for a in p.assessments]
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
        referrals = [
            __load(ReferralOrm, commonUtil.filterNestedAttributeWithValueNone(r))
            for r in d["referrals"]
        ]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["referrals"]
    else:
        referrals = []

    # Unmarshal any assessments found within the patient
    if d.get("assessments") is not None:
        assessments = [
            __load(AssessmentOrm, commonUtil.filterNestedAttributeWithValueNone(a))
            for a in d["assessments"]
        ]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["assessments"]
    else:
        assessments = []

    # Unmarshal any forms found within the patient
    if d.get("forms") is not None:
        forms = [__unmarshal_form(f) for f in d["forms"]]
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


def make_medical_record_from_patient(patient: dict) -> List[MedicalRecordOrm]:
    """
    Extract optional drug/medical history strings and build ``MedicalRecordOrm`` entries.

    :param patient: Patient payload (mutated to remove history fields).
    :return: List of ``MedicalRecordOrm`` instances (possibly empty).
    """
    drug_record = {}
    medical_record = {}
    if "drug_history" in patient:
        if patient["drug_history"]:
            drug_record = {
                "patient_id": patient["id"],
                "information": patient["drug_history"],
                "is_drug_record": True,
            }
        del patient["drug_history"]
    if "medical_history" in patient:
        if patient["medical_history"]:
            medical_record = {
                "patient_id": patient["id"],
                "information": patient["medical_history"],
                "is_drug_record": False,
            }
        del patient["medical_history"]

    records = []
    if drug_record:
        records.append(drug_record)
    if medical_record:
        records.append(medical_record)

    record = [
        __load(MedicalRecordOrm, commonUtil.filterNestedAttributeWithValueNone(m))
        for m in records
    ]
    return record


def makePregnancyFromPatient(patient: dict) -> List[PregnancyOrm]:
    """
    Derive pregnancy data from patient fields and remove them from the dict.

    :param patient: Patient payload (mutated to remove pregnancy fields).
    :return: List with a single ``PregnancyOrm`` if data present, else empty list.
    """
    pregnancyObj = {}
    if patient.get("pregnancy_start_date"):
        pregnancyObj = {
            "patient_id": patient["id"],
            "start_date": patient.pop("pregnancy_start_date"),
        }

    patient.pop("is_pregnant", None)
    if "start" in patient:
        del patient["pregnancy_start_date"]

    if pregnancyObj:
        pregnancy = [
            __load(
                PregnancyOrm,
                commonUtil.filterNestedAttributeWithValueNone(pregnancyObj),
            )
        ]
    else:
        pregnancy = []

    return pregnancy


def marshal_patient_pregnancy_summary(records: List[PregnancyOrm]) -> dict:
    """
    Build a compact summary for current and past pregnancies (most-recent first).

    :param records: Pregnancy records ordered with most recent first.
    :return: Dict with keys ``is_pregnant`` (bool), optional ``pregnancy_id``/
        ``pregnancy_start_date`` for an active pregnancy, and ``past_pregnancies``
        (list of dicts with ``id``, ``outcome``, ``pregnancy_start_date``,
        ``pregnancy_end_date``).
    """
    summary = {
        "is_pregnant": False,
        "past_pregnancies": list(),
    }

    if records:
        record = records[0]
        if not record.end_date:
            current_pregnancy = {
                "is_pregnant": True,
                "pregnancy_id": record.id,
                "pregnancy_start_date": record.start_date,
            }
            summary.update(current_pregnancy)
            del records[0]

        past_pregnancies = list()
        for record in records:
            pregnancy = {
                "id": record.id,
                "outcome": record.outcome,
                "pregnancy_end_date": record.end_date,
                "pregnancy_start_date": record.start_date,
            }
            past_pregnancies.append(pregnancy)
        summary["past_pregnancies"] = past_pregnancies

    return summary


def marshal_patient_medical_history(
    medical: Optional[MedicalRecordOrm] = None,
    drug: Optional[MedicalRecordOrm] = None,
) -> dict:
    """
    Build a patient's medical/drug history dict from up to two records.

    :param medical: Medical-history record, if present.
    :param drug: Drug-history record, if present.
    :return: Dict containing any of ``medical_history_id``/``medical_history``
        and ``drug_history_id``/``drug_history``.
    """
    records = dict()

    if medical:
        info = {
            "medical_history_id": medical.id,
            "medical_history": medical.information,
        }
        records.update(info)

    if drug:
        info = {
            "drug_history_id": drug.id,
            "drug_history": drug.information,
        }
        records.update(info)

    return records
