import json
import logging
from collections.abc import Mapping
from enum import Enum
from typing import Any, Dict, List, Optional, Type

from common import commonUtil
from common.form_utils import filter_template_questions_orm
from data import db_session
from data.db_operations import M
from models import (
    AssessmentOrm,
    FormAnswerOrmV2,
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormOrm,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrm,
    FormTemplateOrmV2,
    LangVersionOrmV2,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
    ReadingOrm,
    ReferralOrm,
    RelayServerPhoneNumberOrm,
    RuleGroupOrm,
    SmsSecretKeyOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
    get_schema_for_model,
)
from service import invariant

logger = logging.getLogger(__name__)


def marshal(obj: Any, shallow: bool = False, if_include_versions: bool = False) -> dict:
    r"""
    Serialize an ORM model or plain object to a JSON-ready ``dict``.

    The function inspects ``obj`` and dispatches to a model-specific marshaller
    when available; otherwise it copies public attributes, drops ``None``/private
    fields, and coerces ``Enum`` values to ``.value``.

    :param obj: Object to serialize (e.g., ``PatientOrm``, ``ReadingOrm``).
    :param shallow: If ``True``, omit nested relationships for a lightweight view.
    :param if_include_versions: For question models, include language versions.
    :return: JSON-serializable dictionary for ``obj``.
    """
    if isinstance(obj, LangVersionOrmV2):
        return __marshal_lang_version_v2(obj)
    if isinstance(obj, FormTemplateOrmV2):
        return __marshal_form_template_v2(obj, shallow)
    if isinstance(obj, FormQuestionTemplateOrmV2):
        return __marshal_form_question_template_v2(obj)
    if isinstance(obj, FormSubmissionOrmV2):
        return __marshal_form_submission_v2(obj, shallow)
    if isinstance(obj, FormAnswerOrmV2):
        return __marshal_form_answer_v2(obj)
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
    if isinstance(obj, RuleGroupOrm):
        return __marshal_rule_group(obj)
    if isinstance(obj, WorkflowTemplateStepBranchOrm):
        return __marshal_workflow_template_step_branch(obj)
    if isinstance(obj, WorkflowTemplateStepOrm):
        return __marshal_workflow_template_step(obj, shallow)
    if isinstance(obj, WorkflowTemplateOrm):
        return __marshal_workflow_template(obj, shallow)
    if isinstance(obj, WorkflowClassificationOrm):
        return __marshal_workflow_classification(obj, if_include_versions, shallow)
    if isinstance(obj, WorkflowInstanceStepOrm):
        return __marshal_workflow_instance_step(obj)
    if isinstance(obj, WorkflowInstanceOrm):
        return __marshal_workflow_instance(obj, shallow)
    if isinstance(obj, WorkflowCollectionOrm):
        return __marshal_workflow_collection(obj, shallow)

    d = vars(obj).copy()
    __pre_process(d)
    return d


