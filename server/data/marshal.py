import collections
import json
from enum import Enum
from typing import Any, Dict, List, Optional, Type

from common import commonUtil
from common.form_utils import filter_template_questions_orm
from data.crud import M
from models import (
    AssessmentOrm,
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
    ReadingOrm,
    ReferralOrm,
    RelayServerPhoneNumberOrm,
    SmsSecretKeyOrm,
)
from service import invariant


def marshal(obj: Any, shallow=False, if_include_versions=False) -> dict:
    """
    Recursively marshals an object to a dictionary.

    :param obj: The object to marshal
    :param shallow: If true, only the top level fields will be marshalled
    :param if_include_versions: If true, lang versions will be attached to questions
    :return: A dictionary mapping fields to values
    """
    if isinstance(obj, PatientOrm):
        return __marshal_patient(obj, shallow)
    if isinstance(obj, ReadingOrm):
        return __marshal_reading(obj, shallow)
    if isinstance(obj, ReferralOrm):
        return __marshal_referral(obj)
    if isinstance(obj, AssessmentOrm):
        return __marshal_assessment(obj)
    if isinstance(obj, PregnancyOrm):
        return __marshal_pregnancy(obj)
    if isinstance(obj, MedicalRecordOrm):
        return __marshal_medical_record(obj)
    if isinstance(obj, FormTemplateOrm):
        return __marshal_form_template(obj, shallow, if_include_versions)
    if isinstance(obj, FormOrm):
        return __marshal_form(obj, shallow)
    if isinstance(obj, QuestionOrm):
        return __marshal_question(obj, if_include_versions)
    if isinstance(obj, QuestionLangVersionOrm):
        return __marshal_lang_version(obj)
    if isinstance(obj, SmsSecretKeyOrm):
        return __marshal_SmsSecretKey(obj)
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
    if isinstance(obj, PatientOrm):
        patient_dict = __marshal_patient(obj, shallow)
        patient_dict["type"] = "patient"
        return patient_dict
    if isinstance(obj, ReadingOrm):
        reading_dict = __marshal_reading(obj, shallow)
        reading_dict["type"] = "reading"
        return reading_dict
    if isinstance(obj, ReferralOrm):
        referral_dict = __marshal_referral(obj)
        referral_dict["type"] = "referral"
        return referral_dict
    if isinstance(obj, AssessmentOrm):
        assessment_dict = __marshal_assessment(obj)
        assessment_dict["type"] = "assessment"
        return assessment_dict
    if isinstance(obj, PregnancyOrm):
        pregnancy_dict = __marshal_pregnancy(obj)
        pregnancy_dict["type"] = "pregnancy"
        return pregnancy_dict
    if isinstance(obj, MedicalRecordOrm):
        medical_record_dict = __marshal_medical_record(obj)
        medical_record_dict["type"] = "medical_record"
        return medical_record_dict
    if isinstance(obj, FormOrm):
        form_dict = __marshal_form(obj, True)
        form_dict["type"] = "form"
        return form_dict
    d = vars(obj).copy()
    __pre_process(d)
    d["type"] = "other"
    return d


def marshal_patient_pregnancy_summary(records: List[PregnancyOrm]) -> dict:
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


def __marshal_patient(p: PatientOrm, shallow) -> dict:
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


def __marshal_reading(r: ReadingOrm, shallow) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    if not d.get("symptoms"):
        d["symptoms"] = []
    if d.get("symptoms"):
        d["symptoms"] = d["symptoms"].split(",")
    if not shallow and r.urine_tests is not None:
        d["urine_tests"] = marshal(r.urine_tests)
    return d


def __marshal_referral(r: ReferralOrm) -> dict:
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("health_facility"):
        del d["health_facility"]
    if d.get("patient"):
        del d["patient"]
    return d


def __marshal_assessment(f: AssessmentOrm) -> dict:
    d = vars(f).copy()
    __pre_process(d)
    # Remove relationship objects
    if d.get("health_facility"):
        del d["health_facility"]
    return d


