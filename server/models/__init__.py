from .base import SupervisesTable as SupervisesTable
from .base import db as db
from .communications import RelayServerPhoneNumberOrm
from .facilities import HealthFacilityOrm, VillageOrm
from .forms import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
)
from .formsV2 import (
    FormAnswerOrmV2,
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)
from .medical import AssessmentOrm, ReadingOrm, ReferralOrm, UrineTestOrm
from .patients import MedicalRecordOrm, PatientAssociationsOrm, PatientOrm, PregnancyOrm
from .schemas import (
    AssessmentSchema,
    FormAnswerSchemaV2,
    FormClassificationSchema,
    FormClassificationSchemaV2,
    FormQuestionTemplateSchemaV2,
    FormSchema,
    FormSubmissionSchemaV2,
    FormTemplateSchema,
    FormTemplateSchemaV2,
    HealthFacilitySchema,
    LangVersionSchemaV2,
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
    WorkflowInstanceDataOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
    WorkflowVariableCatalogueOrm,
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
    WorkflowInstanceDataOrm: WorkflowInstanceDataSchema,
    WorkflowInstanceOrm: WorkflowInstanceSchema,
    WorkflowInstanceStepOrm: WorkflowInstanceStepSchema,
    WorkflowVariableCatalogueOrm: WorkflowVariableCatalogueSchema,
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
    LangVersionOrmV2: LangVersionSchemaV2,
    FormClassificationOrmV2: FormClassificationSchemaV2,
    FormTemplateOrmV2: FormTemplateSchemaV2,
    FormQuestionTemplateOrmV2: FormQuestionTemplateSchemaV2,
    FormSubmissionOrmV2: FormSubmissionSchemaV2,
    FormAnswerOrmV2: FormAnswerSchemaV2,
}


def get_schema_for_model(model_class):
    """Get the schema class for a given model class."""
    return SCHEMA_REGISTRY.get(model_class)


def get_schema_instance(model_class):
    """Get a schema instance for a given model class."""
    schema_class = get_schema_for_model(model_class)
    return schema_class() if schema_class else None
