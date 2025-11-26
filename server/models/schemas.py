import marshmallow
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import fields

from config import ma
from enums import FacilityTypeEnum, SexEnum, TrafficLightEnum

from .base import validate_timestamp
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


class RelayServerPhoneNumberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = RelayServerPhoneNumberOrm
        load_instance = True
        include_relationships = True


class HealthFacilitySchema(ma.SQLAlchemyAutoSchema):
    type = EnumField(FacilityTypeEnum, by_value=True)

    class Meta:
        include_fk = True
        model = HealthFacilityOrm
        load_instance = True
        include_relationships = True


class VillageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = VillageOrm
        load_instance = True
        include_relationships = True


class FormClassificationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormClassificationOrm
        load_instance = True
        include_relationships = True


class FormTemplateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormTemplateOrm
        load_instance = True
        include_relationships = True


class FormSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormOrm
        load_instance = True
        include_relationships = True


class QuestionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = QuestionOrm
        load_instance = True
        include_relationships = True


class QuestionLangVersionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = QuestionLangVersionOrm
        load_instance = True
        include_relationships = True


class FormClassificationSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormClassificationOrmV2
        load_instance = True
        include_relationships = True


class FormTemplateSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormTemplateOrmV2
        load_instance = True
        include_relationships = True


class FormQuestionTemplateSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormQuestionTemplateOrmV2
        load_instance = True
        include_relationships = True


class FormSubmissionSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormSubmissionOrmV2
        load_instance = True
        include_relationships = True


class FormAnswerSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormAnswerOrmV2
        load_instance = True
        include_relationships = True


class LangVersionSchemaV2(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = LangVersionOrmV2
        load_instance = True
        include_relationships = True


class ReferralSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = ReferralOrm
        load_instance = True
        include_relationships = True


class ReadingSchema(ma.SQLAlchemyAutoSchema):
    trafficLightStatus = EnumField(TrafficLightEnum, by_value=True)

    class Meta:
        include_fk = True
        model = ReadingOrm
        load_instance = True
        include_relationships = True
        exclude = ["patient"]


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = UserOrm
        load_instance = True
        include_relationships = True


class AssessmentSchema(ma.SQLAlchemyAutoSchema):
    healthcare_worker = fields.Nested(UserSchema)

    class Meta:
        include_fk = True
        model = AssessmentOrm
        load_instance = True
        include_relationships = True
        exclude = ["patient"]


class UrineTestSchema(ma.SQLAlchemyAutoSchema):
    # urineTests = fields.Nested(ReadingSchema)
    class Meta:
        include_fk = True
        model = UrineTestOrm
        load_instance = True
        include_relationships = True


class PatientSchema(ma.SQLAlchemyAutoSchema):
    patientSex = EnumField(SexEnum, by_value=True)

    class Meta:
        include_fk = True
        model = PatientOrm
        load_instance = True
        include_relationships = True


class PatientAssociationsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = PatientAssociationsOrm
        load_instance = True
        include_relationships = True


class PregnancySchema(ma.SQLAlchemyAutoSchema):
    start_date = marshmallow.fields.Integer(validate=validate_timestamp)
    end_date = marshmallow.fields.Integer(validate=validate_timestamp)

    class Meta:
        include_fk = True
        model = PregnancyOrm
        load_instance = True
        include_relationships = True
        exclude = ["patient"]


class MedicalRecordSchema(ma.SQLAlchemyAutoSchema):
    date_created = marshmallow.fields.Integer(validate=validate_timestamp)

    class Meta:
        include_fk = True
        model = MedicalRecordOrm
        load_instance = True
        include_relationships = True


class UserPhoneNumberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = UserPhoneNumberOrm
        load_instance = True
        include_relationships = True


class SmsSecretKeySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = SmsSecretKeyOrm
        load_instance = True
        include_relationships = True


class RuleGroupSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = RuleGroupOrm
        load_instance = True
        include_relationships = True


class WorkflowCollectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowCollectionOrm
        load_instance = True
        include_relationships = True


class WorkflowClassificationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowClassificationOrm
        load_instance = True
        include_relationships = True


class WorkflowTemplateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowTemplateOrm
        load_instance = True
        include_relationships = True


class WorkflowTemplateStepSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowTemplateStepOrm
        load_instance = True
        include_relationships = True


class WorkflowTemplateStepBranchSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowTemplateStepBranchOrm
        load_instance = True
        include_relationships = True


class WorkflowInstanceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowInstanceOrm
        load_instance = True
        include_relationships = True


class WorkflowInstanceStepSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = WorkflowInstanceStepOrm
        load_instance = True
        include_relationships = True