def __marshal_pregnancy(p: PregnancyOrm) -> dict:
    return {
        "id": p.id,
        "patient_id": p.patient_id,
        "start_date": p.start_date,
        "end_date": p.end_date,
        "outcome": p.outcome,
        "last_edited": p.last_edited,
    }


def __marshal_medical_record(r: MedicalRecordOrm) -> dict:
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


def __marshal_form_template(
    f: FormTemplateOrm,
    shallow: bool = False,
    if_include_versions: bool = False,
) -> dict:
    f = filter_template_questions_orm(f)

    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    if shallow:
        del d["questions"]
    else:
        d["questions"] = [
            __marshal_question(q, if_include_versions) for q in f.questions
        ]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def marshal_template_to_single_version(f: FormTemplateOrm, version: str) -> dict:
    f = filter_template_questions_orm(f)

    d = vars(f).copy()
    __pre_process(d)

    d["lang"] = version
    d["questions"] = [
        marshal_question_to_single_version(q, version) for q in f.questions
    ]

    # sort question list based on question index in ascending order
    if d["questions"]:
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_form(f: FormOrm, shallow) -> dict:
    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    # Remove relationship object
    if d.get("patient"):
        del d["patient"]

    if not shallow:
        d["questions"] = [marshal(q) for q in f.questions]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_question(q: QuestionOrm, if_include_versions: bool) -> dict:
    d = vars(q).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("form"):
        del d["form"]
    if d.get("form_template"):
        del d["form_template"]
    if d.get("category_question"):
        del d["category_question"]

    # marshal visible_conditions, mc_options, answers to json dict
    visible_condition = d["visible_condition"]
    d["visible_condition"] = json.loads(visible_condition)
    mc_options = d["mc_options"]
    d["mc_options"] = json.loads(mc_options)
    answers = d["answers"]
    d["answers"] = json.loads(answers)

    if if_include_versions:
        d["lang_versions"] = [marshal(v) for v in q.lang_versions]

    return d


def marshal_question_to_single_version(q: QuestionOrm, version: str) -> dict:
    d = __marshal_question(q, False)
    version_info = [marshal(v) for v in q.lang_versions if v.lang == version][0]

    d["question_text"] = version_info["question_text"]
    if "mc_options" in version_info:
        d["mc_options"] = version_info["mc_options"]

    return d


def __marshal_lang_version(v: QuestionLangVersionOrm) -> dict:
    d = vars(v).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("question"):
        del d["question"]
    # Remove mc_options if default empty list
    if d.get("mc_options") == "[]":
        del d["mc_options"]
    else:
        # marshal mc_options to json dict
        d["mc_options"] = json.loads(d["mc_options"])

    return d


def __marshal_form_classification(
    fc: FormClassificationOrm,
    if_include_templates: bool = False,
) -> dict:
    d = vars(fc).copy()
    __pre_process(d)

    if d.get("templates") is not None:
        del d["templates"]

    if if_include_templates:
        d["templates"] = [__marshal_form_template(t) for t in fc.templates]

    return d


