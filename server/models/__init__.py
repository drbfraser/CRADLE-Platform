from .base import *
from .users import *
from .facilities import *
from .patients import *
from .medical import *
from .forms import *
from .workflows import *
from .communications import *
from .schemas import *

SCHEMA_REGISTRY = {
    UserOrm: UserSchema,
    UserPhoneNumberOrm: UserPhoneNumberSchema,
    SmsSecretKeyOrm: SmsSecretKeySchema,
    RelayServerPhoneNumberOrm: RelayServerPhoneNumberSchema,
    WorkflowCollectionOrm: WorkflowCollectionSchema,
    WorkflowClassificationOrm: WorkflowCollectionSchema,
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
    UrineTestOrm: UrineTestSchema
}

def get_schema_for_model(model_class):
    """Get the schema class for a given model class."""
    return SCHEMA_REGISTRY.get(model_class)

def get_schema_instance(model_class):
    """Get a schema instance for a given model class."""
    schema_class = get_schema_for_model(model_class)
    return schema_class() if schema_class else None