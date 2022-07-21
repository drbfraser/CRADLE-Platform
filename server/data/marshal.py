import collections
import json

from enum import Enum
from typing import Any, Dict, Type, List, Optional

from sqlalchemy import false

from data.crud import M
from models import (
    FormClassification,
    Patient,
    Reading,
    Referral,
    FollowUp,
    Pregnancy,
    MedicalRecord,
    FormTemplate,
    Form,
    Question,
    QuestionLangVersion,
)
import service.invariant as invariant


def marshal(obj: Any, shallow=False, if_include_versions=False) -> dict:
    """
    Recursively marshals an object to a dictionary.

    :param obj: The object to marshal
    :param shallow: If true, only the top level fields will be marshalled
    :param if_include_versions: If true, lang versions will be attached to questions
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
    elif isinstance(obj, MedicalRecord):
        return __marshal_medical_record(obj)
    elif isinstance(obj, FormTemplate):
        return __marshal_form_template(obj, shallow, if_include_versions)
    elif isinstance(obj, Form):
        return __marshal_form(obj, shallow)
    elif isinstance(obj, Question):
        return __marshal_question(obj, if_include_versions)
    elif isinstance(obj, QuestionLangVersion):
        return __marshal_lang_version(obj)
    else:
        d = vars(obj).copy()
        __pre_process(d)
        return d


def marshal_with_type(obj: Any, shallow=False) -> dict:
    """
    Recursively marshals an object to a dictionary which has an additional
    field that indicates the object type, used for summary page cards

    :param obj: The object to marshal
    :param shallow: If true, only the top level fields will be marshalled
    :return: A dictionary mapping fields to values
    """
    if isinstance(obj, Patient):
        patient_dict = __marshal_patient(obj, shallow)
        patient_dict["type"] = "patient"
        return patient_dict
    elif isinstance(obj, Reading):
        reading_dict = __marshal_reading(obj, shallow)
        reading_dict["type"] = "reading"
        return reading_dict
    elif isinstance(obj, Referral):
        referral_dict = __marshal_referral(obj)
        referral_dict["type"] = "referral"
        return referral_dict
    elif isinstance(obj, FollowUp):
        assessment_dict = __marshal_followup(obj)
        assessment_dict["type"] = "assessment"
        return assessment_dict
    elif isinstance(obj, Pregnancy):
        pregnancy_dict = __marshal_pregnancy(obj)
        pregnancy_dict["type"] = "pregnancy"
        return pregnancy_dict
    elif isinstance(obj, MedicalRecord):
        medical_record_dict = __marshal_medical_record(obj)
        medical_record_dict["type"] = "medical_record"
        return medical_record_dict
    elif isinstance(obj, Form):
        form_dict = __marshal_form(obj, True)
        form_dict["type"] = "form"
        return form_dict
    else:
        d = vars(obj).copy()
        __pre_process(d)
        d["type"] = "other"
        return d


def marshal_patient_pregnancy_summary(records: List[Pregnancy]) -> dict:
    summary = {
        "isPregnant": False,
        "pastPregnancies": list(),
    }

    if records:
        record = records[0]
        if not record.endDate:
            current_pregnancy = {
                "isPregnant": True,
                "pregnancyId": record.id,
                "pregnancyStartDate": record.startDate,
                "gestationalAgeUnit": record.defaultTimeUnit.value,
            }
            summary.update(current_pregnancy)
            del records[0]

        past_pregnancies = list()
        for record in records:
            pregnancy = {
                "pregnancyId": record.id,
                "pregnancyOutcome": record.outcome,
                "pregnancyEndDate": record.endDate,
                "pregnancyStartDate": record.startDate,
            }
            past_pregnancies.append(pregnancy)
        summary["pastPregnancies"] = past_pregnancies

    return summary


def marshal_patient_medical_history(
    medical: Optional[MedicalRecord] = None, drug: Optional[MedicalRecord] = None
) -> dict:
    records = dict()

    if medical:
        info = {
            "medicalHistoryId": medical.id,
            "medicalHistory": medical.information,
        }
        records.update(info)

    if drug:
        info = {
            "drugHistoryId": drug.id,
            "drugHistory": drug.information,
        }
        records.update(info)

    return records


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
        d["referrals"] = [marshal(r) for r in p.referrals]
        d["assessments"] = [marshal(a) for a in p.followups]
    return d


def __marshal_reading(r: Reading, shallow) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    if not d.get("symptoms"):
        d["symptoms"] = []
    if d.get("symptoms"):
        d["symptoms"] = d["symptoms"].split(",")
    if not shallow and r.urineTests is not None:
        d["urineTests"] = marshal(r.urineTests)
    return d


def __marshal_referral(r: Referral) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("healthFacility"):
        del d["healthFacility"]
    if d.get("patient"):
        del d["patient"]
    return d


def __marshal_followup(f: FollowUp) -> dict:
    d = vars(f).copy()
    __pre_process(d)
    # Remove relationship objects
    if d.get("healthFacility"):
        del d["healthFacility"]
    return d


def __marshal_pregnancy(p: Pregnancy) -> dict:
    return {
        "id": p.id,
        "patientId": p.patientId,
        "pregnancyStartDate": p.startDate,
        "gestationalAgeUnit": p.defaultTimeUnit.value,
        "pregnancyEndDate": p.endDate,
        "pregnancyOutcome": p.outcome,
        "lastEdited": p.lastEdited,
    }


def __marshal_medical_record(r: MedicalRecord) -> dict:
    d = {
        "id": r.id,
        "patientId": r.patientId,
        "dataCreated": r.dateCreated,
        "lastEdited": r.lastEdited,
    }

    if r.isDrugRecord:
        d["drugHistory"] = r.information
    else:
        d["medicalHistory"] = r.information

    return d


def __marshal_form_template(
    f: FormTemplate, shallow: bool = False, if_include_versions: bool = False
) -> dict:
    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    if not shallow:
        d["questions"] = [
            __marshal_question(q, if_include_versions) for q in f.questions
        ]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["questionIndex"])

    return d


def marshal_template_to_single_version(f: FormTemplate, version: str) -> dict:
    d = vars(f).copy()
    __pre_process(d)

    d["lang"] = version
    d["questions"] = [
        marshal_question_to_single_version(q, version) for q in f.questions
    ]

    # sort question list based on question index in ascending order
    if d["questions"]:
        d["questions"].sort(key=lambda q: q["questionIndex"])

    return d


def __marshal_form(f: Form, shallow) -> dict:
    d = vars(f).copy()
    __pre_process(d)
    
    d["classification"] = __marshal_form_classification(f.classification)

    # Remove relationship object
    if d.get("patient"):
        del d["patient"]

    if not shallow:
        d["questions"] = [marshal(q) for q in f.questions]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["questionIndex"])

    return d


def __marshal_question(q: Question, if_include_versions: bool) -> dict:
    d = vars(q).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("form"):
        del d["form"]
    if d.get("formTemplate"):
        del d["formTemplate"]
    if d.get("categoryQuestion"):
        del d["categoryQuestion"]

    # marshal visibleConditions, mcOptions, answers to json dict
    visible_condition = d["visibleCondition"]
    d["visibleCondition"] = json.loads(visible_condition)
    mc_options = d["mcOptions"]
    d["mcOptions"] = json.loads(mc_options)
    answers = d["answers"]
    d["answers"] = json.loads(answers)

    if if_include_versions:
        d["questionLangVersions"] = [marshal(v) for v in q.lang_versions]

    return d


def marshal_question_to_single_version(q: Question, version: str) -> dict:
    d = __marshal_question(q, False)
    version_info = [marshal(v) for v in q.lang_versions if v.lang == version][0]

    d["questionText"] = version_info["questionText"]
    if "mcOptions" in version_info:
        d["mcOptions"] = version_info["mcOptions"]

    return d


def __marshal_lang_version(v: QuestionLangVersion) -> dict:
    d = vars(v).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("question"):
        del d["question"]
    # Remove mcOptions if default empty list
    if d.get("mcOptions") == "[]":
        del d["mcOptions"]
    else:
        # marshal mcOptions to json dict
        d["mcOptions"] = json.loads(d["mcOptions"])

    return d


def __marshal_form_classification(
    fc: FormClassification, if_include_templates: bool = False
) -> dict:
    d = vars(fc).copy()
    __pre_process(d)

    if d.get("templates") is not None:
        del d["templates"]

    if if_include_templates:
        d["templates"] = [__marshal_form_template(t) for t in fc.templates]

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
    elif m is Form:
        return __unmarshal_form(d)
    elif m is FormTemplate:
        return __unmarshal_form_template(d)
    elif m is Question:
        return __unmarshal_question(d)
    elif m is QuestionLangVersion:
        return __unmarshal_lang_version(d)
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

    # Unmarshal any referrals found within the patient
    if d.get("referrals") is not None:
        referrals = [unmarshal(Referral, r) for r in d["referrals"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["referrals"]
    else:
        referrals = []

    # Unmarshal any assessments found within the patient
    if d.get("assessments") is not None:
        assessments = [unmarshal(FollowUp, a) for a in d["assessments"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["assessments"]
    else:
        assessments = []

    # Unmarshal any forms found within the patient
    if d.get("forms") is not None:
        forms = [unmarshal(Form, f) for f in d["forms"]]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the patient schema.
        del d["forms"]
    else:
        forms = []

    medRecords = makeMedRecFromPatient(d)
    pregnancy = makePregnancyFromPatient(d)

    # Since "base" doesn't have a column in the database, we must remove it from its
    # marshalled representation before converting back to an object.
    if d.get("base"):
        del d["base"]

    # Put the readings back into the patient
    patient = __load(Patient, d)
    if readings:
        patient.readings = readings
    if referrals:
        patient.referrals = referrals
    if assessments:
        patient.followups = assessments
    if medRecords:
        patient.records = medRecords
    if pregnancy:
        patient.pregnancies = pregnancy
    if forms:
        patient.forms = forms

    return patient


def makeMedRecFromPatient(patient: dict) -> MedicalRecord:
    drugRec = {}
    medRec = {}
    if "drugHistory" in patient:
        if patient["drugHistory"]:
            drugRec = {
                "patientId": patient["patientId"],
                "information": patient["drugHistory"],
                "isDrugRecord": True,
            }
        del patient["drugHistory"]
    if "medicalHistory" in patient:
        if patient["medicalHistory"]:
            medRec = {
                "patientId": patient["patientId"],
                "information": patient["medicalHistory"],
                "isDrugRecord": False,
            }
        del patient["medicalHistory"]

    records = []
    if drugRec:
        records.append(drugRec)
    if medRec:
        records.append(medRec)

    medicalRecord = [unmarshal(MedicalRecord, m) for m in records]
    return medicalRecord


def makePregnancyFromPatient(patient: dict) -> Pregnancy:
    pregnancyObj = {}
    if patient.get("pregnancyStartDate"):
        pregnancyObj = {
            "patientId": patient["patientId"],
            "startDate": patient.pop("pregnancyStartDate"),
            "defaultTimeUnit": patient.pop("gestationalAgeUnit"),
        }

    if "isPregnant" in patient:
        del patient["isPregnant"]
    if "pregnancyStartDate" in patient:
        del patient["pregnancyStartDate"]

    if pregnancyObj:
        pregnancy = [unmarshal(Pregnancy, pregnancyObj)]
    else:
        pregnancy = []

    return pregnancy


def __unmarshal_form(d: dict) -> Form:
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])

    form = __load(Form, d)

    if questions:
        form.questions = questions

    return form


def __unmarshal_form_template(d: dict) -> FormTemplate:
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])

    form_template = __load(FormTemplate, d)

    if questions:
        form_template.questions = questions

    return form_template


def __unmarshal_reading(d: dict) -> Reading:
    # Convert "symptoms" from array to string, if plural number of symptoms
    symptomsGiven = d.get("symptoms")
    if symptomsGiven is not None:
        if isinstance(symptomsGiven, list):
            d["symptoms"] = ",".join(d["symptoms"])

    reading = __load(Reading, d)

    invariant.resolve_reading_invariants(reading)

    return reading


def __unmarshal_lang_version(d: dict) -> QuestionLangVersion:
    # Convert "mcOptions" from json dict to string
    mc_options = d.get("mcOptions")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mcOptions"] = json.dumps(mc_options)

    lang_version = __load(QuestionLangVersion, d)

    return lang_version


def __unmarshal_question(d: dict) -> Question:
    # Convert "visibleCondition" from json dict to string
    visible_condition = d.get("visibleCondition")
    if visible_condition is not None:
        d["visibleCondition"] = json.dumps(visible_condition)
    # Convert "mcOptions" from json dict to string
    mc_options = d.get("mcOptions")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mcOptions"] = json.dumps(mc_options)
    # Convert "answers" from json dict to string
    answers = d.get("answers")
    if answers is not None:
        d["answers"] = json.dumps(answers)
    # Unmarshal any lang versions found within the question
    lang_versions = []
    if d.get("questionLangVersions") is not None:
        lang_versions = [
            unmarshal(QuestionLangVersion, v) for v in d["questionLangVersions"]
        ]
        # Delete the entry so that we don't try to unmarshal them again by loading from
        # the question schema.
        del d["questionLangVersions"]

    question = __load(Question, d)

    if lang_versions:
        question.lang_versions = lang_versions

    return question


def unmarshal_question_list(d: list) -> List[Question]:
    # Unmarshal any questions found within the list, return a list of questions
    return [__unmarshal_question(q) for q in d]


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
