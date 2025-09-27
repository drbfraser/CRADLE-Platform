from .base import ma
from .users import *
from .medical import *
from .patients import *
from .facilities import *
from .forms import *
from .workflows import *
from .communications import *

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = UserOrm
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
        
class AssessmentSchema(ma.SQLAlchemyAutoSchema):
    # late import to avoid circular dependency
    def __init__(self, *args, **kwargs):
        from .users import UserSchema
        super().__init__(*args, **kwargs)
        self.fields['healthcare_worker'] = fields.Nested(UserSchema)
    
    class Meta:
        include_fk = True
        model = AssessmentOrm
        load_instance = True
        include_relationships = True

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

class MedicalRecordSchema(ma.SQLAlchemyAutoSchema):
    date_created = marshmallow.fields.Integer(validate=validate_timestamp)

    class Meta:
        include_fk = True
        model = MedicalRecordOrm
        load_instance = True
        include_relationships = True
        
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = UserOrm
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