def marshal_with_type(obj: Any, shallow: bool = False) -> dict:
    """
    Serialize an object and add a ``type`` discriminator (for summary cards).

    :param obj: Object to marshal.
    :param shallow: If ``True``, omit nested relationships.
    :return: Dictionary representation with an added ``type`` field.
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


def __marshal_form_template(
    f: FormTemplateOrm,
    shallow: bool = False,
    if_include_versions: bool = False,
) -> dict:
    """
    Serialize a ``FormTemplateOrm``; embed classification and (optionally) questions.

    :param f: Form template instance to serialize.
    :param shallow: If ``True``, omit questions.
    :param if_include_versions: If ``True``, include question language versions.
    :return: Form-template dictionary.
    """
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
    """
    Serialize a ``FormTemplateOrm`` restricting questions to a single language.

    :param f: Form template instance to serialize.
    :param version: Language code to select in question ``lang_versions``.
    :return: Form-template dictionary restricted to the requested language.
    """
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


def __marshal_form(f: FormOrm, shallow: bool) -> dict:
    """
    Serialize a ``FormOrm``; embed classification and optionally include questions.

    :param f: Form instance to serialize.
    :param shallow: If ``True``, omit questions from the output.
    :return: Form dictionary for API responses.
    """
    d = vars(f).copy()
    __pre_process(d)

    d["classification"] = __marshal_form_classification(f.classification)

    # Remove relationship object
    if d.get("patient"):
        del d["patient"]

    if shallow and "questions" in d:
        del d["questions"]

    if not shallow:
        d["questions"] = [marshal(q) for q in f.questions]
        # sort question list based on question index in ascending order
        d["questions"].sort(key=lambda q: q["question_index"])

    return d


def __marshal_question(q: QuestionOrm, if_include_versions: bool) -> dict:
    """
    Serialize a ``QuestionOrm``; parse JSON fields and optionally include versions.

    :param q: Question instance to serialize.
    :param if_include_versions: If ``True``, include ``lang_versions``.
    :return: Question dictionary with parsed JSON fields.
    """
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
    elif not if_include_versions and "lang_versions" in d:
        del d["lang_versions"]

    return d


def __marshal_question_v2(
    q: FormQuestionTemplateOrmV2, if_include_versions: bool
) -> dict:
    """
    Serialize a FormQuestionTemplateOrmV2; parse JSON fields and optionally include language versions.

    :param q: Question instance to serialize.
    :param if_include_versions: If True, include lang_versions (translations) for the question.
    :return: Dictionary with all fields ready for API response.
    """
    d = vars(q).copy()
    __pre_process(d)

    for rel in ["template", "category_question"]:
        if d.get(rel):
            del d[rel]

    for json_field in ["visible_condition", "mc_options"]:
        value = d.get(json_field)
        if value:
            try:
                d[json_field] = json.loads(value)
            except (TypeError, json.JSONDecodeError):
                d[json_field] = []

        else:
            d[json_field] = []

    # include language versions if requested
    if if_include_versions:
        d["lang_versions"] = [
            {
                "string_id": lv.string_id,
                "lang": lv.lang,
                "text": lv.text,
            }
            for lv in q.lang_versions
        ]
    elif "lang_versions" in d:
        del d["lang_versions"]

    return d


def marshal_question_to_single_version(q: QuestionOrm, version: str) -> dict:
    """
    Serialize a question and override text/options from a single language version.

    :param q: Question instance to serialize.
    :param version: Language code to select.
    :return: Question dictionary limited to the selected language.
    :raises IndexError: If the requested ``version`` is not available.
    """
    d = __marshal_question(q, False)
    version_info = [marshal(v) for v in q.lang_versions if v.lang == version][0]

    d["question_text"] = version_info["question_text"]
    if "mc_options" in version_info:
        d["mc_options"] = version_info["mc_options"]

    return d


def __marshal_lang_version(v: QuestionLangVersionOrm) -> dict:
    """
    Serialize a ``QuestionLangVersionOrm``; cast ``mc_options`` and drop backrefs.

    :param v: Language-version instance to serialize.
    :return: Language-version dictionary with ``mc_options`` normalized.
    """
    d = vars(v).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("question"):
        del d["question"]
    # Remove mc_options if default empty list; otherwise parse from JSON string
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
    """
    Serialize a ``FormClassificationOrm``; optionally embed its templates.

    :param fc: Form classification instance to serialize.
    :param if_include_templates: If ``True``, include serialized templates.
    :return: Classification dictionary.
    """
    d = vars(fc).copy()
    __pre_process(d)

    if d.get("templates") is not None:
        del d["templates"]

    if if_include_templates:
        d["templates"] = [__marshal_form_template(t) for t in fc.templates]

    return d


def __marshal_SmsSecretKey(s: SmsSecretKeyOrm) -> dict:
    """
    Serialize an ``SmsSecretKeyOrm``; preserve raw datetime fields.

    :param s: SmsSecretKey instance to serialize.
    :return: Dict with ``id``, ``user_id``, ``secret_key``, ``stale_date``, ``expiry_date``.
    """
    return {
        "id": s.id,
        "user_id": s.user_id,
        "secret_key": s.secret_key,
        "stale_date": s.stale_date,
        "expiry_date": s.expiry_date,
    }


def __marshal_rule_group(rg: RuleGroupOrm) -> dict:
    """
    Serialize a ``RuleGroupOrm``. ``__pre_process`` removes private/``None`` fields.

    :param rg: RuleGroup instance to serialize.
    :return: Rule-group dictionary.
    """
    d = vars(rg).copy()
    __pre_process(d)

    return d


def __marshal_workflow_collection(
    wf_collection: WorkflowCollectionOrm, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowCollectionOrm``; optionally include nested classifications.

    :param wf_collection: Workflow collection to serialize.
    :param shallow: If ``True``, omit nested classifications.
    :return: Workflow-collection dictionary.
    """
    d = vars(wf_collection).copy()
    __pre_process(d)

    if not shallow:
        d["classifications"] = [
            __marshal_workflow_classification(
                workflow_classification, if_include_templates=False
            )
            for workflow_classification in wf_collection.workflow_classifications
        ]

    return d


