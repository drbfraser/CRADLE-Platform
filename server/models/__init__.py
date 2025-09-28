from .base import SupervisesTable, db
from .communications import RelayServerPhoneNumberOrm
from .facilities import HealthFacilityOrm, VillageOrm
from .forms import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
)
from .medical import AssessmentOrm, ReadingOrm, ReferralOrm, UrineTestOrm
from .patients import MedicalRecordOrm, PatientAssociationsOrm, PatientOrm, PregnancyOrm
from .schemas import (
    AssessmentSchema,
    FormClassificationSchema,
    FormSchema,
    FormTemplateSchema,
    HealthFacilitySchema,
    MedicalRecordSchema,
    PatientAssociationsSchema,
    PatientSchema,
    PregnancySchema,
    QuestionLangVersionSchema,
    QuestionSchema,
    ReadingSchema,
    ReferralSchema,
    RelayServerPhoneNumberSchema,
    RuleGroupSchema,
    SmsSecretKeySchema,
    UrineTestSchema,
    UserPhoneNumberSchema,
    UserSchema,
    VillageSchema,
    WorkflowClassificationSchema,
    WorkflowCollectionSchema,
    WorkflowInstanceSchema,
    WorkflowInstanceStepSchema,
    WorkflowTemplateSchema,
    WorkflowTemplateStepBranchSchema,
    WorkflowTemplateStepSchema,
)
from .users import SmsSecretKeyOrm, UserOrm, UserPhoneNumberOrm
from .workflows import (
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)

SCHEMA_REGISTRY = {
    UserOrm: UserSchema,
    UserPhoneNumberOrm: UserPhoneNumberSchema,
    SmsSecretKeyOrm: SmsSecretKeySchema,
    RelayServerPhoneNumberOrm: RelayServerPhoneNumberSchema,
    WorkflowCollectionOrm: WorkflowCollectionSchema,
    WorkflowClassificationOrm: WorkflowClassificationSchema,
    RuleGroupOrm: RuleGroupSchema,
    WorkflowTemplateOrm: WorkflowTemplateSchema,
    WorkflowTemplateStepOrm: WorkflowTemplateStepSchema,
    WorkflowTemplateStepBranchOrm: WorkflowTemplateStepBranchSchema,
    WorkflowInstanceOrm: WorkflowInstanceSchema,
    WorkflowInstanceStepOrm: WorkflowInstanceStepSchema,
    HealthFacilityOrm: HealthFacilitySchema,
    VillageOrm: VillageSchema,
    PatientOrm: PatientSchema,
    PatientAssociationsOrm: PatientAssociationsSchema,
    PregnancyOrm: PregnancySchema,
    MedicalRecordOrm: MedicalRecordSchema,
    FormClassificationOrm: FormClassificationSchema,
    FormTemplateOrm: FormTemplateSchema,
    FormOrm: FormSchema,
    QuestionOrm: QuestionSchema,
    QuestionLangVersionOrm: QuestionLangVersionSchema,
    ReferralOrm: ReferralSchema,
    ReadingOrm: ReadingSchema,
    AssessmentOrm: AssessmentSchema,
    UrineTestOrm: UrineTestSchema,
}


def get_schema_for_model(model_class):
    """Get the schema class for a given model class."""
    return SCHEMA_REGISTRY.get(model_class)


def get_schema_instance(model_class):
    """Get a schema instance for a given model class."""
    schema_class = get_schema_for_model(model_class)
    return schema_class() if schema_class else None
