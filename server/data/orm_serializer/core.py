
from collections.abc import Mapping
from typing import Any, List, Optional, Type, Dict, Callable

# from .workflows import (
#     __marshal_form_template,
#     __marshal_workflow_classification,
#     __marshal_workflow_collection,
#     __marshal_workflow_instance,
#     __marshal_workflow_instance_step,
#     __marshal_workflow_template,
#     __marshal_workflow_template_step,
#     __marshal_workflow_template_step_branch,
# )

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

# from .forms import (
    # __marshal_form,
    # __unmarshal_form,
    # __unmarshal_form_template
# )

from .patients import (
    __marshal_patient,
    # __unmarshal_patient
)

# from .questions import (
#     __marshal_question,
#     __marshal_lang_version,
#     __unmarshal_lang_version,
#     __unmarshal_question
# )

from .records import (
#     __marshal_pregnancy,
#     __marshal_assessment,
    __marshal_referral,
    __marshal_reading,
#     __marshal_medical_record,
#     __unmarshal_reading
)

# from .phone import (
#     __unmarshal_RelayServerPhoneNumber,
#     __marshal_SmsSecretKey,
#     __unmarshal_SmsSecretKey
# )

from .utils import (
    __load,
    __pre_process
)

# from .workflows import (
#     __marshal_workflow_template_step_branch,
#     __unmarshal_workflow_template_step_branch,
#     __unmarshal_workflow_template_step,
#     __marshal_workflow_template_step,
#     __unmarshal_workflow_template,
#     __marshal_workflow_template,
#     __marshal_rule_group,
#     __marshal_workflow_classification,
#     __marshal_workflow_collection,
#     __marshal_workflow_instance,
#     __marshal_workflow_instance_step,
#     __unmarshal_workflow_instance_step,
#     __unmarshal_workflow_instance
# )

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
        return __marshal_reading(obj, shallow, rel_serialize=lambda x: marshal(x, True))
    if isinstance(obj, ReferralOrm):
        return __marshal_referral(obj)
    # if isinstance(obj, AssessmentOrm):
    #     return __marshal_assessment(obj)
    # if isinstance(obj, PregnancyOrm):
    #     return __marshal_pregnancy(obj)
    # if isinstance(obj, MedicalRecordOrm):
    #     return __marshal_medical_record(obj)
    # if isinstance(obj, FormTemplateOrm):
    #     return __marshal_form_template(obj, shallow, if_include_versions)
    # if isinstance(obj, FormOrm):
    #     return __marshal_form(obj, shallow)
    # if isinstance(obj, QuestionOrm):
    #     return __marshal_question(obj, if_include_versions)
    # if isinstance(obj, QuestionLangVersionOrm):
    #     return __marshal_lang_version(obj)
    # if isinstance(obj, SmsSecretKeyOrm):
    #     return __marshal_SmsSecretKey(obj)
    # if isinstance(obj, RuleGroupOrm):
    #     return __marshal_rule_group(obj)
    # if isinstance(obj, WorkflowTemplateStepBranchOrm):
    #     return __marshal_workflow_template_step_branch(obj)
    # if isinstance(obj, WorkflowTemplateStepOrm):
    #     return __marshal_workflow_template_step(obj, shallow)
    # if isinstance(obj, WorkflowTemplateOrm):
    #     return __marshal_workflow_template(obj, shallow)
    # if isinstance(obj, WorkflowClassificationOrm):
    #     return __marshal_workflow_classification(obj, if_include_versions, shallow)
    # if isinstance(obj, WorkflowInstanceStepOrm):
    #     return __marshal_workflow_instance_step(obj)
    # if isinstance(obj, WorkflowInstanceOrm):
    #     return __marshal_workflow_instance(obj, shallow)
    # if isinstance(obj, WorkflowCollectionOrm):
    #     return __marshal_workflow_collection(obj, shallow)

    d = vars(obj).copy()
    __pre_process(d)
    return d