def __marshal_workflow_template_step_branch(
    wtsb: WorkflowTemplateStepBranchOrm,
) -> dict:
    """
    Serialize a ``WorkflowTemplateStepBranchOrm``; include ``condition`` if present.

    :param wtsb: Workflow template step branch instance.
    :return: Branch dictionary with optional serialized ``condition``.
    """
    d = vars(wtsb).copy()
    __pre_process(d)

    if wtsb.condition is not None:
        d["condition"] = __marshal_rule_group(wtsb.condition)

    return d


def __marshal_workflow_template_step(
    wts: WorkflowTemplateStepOrm, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowTemplateStepOrm``; embed form and optionally branches.

    :param wts: Workflow template step to serialize.
    :param shallow: If ``True``, omit branches.
    :return: Workflow-template-step dictionary including serialized form.
    """
    d = vars(wts).copy()
    __pre_process(d)

    if wts.form:
        d["form"] = __marshal_form_template(wts.form)

    if not shallow:
        d["branches"] = [
            __marshal_workflow_template_step_branch(wtsb) for wtsb in wts.branches
        ]

    return d


def __marshal_workflow_template(wt: WorkflowTemplateOrm, shallow: bool = False) -> dict:
    """
    Serialize a ``WorkflowTemplateOrm``; include classification and optionally steps.

    :param wt: Workflow template to serialize.
    :param shallow: If ``True``, omit steps.
    :return: Workflow-template dictionary.
    """
    d = vars(wt).copy()
    __pre_process(d)

    if wt.classification:
        d["classification"] = __marshal_workflow_classification(
            wc=wt.classification, if_include_templates=False
        )

    if not shallow:
        d["steps"] = [__marshal_workflow_template_step(wts=wts) for wts in wt.steps]
    elif "steps" in d:
        del d["steps"]

    return d


def __marshal_workflow_classification(
    wc: WorkflowClassificationOrm, if_include_templates: bool, shallow: bool = False
) -> dict:
    """
    Serialize a ``WorkflowClassificationOrm``; optionally include templates.

    :param wc: Workflow classification to serialize.
    :param if_include_templates: If ``True``, embed serialized workflow templates.
    :param shallow: If ``True``, propagate ``shallow`` to nested templates.
    :return: Workflow-classification dictionary.
    """
    d = vars(wc).copy()
    __pre_process(d)

    if d.get("workflow_templates") is not None:
        del d["workflow_templates"]

    if if_include_templates:
        d["workflow_templates"] = [
            __marshal_workflow_template(wt=wt, shallow=shallow) for wt in wc.templates
        ]

    return d


def __marshal_workflow_instance_step(wis: WorkflowInstanceStepOrm) -> dict:
    """
    Serialize a ``WorkflowInstanceStepOrm``; embed a shallow form if present.

    :param wis: Workflow instance step to serialize.
    :return: Workflow-instance-step dictionary with shallow ``form`` (or ``None``).
    """
    d = vars(wis).copy()
    __pre_process(d)

    if wis.form is not None:
        d["form_id"] = wis.form.id
        d["form"] = __marshal_form(wis.form, shallow=True)
    else:
        d["form"] = None

    return d


def __marshal_workflow_instance(wi: WorkflowInstanceOrm, shallow: bool = False) -> dict:
    """
    Serialize a ``WorkflowInstanceOrm``; optionally include steps.

    :param wi: Workflow instance to serialize.
    :param shallow: If ``True``, omit steps.
    :return: Workflow-instance dictionary.
    """
    d = vars(wi).copy()
    __pre_process(d)

    if not shallow:
        d["steps"] = [__marshal_workflow_instance_step(wis) for wis in wi.steps]
    elif "steps" in d:
        del d["steps"]

    return d


def __pre_process(d: Dict[str, Any]):
    """
    In-place cleanup: remove private/``None`` fields and coerce ``Enum`` values.

    :param d: Mutable dictionary to sanitize in place.
    :return: ``None``.
    """
    __strip_protected_attributes(d)
    __strip_none_values(d)
    for k, v in d.items():
        if isinstance(v, Enum):
            d[k] = v.value


def __strip_none_values(d: Dict[str, Any]):
    """
    Remove keys whose values are ``None`` (mutates ``d``).

    :param d: Dictionary to mutate.
    :return: ``None``.
    """
    remove = [k for k in d if d[k] is None]
    for k in remove:
        del d[k]


def __strip_protected_attributes(d: Dict[str, Any]):
    """
    Remove attributes starting with ``_`` (mutates ``d``).

    :param d: Dictionary to mutate.
    :return: ``None``.
    """
    remove = [k for k in d if k.startswith("_")]
    for k in remove:
        del d[k]


def unmarshal(m: Type[M], d: dict) -> M:
    """
    Construct a model instance from a dictionary using the model's schema.

    Special care is taken for ``ReadingOrm`` (and structures that contain it)
    because its DB schema differs from its dictionary representation (e.g.,
    ``symptoms`` handling).

    For ``PatientOrm``/``ReadingOrm``, the returned instance may be incomplete
    until invariants are resolved; call
    ``service.invariant.resolve_reading_invariants`` on the resulting object.

    :param m: Model class to construct.
    :param d: Field dictionary.
    :return: Deserialized model instance.
    :raises marshmallow.ValidationError: If the payload fails schema validation.
    """
    # Marshmallow will throw an exception if a field is None, but doesn't throw
    # if the field is absent entirely.
    d = commonUtil.filterNestedAttributeWithValueNone(d)

    if m is LangVersionOrmV2:
        return __unmarshal_lang_version_v2(d)
    if m is FormClassificationOrmV2:
        return __unmarshal_form_classification_v2(d)
    if m is FormTemplateOrmV2:
        return __unmarshal_form_template_v2(d)
    if m is FormQuestionTemplateOrmV2:
        return __unmarshal_form_question_template_v2(d)
    if m is FormSubmissionOrmV2:
        return __unmarshal_form_submission_v2(d)
    if m is FormAnswerOrmV2:
        return __unmarshal_form_answer_v2(d)
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
    if m is WorkflowTemplateStepBranchOrm:
        return __unmarshal_workflow_template_step_branch(d)
    if m is WorkflowTemplateStepOrm:
        return __unmarshal_workflow_template_step(d)
    if m is WorkflowTemplateOrm:
        return __unmarshal_workflow_template(d)
    if m is WorkflowInstanceStepOrm:
        return __unmarshal_workflow_instance_step(d)
    if m is WorkflowInstanceOrm:
        return __unmarshal_workflow_instance(d)

    return __load(m, d)


def __load(m: Type[M], d: dict) -> M:
    """
    Load a model instance from ``dict`` using the model's Marshmallow schema.

    :param m: Model class to load.
    :param d: Field dictionary for the model.
    :return: Deserialized model instance.
    :raises marshmallow.ValidationError: If validation fails.
    """
    schema = get_schema_for_model(m)
    return schema().load(d)


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

    record = [unmarshal(MedicalRecordOrm, m) for m in records]
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
        pregnancy = [unmarshal(PregnancyOrm, pregnancyObj)]
    else:
        pregnancy = []

    return pregnancy


def __unmarshal_form(d: dict) -> FormOrm:
    """
    Construct a ``FormOrm``; unmarshal nested questions if present.

    :param d: Form payload (may include a ``questions`` list).
    :return: ``FormOrm`` with optional questions attached.
    """
    questions = []
    if d.get("questions") is not None:
        questions = unmarshal_question_list(d["questions"])

    form = __load(FormOrm, d)

    if questions:
        form.questions = questions

    return form


def __unmarshal_form_template(d: dict) -> FormTemplateOrm:
    """
    Construct a ``FormTemplateOrm``; load questions via ``unmarshal_question_list``.

    :param d: FormTemplate payload (may include a ``questions`` list).
    :return: ``FormTemplateOrm`` with questions attached.
    """
    with db_session.no_autoflush:
        questions = []
        if d.get("questions") is not None:
            questions = unmarshal_question_list(d["questions"])
            del d["questions"]

        form_template_orm = __load(FormTemplateOrm, d)

        form_template_orm.questions = questions

        return form_template_orm


def __unmarshal_reading(d: dict) -> ReadingOrm:
    """
    Construct a ``ReadingOrm``; convert symptoms list→CSV and resolve invariants.

    :param d: Reading payload (``symptoms`` may be list or CSV string).
    :return: ``ReadingOrm`` with invariants resolved.
    """
    # Convert "symptoms" from array to string, if plural number of symptoms
    symptomsGiven = d.get("symptoms")
    if symptomsGiven is not None:
        if isinstance(symptomsGiven, list):
            d["symptoms"] = ",".join(d["symptoms"])

    reading = __load(ReadingOrm, d)

    invariant.resolve_reading_invariants(reading)

    return reading


def __unmarshal_lang_version(d: dict) -> QuestionLangVersionOrm:
    """
    Construct a ``QuestionLangVersionOrm``; convert ``mc_options`` list→JSON string.

    :param d: Language-version payload dictionary.
    :return: ``QuestionLangVersionOrm`` instance.
    """
    # Convert "mc_options" from json dict to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)

    lang_version = __load(QuestionLangVersionOrm, d)

    return lang_version


def __unmarshal_question(d: dict) -> QuestionOrm:
    """
    Construct a ``QuestionOrm``; encode JSON-able fields and attach ``lang_versions``.

    :param d: Question payload (may include ``visible_condition``/``mc_options``/
        ``answers`` and ``lang_versions``).
    :return: ``QuestionOrm`` with nested ``lang_versions`` attached if provided.
    """
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
    """
    Construct a ``RelayServerPhoneNumberOrm`` and copy simple scalar fields.

    :param d: Relay server phone payload dictionary.
    :return: ``RelayServerPhoneNumberOrm`` instance.
    """
    relay_server_phone = __load(RelayServerPhoneNumberOrm, d)
    relay_server_phone.phone = d["phone"]
    relay_server_phone.description = d["description"]
    return relay_server_phone


def __unmarshal_SmsSecretKey(d: dict) -> SmsSecretKeyOrm:
    """
    Construct an ``SmsSecretKeyOrm`` and copy scalar fields from the payload.

    :param d: SMS secret key payload dictionary.
    :return: ``SmsSecretKeyOrm`` instance.
    """
    sms_secret_key = __load(SmsSecretKeyOrm, d)
    sms_secret_key.user_id = d["user_id"]
    sms_secret_key.secret_key = d["secret_key"]
    sms_secret_key.stale_date = d["stale_date"]
    sms_secret_key.expiry_date = d["expiry_date"]
    return sms_secret_key


def unmarshal_question_list(d: list) -> List[QuestionOrm]:
    """
    Unmarshal a list of question dicts into ``QuestionOrm`` instances.

    :param d: List of question payload dictionaries.
    :return: List of ``QuestionOrm`` instances.
    """
    # Unmarshal any questions found within the list, return a list of questions
    return [__unmarshal_question(q) for q in d]


def __unmarshal_workflow_template_step_branch(d: dict) -> WorkflowTemplateStepBranchOrm:
    """
    Construct a ``WorkflowTemplateStepBranchOrm`` and unmarshal its condition if present.

    :param d: Workflow template step branch payload dictionary.
    :return: ``WorkflowTemplateStepBranchOrm`` with optional ``condition``.
    """
    template_step_branch_orm = __load(WorkflowTemplateStepBranchOrm, d)

    if d.get("condition") is not None:
        template_step_branch_orm.condition = __load(RuleGroupOrm, d.get("condition"))

    return template_step_branch_orm


def __unmarshal_workflow_template_step(d: dict) -> WorkflowTemplateStepOrm:
    """
    Construct a ``WorkflowTemplateStepOrm``; attach branches and form if provided.

    :param d: Workflow template step payload dictionary.
    :return: ``WorkflowTemplateStepOrm`` with branches/form set.
    """
    branches = []
    form = None

    if d.get("branches") is not None:
        branches = [
            __unmarshal_workflow_template_step_branch(b) for b in d.get("branches")
        ]
        del d["branches"]

    if d.get("form") is not None:
        form = __unmarshal_form_template(d.get("form"))
        del d["form"]

    workflow_template_step_orm = __load(WorkflowTemplateStepOrm, d)
    workflow_template_step_orm.branches = branches
    workflow_template_step_orm.form = form

    return workflow_template_step_orm


def __unmarshal_workflow_template(d: dict) -> WorkflowTemplateOrm:
    """
    Construct a ``WorkflowTemplateOrm``; attach steps and classification if provided.

    :param d: Workflow template payload dictionary.
    :return: ``WorkflowTemplateOrm`` with steps/classification set.
    """
    with db_session.no_autoflush:
        steps = []
        classification = None

        if d.get("steps") is not None:
            steps = [__unmarshal_workflow_template_step(s) for s in d.get("steps")]
            del d["steps"]

        if d.get("classification") is not None:
            classification = __load(WorkflowClassificationOrm, d.get("classification"))
            del d["classification"]

        workflow_template_orm = __load(WorkflowTemplateOrm, d)
        workflow_template_orm.steps = steps
        workflow_template_orm.classification = classification

    return workflow_template_orm


def __unmarshal_workflow_instance_step(d: dict) -> WorkflowInstanceStepOrm:
    """
    Construct a ``WorkflowInstanceStepOrm``; unmarshal its form if present.

    :param d: Workflow instance step payload dictionary.
    :return: ``WorkflowInstanceStepOrm`` with optional form.
    """
    form = None

    if d.get("form") is not None:
        form = __unmarshal_form(d.get("form"))
        del d["form"]

    workflow_instance_step_orm = __load(WorkflowInstanceStepOrm, d)
    workflow_instance_step_orm.form = form

    return workflow_instance_step_orm


def __unmarshal_workflow_instance(d: dict) -> WorkflowInstanceOrm:
    """
    Construct a ``WorkflowInstanceOrm``; attach steps if present.

    :param d: Workflow instance payload dictionary.
    :return: ``WorkflowInstanceOrm`` with steps set.
    """
    steps = []

    if d.get("steps") is not None:
        steps = [__unmarshal_workflow_instance_step(d) for d in d.get("steps")]
        del d["steps"]

    workflow_instance_orm = __load(WorkflowInstanceOrm, d)
    workflow_instance_orm.steps = steps

    return workflow_instance_orm


## Functions taken from the original Database.py ##
## To-Do: Integrate them properly with the current marshal functions, it looks like there may be some overlap


def models_to_list(models: List[Any], schema) -> List[dict]:
    """
    Converts a list of models into a list of dictionaries mapping column names
    to values.

    :param models: List of model instances.
    :param schema: The schema of the models
    :return: List of dictionaries.
    """
    return schema(many=True).dump(models)


def model_to_dict(model: Any, schema) -> Optional[dict]:
    """
    Converts a model into a dictionary mapping column names to values.

    :param model: Model instance (or mapping stub).
    :param schema: The schema of the model
    :return: Dict, or ``None`` if ``model`` is falsy. Returns ``model`` as-is if it
        already implements ``Mapping`` (local DB stub).
    """
    if not model:
        return None
    if isinstance(model, Mapping):  # Local database stub
        return model
    return schema().dump(model)


def __marshal_lang_version_v2(lv: LangVersionOrmV2) -> dict:
    """
    Serialize a ``LangVersionOrmV2`` translation entry.

    :param lv: Language version instance to serialize.
    :return: Translation dictionary with string_id, lang, and text.
    """
    d = vars(lv).copy()
    __pre_process(d)
    return d


def __marshal_form_template_v2(
    ft: FormTemplateOrmV2,
    shallow: bool = False,
) -> dict:
    """
    Serialize a ``FormTemplateOrmV2``; embed classification and optionally questions.

    :param ft: Form template V2 instance to serialize.
    :param shallow: If ``True``, omit questions.
    :return: Form-template dictionary with version, archived, optionally questions, and is_latest flags.
    """
    d = vars(ft).copy()
    __pre_process(d)

    if ft.classification:
        d["classification"] = {
            "id": ft.classification.id,
            "name_string_id": ft.classification.name_string_id,
        }
    else:
        d["classification"] = None

    if shallow:
        if d.get("questions"):
            del d["questions"]
    else:
        d["questions"] = [__marshal_form_question_template_v2(q) for q in ft.questions]
        # Sort question list based on order in ascending order
        d["questions"].sort(key=lambda q: q["order"])

    return d


def __marshal_form_question_template_v2(q: FormQuestionTemplateOrmV2) -> dict:
    """
    Serialize a ``FormQuestionTemplateOrmV2``; parse JSON fields.

    :param q: Question template instance to serialize.
    :return: Question dictionary with parsed visible_condition and mc_options.
    """
    d = vars(q).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("template"):
        del d["template"]

    # Parse JSON fields
    visible_condition = d.get("visible_condition")
    if visible_condition is not None and visible_condition != "":
        d["visible_condition"] = json.loads(visible_condition)
    else:
        d["visible_condition"] = []

    mc_options = d.get("mc_options")
    if mc_options is not None and mc_options != "":
        d["mc_options"] = json.loads(mc_options)

    # If mc_options is None or empty, remove it from dict (it's optional)
    elif "mc_options" in d:
        del d["mc_options"]

    return d


def __marshal_form_submission_v2(
    fs: FormSubmissionOrmV2,
    shallow: bool = False,
) -> dict:
    """
    Serialize a ``FormSubmissionOrmV2``; optionally embed answers.

    :param fs: Form submission V2 instance to serialize.
    :param shallow: If ``True``, omit answers from the output.
    :return: Submission dictionary with metadata and optionally answers.
    """
    d = vars(fs).copy()
    __pre_process(d)

    if shallow:
        if d.get("answers"):
            del d["answers"]
    else:
        d["answers"] = [__marshal_form_answer_v2(a) for a in fs.answers]

    return d


def __marshal_form_answer_v2(a: FormAnswerOrmV2) -> dict:
    """
    Serialize a ``FormAnswerOrmV2``; parse the answer JSON field.

    :param a: Form answer instance to serialize.
    :return: Answer dictionary with parsed answer field.
    """
    d = vars(a).copy()
    __pre_process(d)

    # Remove relationship object
    if d.get("submission"):
        del d["submission"]

    # Parse answer JSON field
    answer = d.get("answer")
    if answer is not None and answer != "":
        d["answer"] = json.loads(answer)
    else:
        d["answer"] = {}

    return d


# UNMARSHAL
def __unmarshal_lang_version_v2(d: dict) -> LangVersionOrmV2:
    """
    Construct a ``LangVersionOrmV2`` translation entry.

    :param d: Language version V2 payload dictionary.
    :return: ``LangVersionOrmV2`` instance.
    """
    lang_version_v2 = __load(LangVersionOrmV2, d)
    return lang_version_v2


def __unmarshal_form_classification_v2(d: dict) -> FormClassificationOrmV2:
    """
    Construct a ``FormClassificationOrmV2``; optionally load nested templates.

    :param d: Form classification V2 payload (may include a ``templates`` list).
    :return: ``FormClassificationOrmV2`` with optional templates attached.
    """
    with db_session.no_autoflush:
        templates = []
        if d.get("templates") is not None:
            templates = [__unmarshal_form_template_v2(t) for t in d["templates"]]
            del d["templates"]

        form_classification_v2 = __load(FormClassificationOrmV2, d)

        if templates:
            form_classification_v2.templates = templates

        return form_classification_v2


def __unmarshal_form_template_v2(d: dict) -> FormTemplateOrmV2:
    """
    Construct a ``FormTemplateOrmV2``; load questions.

    :param d: Form template V2 payload (may include a ``questions`` list).
    :return: ``FormTemplateOrmV2`` with questions attached.
    """
    with db_session.no_autoflush:
        questions = []
        if d.get("questions") is not None:
            questions = [
                __unmarshal_form_question_template_v2(q) for q in d["questions"]
            ]
            del d["questions"]

        form_template_v2 = __load(FormTemplateOrmV2, d)

        if questions:
            form_template_v2.questions = questions

        return form_template_v2


def __unmarshal_form_question_template_v2(d: dict) -> FormQuestionTemplateOrmV2:
    """
    Construct a ``FormQuestionTemplateOrmV2``; encode JSON-able fields.

    :param d: Question template payload (may include ``visible_condition`` and
        ``mc_options`` as lists/dicts).
    :return: ``FormQuestionTemplateOrmV2`` instance.
    """
    # Convert "visible_condition" from json dict to string
    visible_condition = d.get("visible_condition")
    if visible_condition is not None:
        if isinstance(visible_condition, (list, dict)):
            d["visible_condition"] = json.dumps(visible_condition)

    # Convert "mc_options" from json list to string
    mc_options = d.get("mc_options")
    if mc_options is not None:
        if isinstance(mc_options, list):
            d["mc_options"] = json.dumps(mc_options)

    question_template_v2 = __load(FormQuestionTemplateOrmV2, d)

    return question_template_v2


def __unmarshal_form_submission_v2(d: dict) -> FormSubmissionOrmV2:
    """
    Construct a ``FormSubmissionOrmV2``; unmarshal nested answers if present.

    :param d: Form submission V2 payload (may include an ``answers`` list).
    :return: ``FormSubmissionOrmV2`` with answers attached.
    """
    with db_session.no_autoflush:
        answers = []
        if d.get("answers") is not None:
            answers = [__unmarshal_form_answer_v2(a) for a in d["answers"]]
            del d["answers"]

        form_submission_v2 = __load(FormSubmissionOrmV2, d)

        if answers:
            form_submission_v2.answers = answers

        return form_submission_v2


def __unmarshal_form_answer_v2(d: dict) -> FormAnswerOrmV2:
    """
    Construct a ``FormAnswerOrmV2``; encode answer dict to JSON string.

    :param d: Form answer V2 payload (may include ``answer`` as a dict).
    :return: ``FormAnswerOrmV2`` instance.
    """
    # Convert "answer" from json dict to string
    answer = d.get("answer")
    if answer is not None:
        if isinstance(answer, dict):
            d["answer"] = json.dumps(answer)

    form_answer_v2 = __load(FormAnswerOrmV2, d)

    return form_answer_v2
