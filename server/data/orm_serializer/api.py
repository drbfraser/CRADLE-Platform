from typing import Any, Type

from common import commonUtil
from data.db_operations import M
from models import (
    AssessmentOrm,
    FormAnswerOrmV2,
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
)

from .forms import (
    __marshal_form,
    __marshal_form_answer_v2,
    __marshal_form_question_template_v2,
    __marshal_form_submission_v2,
    __marshal_form_template,
    __marshal_form_template_v2,
    __unmarshal_form,
    __unmarshal_form_answer_v2,
    __unmarshal_form_classification_v2,
    __unmarshal_form_question_template_v2,
    __unmarshal_form_submission_v2,
    __unmarshal_form_template,
    __unmarshal_form_template_v2,
)
from .patients import (
    __marshal_patient,
    __unmarshal_patient,
)
from .phone import (
    __marshal_SmsSecretKey,
    __unmarshal_RelayServerPhoneNumber,
    __unmarshal_SmsSecretKey,
)
from .questions import (
    __marshal_lang_version,
    __marshal_lang_version_v2,
    __marshal_question,
    __unmarshal_lang_version,
    __unmarshal_lang_version_v2,
    __unmarshal_question,
)
from .records import (
    __marshal_assessment,
    __marshal_medical_record,
    __marshal_pregnancy,
    __marshal_reading,
    __marshal_referral,
    __unmarshal_reading,
)
from .utils import __load, __pre_process
from .workflows import (
    __marshal_rule_group,
    __marshal_workflow_classification,
    __marshal_workflow_collection,
    __marshal_workflow_instance,
    __marshal_workflow_instance_step,
    __marshal_workflow_template,
    __marshal_workflow_template_step,
    __marshal_workflow_template_step_branch,
    __unmarshal_workflow_instance,
    __unmarshal_workflow_instance_step,
    __unmarshal_workflow_template,
    __unmarshal_workflow_template_step,
    __unmarshal_workflow_template_step_branch,
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