def __marshal_SmsSecretKey(s: SmsSecretKeyOrm):
    return {
        "id": s.id,
        "user_id": s.user_id,
        "secret_key": s.secret_key,
        "stale_date": s.stale_date,
        "expiry_date": s.expiry_date,
    }


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

    Special care is taken for ``ReadingOrm`` models (and any thing which contains a nested
    ``ReadingOrm`` model) because their database schema is different from their dictionary
    representation, most notably the symptoms field.

    For ``PatientOrm`` and ``ReadingOrm`` types, the instance returned by this function may
    not be sound as there are various invariants that must be held for ``ReadingOrm``
    objects. One should call ``service.invariant.resolve_reading_invariants`` on the
    instance created by this function.

    :param m: The type of model to construct
    :param d: A dictionary mapping columns to values used to construct the model
    :return: A model
    """
    # Marshmallow will throw an exception if a field is None, but doesn't throw
    # if the field is absent entirely.
    d = commonUtil.filterNestedAttributeWithValueNone(d)

    if m is PatientOrm:
        return __unmarshal_patient(d)
    if m is ReadingOrm:
        return __unmarshal_reading(d)
    if m is FormOrm:
        return __unmarshal_form(d)
    if m is FormTemplateOrm:
        return __unmarshal_form_template(d)
    if m is QuestionOrm:
        return __unmarshal_question(d)
    if m is QuestionLangVersionOrm:
        return __unmarshal_lang_version(d)
    if m is SmsSecretKeyOrm:
        return __unmarshal_SmsSecretKey(d)
    if m is RelayServerPhoneNumberOrm:
        return __unmarshal_RelayServerPhoneNumber(d)
    return __load(m, d)


def __load(m: Type[M], d: dict) -> M:
    schema = m.schema()
    return schema().load(d)


def __unmarshal_patient(d: dict) -> PatientOrm:
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


def make_medical_record_from_patient(patient: dict) -> MedicalRecordOrm:
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

    record = [unmarshal(MedicalRecordOrm, m) for m in records]
    return record


def makePregnancyFromPatient(patient: dict) -> PregnancyOrm:
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
        pregnancy = [unmarshal(PregnancyOrm, pregnancyObj)]
    else:
        pregnancy = []

    return pregnancy


def __unmarshal_form(d: dict) -> FormOrm:
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])

    form = __load(FormOrm, d)

    if questions:
        form.questions = questions

    return form


def __unmarshal_form_template(d: dict) -> FormTemplateOrm:
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])
        del d["questions"]

    form_template_orm = FormTemplateOrm(**d)

    # form_template = __load(FormTemplateOrm, d)

    form_template_orm.questions = questions

    return form_template_orm


def __unmarshal_reading(d: dict) -> ReadingOrm:
    # Convert "symptoms" from array to string, if plural number of symptoms
    symptomsGiven = d.get("symptoms")
    if symptomsGiven is not None:
        if isinstance(symptomsGiven, list):
            d["symptoms"] = ",".join(d["symptoms"])

    reading = __load(ReadingOrm, d)

    invariant.resolve_reading_invariants(reading)

    return reading


def __unmarshal_lang_version(d: dict) -> QuestionLangVersionOrm:
    # Convert "mc_options" from json dict to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)

    lang_version = __load(QuestionLangVersionOrm, d)

    return lang_version


def __unmarshal_question(d: dict) -> QuestionOrm:
    # Convert "visible_condition" from json dict to string
    visible_condition = d.get("visible_condition")
    if visible_condition is not None:
        d["visible_condition"] = json.dumps(visible_condition)
    # Convert "mc_options" from json dict to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)
    # Convert "answers" from json dict to string
    answers = d.get("answers")
    if answers is not None:
        d["answers"] = json.dumps(answers)

    # Unmarshal any lang versions found within the question
    question_lang_version_orms: list[QuestionLangVersionOrm] = []
    lang_version_dicts = d.get("lang_versions")
    if lang_version_dicts is not None:
        del d["lang_versions"]
        question_lang_version_orms = [
            unmarshal(QuestionLangVersionOrm, v) for v in lang_version_dicts
        ]

    question_orm = __load(QuestionOrm, d)

    question_orm.lang_versions = question_lang_version_orms

    return question_orm


def __unmarshal_RelayServerPhoneNumber(d: dict) -> RelayServerPhoneNumberOrm:
    relay_server_phone = __load(RelayServerPhoneNumberOrm, d)
    relay_server_phone.phone = d["phone"]
    relay_server_phone.description = d["description"]
    return relay_server_phone


def __unmarshal_SmsSecretKey(d: dict) -> SmsSecretKeyOrm:
    sms_secret_key = __load(SmsSecretKeyOrm, d)
    sms_secret_key.user_id = d["user_id"]
    sms_secret_key.secret_key = d["secret_key"]
    sms_secret_key.stale_date = d["stale_date"]
    sms_secret_key.expiry_date = d["expiry_date"]
    return sms_secret_key


def unmarshal_question_list(d: list) -> List[QuestionOrm]:
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
