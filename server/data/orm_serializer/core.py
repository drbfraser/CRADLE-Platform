
from collections.abc import Mapping
from typing import Any, List, Optional, Type

from .workflows import (
    __marshal_form_template,
    __marshal_workflow_classification,
    __marshal_workflow_collection,
    __marshal_workflow_instance,
    __marshal_workflow_instance_step,
    __marshal_workflow_template,
    __marshal_workflow_template_step,
    __marshal_workflow_template_step_branch,
)

from common import commonUtil
from common.form_utils import filter_template_questions_orm
from data.db_operations import M
from models import (
    AssessmentOrm,
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
    RuleGroupOrm,
    SmsSecretKeyOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)

from .forms import (
    __marshal_form,
    __unmarshal_form,
    __unmarshal_form_template
)

from .patients import (
    __marshal_patient,
    __unmarshal_patient
)

from .questions import (
    __marshal_question,
    __marshal_lang_version,
    __unmarshal_lang_version,
    __unmarshal_question
)

from .records import (
    __marshal_pregnancy,
    __marshal_assessment,
    __marshal_referral,
    __marshal_reading,
    __marshal_medical_record,
    __unmarshal_reading
)

from .phone import (
    __unmarshal_RelayServerPhoneNumber,
    __marshal_SmsSecretKey,
    __unmarshal_SmsSecretKey
)

from .utils import (
    __load,
    __pre_process
)

from .workflows import (
    __marshal_workflow_template_step_branch,
    __unmarshal_workflow_template_step_branch,
    __unmarshal_workflow_template_step,
    __marshal_workflow_template_step,
    __unmarshal_workflow_template,
    __marshal_workflow_template,
    __marshal_rule_group,
    __marshal_workflow_classification,
    __marshal_workflow_collection,
    __marshal_workflow_instance,
    __marshal_workflow_instance_step,
    __unmarshal_workflow_instance_step,
    __unmarshal_workflow_instance
)

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


def unmarshal_question_list(d: list) -> List[QuestionOrm]:
    """
    Unmarshal a list of question dicts into ``QuestionOrm`` instances.

    :param d: List of question payload dictionaries.
    :return: List of ``QuestionOrm`` instances.
    """
    # Unmarshal any questions found within the list, return a list of questions
    return [__unmarshal_question(q) for q in d]


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


