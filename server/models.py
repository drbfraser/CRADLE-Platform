import datetime

import marshmallow
from jsonschema import validate
from jsonschema.exceptions import SchemaError, ValidationError
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import fields

from common.commonUtil import get_current_time, get_uuid
from config import db, ma
from enums import (
    FacilityTypeEnum,
    QuestionTypeEnum,
    SexEnum,
    TrafficLightEnum,
)

SupervisesTable = db.Table(
    "supervises",
    db.Column(
        "cho_id",
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        index=True,
    ),
    db.Column(
        "vht_id", 
        db.Integer, 
        db.ForeignKey("user.id", ondelete="CASCADE")
    ),
)

#
# ORM DATABASE MODEL CLASSES
#

class UserOrm(db.Model):
    """
    Represents a user in the system (Admin, CHO, VHT, HCW).
    
    Stores basic user info and connects to their healthcare facility, patients, etc.
    Each user has a unique username/email and can work at one health facility.
    """
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    role = db.Column(db.String(50))

    # FOREIGN KEYS
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.id"),
        nullable=True,
    )

    # RELATIONSHIPS
    health_facility = db.relationship(
        "HealthFacilityOrm",
        backref=db.backref("users", lazy=True),
    )
    referrals = db.relationship(
        "ReferralOrm", 
        backref=db.backref("user", lazy=True)
    )
    vht_list = db.relationship(
        "UserOrm",
        secondary=SupervisesTable,
        primaryjoin=id == SupervisesTable.c.cho_id,
        secondaryjoin=id == SupervisesTable.c.vht_id,
    )
    phone_numbers = db.relationship(
        "UserPhoneNumberOrm",
        back_populates="user",
        lazy=True,
        cascade="all, delete-orphan",
    )
    sms_secret_keys = db.relationship(
        "SmsSecretKeyOrm",
        back_populates="user",
        lazy=True,
        cascade="all, delete-orphan",
    )

    @staticmethod
    def schema():
        return UserSchema

    def __repr__(self):
        """Return a string with enough information to uniquely identify the user."""
        return f"<UserOrm {self.username}>"

class UserPhoneNumberOrm(db.Model):
    """
    Stores phone numbers for users in the system.
    
    Each user can have multiple phone numbers. Phone numbers must be unique across all users.
    """
    __tablename__ = "user_phone_number"
    id = db.Column(db.String(36), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)
    expected_request_number = db.Column(db.Integer, default=0, nullable=False)

    # FOREIGN KEYS
    user_id = db.Column(db.Integer, db.ForeignKey(UserOrm.id), nullable=False)

    # RELATIONSHIPS
    user = db.relationship(UserOrm, back_populates="phone_numbers")

    @staticmethod
    def schema():
        return UserPhoneNumberSchema

    def __repr__(self):
        """Return a string with enough information to uniquely identify the user."""
        return f"<UserPhoneNumberOrm {self.phone_number}>"

class RelayServerPhoneNumberOrm(db.Model):
    """
    System phone numbers used for SMS Relay.
    
    These are the healthcare system's own phone numbers (not user phones) that send/receive messages, alerts, and responses. Tracks when each number last received a message.
    """
    __tablename__ = "relay_server_phone_number"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)
    description = db.Column(db.String(50), unique=False)
    last_received = db.Column(db.BigInteger, unique=False, default=get_current_time)

    @staticmethod
    def schema():
        return RelayServerPhoneNumberSchema

class ReferralOrm(db.Model):
    """
    Tracks patient referrals from a healthcare provider to a healthcare facility.
    
    Records: creation, assessment, cancellation, or non-attendance. 
    Links the referring user, patient, and destination facility.
    Maintains audit trail with timestamps for all status changes.
    """
    __tablename__ = "referral"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    
    # Initial referral
    date_referred = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    comment = db.Column(db.Text)
    
    # Patient gets assessed
    action_taken = db.Column(db.Text)
    is_assessed = db.Column(db.Boolean, nullable=False, default=0)
    date_assessed = db.Column(db.BigInteger, nullable=True)
    
    # Referral gets cancelled
    is_cancelled = db.Column(db.Boolean, nullable=False, default=0)
    cancel_reason = db.Column(db.Text)
    date_cancelled = db.Column(db.BigInteger, nullable=True)
    
    # Patient doesn't attend
    not_attended = db.Column(db.Boolean, nullable=False, default=0)
    not_attend_reason = db.Column(db.Text)
    date_not_attended = db.Column(db.BigInteger, nullable=True)
    
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # FOREIGN KEYS
    user_id = db.Column(db.Integer, db.ForeignKey(UserOrm.id))
    patient_id = db.Column(db.String(50), db.ForeignKey("patient.id"))
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.id"),
    )

    # RELATIONSHIPS
    health_facility = db.relationship(
        "HealthFacilityOrm",
        backref=db.backref("referrals", lazy=True),
    )
    patient = db.relationship(
        "PatientOrm",
        backref=db.backref("referrals", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return ReferralSchema

class HealthFacilityOrm(db.Model):
    """
    Represents healthcare facilities.
    
    Stores facility details, contact info, and tracks incoming referrals.
    Currently designed for Uganda (single area code) but could expand later.
    Each facility has a unique ID and can receive referrals from other providers.
    """
    __tablename__ = "health_facility"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(50), nullable=False, index=True)
    type = db.Column(db.Enum(FacilityTypeEnum))

    # Best practice would be to add column for area code + column for rest of number.
    # However, all of our facilities are in Uganda so area code does not change.
    # May want to change in the future if system is used in multiple countries
    phone_number = db.Column(db.String(50), unique=True)
    location = db.Column(db.String(50))
    about = db.Column(db.Text)
    new_referrals = db.Column(db.BigInteger, nullable=True)

    @staticmethod
    def schema():
        return HealthFacilitySchema

class PatientOrm(db.Model):
    """
    Represents patients in the Cradle system.
    
    Stores patient information including demographics, medical history, and location details. 
    Tracks pregnancy status for female patients and maintains audit trail with creation/edit timestamps. 
    Can be archived when no longer active.
    """
    __tablename__ = "patient"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(50))
    sex = db.Column(db.Enum(SexEnum), nullable=False)
    is_pregnant = db.Column(db.Boolean)
    medical_history = db.Column(db.Text)
    drug_history = db.Column(db.Text)
    allergy = db.Column(db.Text)
    zone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    is_exact_date_of_birth = db.Column(db.Boolean)
    village_number = db.Column(db.String(50))
    household_number = db.Column(db.String(50))
    date_created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    is_archived = db.Column(db.Boolean)

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @staticmethod
    def schema():
        return PatientSchema

class ReadingOrm(db.Model):
    """
    Stores vital sign measurements and health assessments for patients.
    
    Records blood pressure, heart rate, and symptoms with automatic risk assessment using a traffic light system (Green=normal, Yellow=concerning, Red=emergency). Tracks retest schedules.
    """
    __tablename__ = "reading"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    systolic_blood_pressure = db.Column(db.Integer)
    diastolic_blood_pressure = db.Column(db.Integer)
    heart_rate = db.Column(db.Integer)

    symptoms = db.Column(db.Text)
    traffic_light_status = db.Column(db.Enum(TrafficLightEnum, nullable=False))
    date_taken = db.Column(db.BigInteger)
    date_retest_needed = db.Column(db.BigInteger)
    retest_of_previous_reading_ids = db.Column(db.String(100))
    is_flagged_for_follow_up = db.Column(db.Boolean)

    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # FOREIGN KEYS
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(UserOrm.id, ondelete="SET NULL"),
        nullable=True,
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id),
        nullable=False,
    )
    referral_id = db.Column(
        db.String(50),
        db.ForeignKey(ReferralOrm.id),
        nullable=True,  # or nullable=False, depending on your business logic
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("readings", cascade="all, delete-orphan", lazy=True),
    )
    referral = db.relationship(
        "ReferralOrm",
        backref=db.backref("readings", uselist=False),
        uselist=False,
        cascade="all, delete-orphan",
        single_parent=True,
    )

    def get_traffic_light(self):
        red_systolic = 160
        red_diastolic = 110
        yellow_systolic = 140
        yellow_diastolic = 90
        shock_high = 1.7
        shock_medium = 0.9

        if (
            self.systolic_blood_pressure is None
            or self.diastolic_blood_pressure is None
            or self.heart_rate is None
        ):
            return TrafficLightEnum.NONE.value

        shock_index = self.heart_rate / self.systolic_blood_pressure

        is_bp_very_high = (self.systolic_blood_pressure >= red_systolic) or (
            self.diastolic_blood_pressure >= red_diastolic
        )
        is_bp_high = (self.systolic_blood_pressure >= yellow_systolic) or (
            self.diastolic_blood_pressure >= yellow_diastolic
        )
        is_severe_shock = shock_index >= shock_high
        is_shock = shock_index >= shock_medium

        if is_severe_shock:
            traffic_light = TrafficLightEnum.RED_DOWN.value
        elif is_bp_very_high:
            traffic_light = TrafficLightEnum.RED_UP.value
        elif is_shock:
            traffic_light = TrafficLightEnum.YELLOW_DOWN.value
        elif is_bp_high:
            traffic_light = TrafficLightEnum.YELLOW_UP.value
        else:
            traffic_light = TrafficLightEnum.GREEN.value

        return traffic_light

    @staticmethod
    def schema():
        return ReadingSchema

class AssessmentOrm(db.Model):
    """
    Records medical assessments performed by healthcare workers on patients.
    
    Documents the complete clinical evaluation including diagnosis, treatment plan, prescribed medications, and follow-up requirements. 
    Links the assessing healthcare worker to the patient and maintains the assessment date.
    """
    __tablename__ = "assessment"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)

    follow_up_instructions = db.Column(db.Text)
    follow_up_needed = db.Column(db.Boolean)
    special_investigations = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medication_prescribed = db.Column(db.Text)
    date_assessed = db.Column(db.BigInteger, nullable=False)

    # FOREIGN KEYS
    healthcare_worker_id = db.Column(
        db.Integer,
        db.ForeignKey(UserOrm.id),
        nullable=False
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id),
        nullable=False,
    )

    # RELATIONSHIPS
    healthcare_worker = db.relationship(
        UserOrm, backref=db.backref("assessments", lazy=True)
    )
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("assessments", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return AssessmentSchema

class VillageOrm(db.Model):
    """
    Records details about the village, including village number and zone number.
    """
    __tablename__ = "village"
    village_number = db.Column(db.String(50), primary_key=True)
    zone_number = db.Column(db.String(50))

class UrineTestOrm(db.Model):
    """
    Stores urine test results associated with patient vital sign readings.
    
    Records dipstick test results for common indicators like glucose, protein, and blood. 
    Each reading can have at most one urine test. Tests are optional.
    """
    __tablename__ = "urine_test"
    id = db.Column(db.Integer, primary_key=True)
    leukocytes = db.Column(db.String(5))
    nitrites = db.Column(db.String(5))
    glucose = db.Column(db.String(5))
    protein = db.Column(db.String(5))
    blood = db.Column(db.String(5))

    # FOREIGN KEYS
    reading_id = db.Column(db.ForeignKey(ReadingOrm.id, ondelete="CASCADE"))

    # RELATIONSHIPS
    reading = db.relationship(
        ReadingOrm,
        backref=db.backref(
            "urine_test",
            lazy=True,
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    @staticmethod
    def schema():
        return UrineTestSchema

class PatientAssociationsOrm(db.Model):
    """
    Links patients to their assigned healthcare workers and facilities.
    
    Creates associations between patients, users, and facilities for access control. 
    Patients can be associated with multiple providers across different facilities as needed for their care.
    """
    __tablename__ = "patient_association"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey(HealthFacilityOrm.name, ondelete="CASCADE"),
        nullable=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(UserOrm.id, ondelete="CASCADE"), 
        nullable=True
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    health_facility = db.relationship(
        HealthFacilityOrm,
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    user = db.relationship(
        UserOrm,
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )

    @staticmethod
    def schema():
        return PatientAssociationsSchema

class PregnancyOrm(db.Model):
    """
    Tracks pregnancy records for female patients in the Cradle system.
    
    Records pregnancy start dates, completion dates, and outcomes. 
    Supports ongoing pregnancies (no end date) and completed pregnancies with documented outcomes. 
    """
    __tablename__ = "pregnancy"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    start_date = db.Column(db.BigInteger, nullable=False)
    end_date = db.Column(db.BigInteger, nullable=True, default=None)
    outcome = db.Column(db.Text)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("pregnancies", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return PregnancySchema

class MedicalRecordOrm(db.Model):
    """
    Stores additional medical information and drug records for patients.
    
    Records medical notes, historical information, and medication records that supplement structured data. 
    Uses a flag to distinguish between general medical records and specific drug-related entries.
    """
    __tablename__ = "medical_record"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    information = db.Column(db.Text, nullable=False)
    is_drug_record = db.Column(db.Boolean, nullable=False)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("records", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return MedicalRecordSchema

class FormClassificationOrm(db.Model):
    """
    Categories for organizing different types of forms.
    
    Provides a classification system for grouping related forms together.
    Used to organize and filter forms by their clinical purpose.
    """
    __tablename__ = "form_classification"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    @staticmethod
    def schema():
        return FormClassificationSchema

class FormTemplateOrm(db.Model):
    """
    Templates that define the structure and questions for  forms.
    
    Reusable form blueprints that can be versioned and archived over time.
    When healthcare workers need to fill out a form, they create instances based on these templates. 
    Supports classification grouping and lifecycle management through archiving.
    """
    __tablename__ = "form_template"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    version = db.Column(db.Text, nullable=True)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)
    
    # FOREIGN KEYS
    form_classification_id = db.Column(
        db.String(50),
        db.ForeignKey(FormClassificationOrm.id, ondelete="SET NULL"),
        nullable=True,
    )

    # RELATIONSHIPS
    classification = db.relationship(
        FormClassificationOrm,
        backref=db.backref("templates", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormTemplateSchema

class FormOrm(db.Model):
    """
    Completed form instances filled out by healthcare workers for specific patients.
    
    Created from form templates and contains actual patient data and responses.
    Supports multiple languages and tracks creation/editing history. 
    Each form belongs to a specific patient and a form template, it can be archived when no longer active.
    """
    __tablename__ = "form"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    lang = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.Text, nullable=False, default="")
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)
    
    # FOREIGN KEYS
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    form_template_id = db.Column(
        db.String(50),
        db.ForeignKey(FormTemplateOrm.id, ondelete="SET NULL"),
        nullable=True,
    )
    last_edited_by = db.Column(
        db.ForeignKey(UserOrm.id, ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )
    template = db.relationship(
        FormTemplateOrm,
        backref=db.backref("forms", lazy=True)
    )

    @staticmethod
    def schema():
        return FormSchema

class QuestionOrm(db.Model):
    """
    Individual questions that make up healthcare forms and form templates.
    
    Supports various question types (text, number, multiple choice, dates) with validation rules, conditional visibility, and multiple choice options. Questions can exist as blank templates or filled instances with actual answers. Stores both the question structure and user responses in JSON format.
    
    Question: a child model related to a form template or a form

    isBlank: true means the question is related to form template, vice versa
    questionIndex: a custom-defined question number index e.g. 1,2,3...
    visible_condition: any json format string indicating a visible condition, the content logic should be handled in frontend
    e.g.
    [{
        "qidx": 1,
        "relation": "EQUAL_TO",
        "answers": {
            "number": 1
        }
    }]

    mcOptions: a json format list string indicating a list of multiple choices
    (maximum 5 options)
    e.g.
    [
        {
            "mcId": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]

    answers: a json format string indicating the answers filled by user
    e.g.
    {
        "number": 5/5.0,
        "text": "a",
        "mcIdArray":[0,1],
        "comment": "other opt"
    }
    """
    __tablename__ = "question"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    is_blank = db.Column(db.Boolean, nullable=False, default=0)
    question_index = db.Column(db.Integer, nullable=False)
    question_text = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="",
    )
    question_type = db.Column(db.Enum(QuestionTypeEnum), nullable=False)
    has_comment_attached = db.Column(db.Boolean, nullable=False, default=0)
    required = db.Column(db.Boolean, nullable=False, default=0)
    allow_future_dates = db.Column(db.Boolean, nullable=False, default=1)
    allow_past_dates = db.Column(db.Boolean, nullable=False, default=1)
    units = db.Column(db.Text, nullable=True)
    visible_condition = db.Column(db.Text, nullable=False, default="[]")
    mc_options = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="[]",
    )
    num_min = db.Column(db.Float, nullable=True)
    num_max = db.Column(db.Float, nullable=True)
    string_max_length = db.Column(db.Integer, nullable=True)
    answers = db.Column(db.Text, nullable=False, default="{}")
    category_index = db.Column(db.Integer, nullable=True)
    string_max_lines = db.Column(db.Integer, nullable=True)

    # FOREIGN KEYS
    form_id = db.Column(
        db.ForeignKey(FormOrm.id, ondelete="CASCADE"),
        nullable=True,
    )
    form_template_id = db.Column(
        db.ForeignKey(FormTemplateOrm.id, ondelete="CASCADE"),
        nullable=True,
    )

    # RELATIONSHIPS
    form = db.relationship(
        FormOrm,
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )
    form_template = db.relationship(
        FormTemplateOrm,
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionSchema


class QuestionLangVersionOrm(db.Model):
    __tablename__ = "question_lang_version"
    """
    This model is used to store different language versions of a single question.
    """

    id = db.Column(db.Integer, primary_key=True)
    lang = db.Column(db.Text, nullable=False)
    question_text = db.Column(db.Text(collation="utf8mb4_general_ci"), nullable=False)
    mc_options = db.Column(
        db.Text(collation="utf8mb4_general_ci"),
        nullable=False,
        default="[]",
    )

    # FOREIGN KEYS
    question_id = db.Column(
        db.ForeignKey(QuestionOrm.id, ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    question = db.relationship(
        QuestionOrm,
        backref=db.backref("lang_versions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionLangVersionSchema


class SmsSecretKeyOrm(db.Model):
    __tablename__ = "sms_secret_key"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    secret_key = db.Column(db.String(256), default="", nullable=False)
    stale_date = db.Column(db.DateTime, default=datetime.datetime.now(), nullable=False)
    expiry_date = db.Column(
        db.DateTime,
        default=datetime.datetime.now(),
        nullable=False,
    )

    # FOREIGNKEY
    user_id = db.Column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    user = db.relationship(UserOrm, back_populates="sms_secret_keys")

    @staticmethod
    def schema():
        return SmsSecretKeySchema


class WorkflowCollectionOrm(db.Model):
    __tablename__ = "workflow_collection"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    date_created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    @staticmethod
    def schema():
        return WorkflowCollectionSchema


class WorkflowClassificationOrm(db.Model):
    __tablename__ = "workflow_classification"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    # FOREIGN KEYS
    collection_id = db.Column(
        db.ForeignKey(WorkflowCollectionOrm.id, ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    collection = db.relationship(
        WorkflowCollectionOrm,
        backref=db.backref("workflow_classifications", lazy=True),
        passive_deletes=True,
    )

    @staticmethod
    def schema():
        return WorkflowClassificationSchema


class RuleGroupOrm(db.Model):
    __tablename__ = "rule_group"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    # NOTE: These attributes may need to be altered or removed depending on what rules engine we choose
    rule = db.Column(db.JSON, nullable=True)
    data_sources = db.Column(db.JSON, nullable=True)

    @staticmethod
    def schema():
        return RuleGroupSchema


class WorkflowTemplateOrm(db.Model):
    __tablename__ = "workflow_template"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    date_created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    starting_step_id = db.Column(db.String(50), nullable=True)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    version = db.Column(db.Text, nullable=False)

    # FOREIGN KEYS
    classification_id = db.Column(
        db.ForeignKey(WorkflowClassificationOrm.id, ondelete="SET NULL"),
        nullable=True,
    )

    initial_condition_id = db.Column(
        db.ForeignKey(RuleGroupOrm.id, ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    initial_condition = db.relationship(
        RuleGroupOrm,
        backref=db.backref("workflow_templates", lazy=True),
        passive_deletes=True,
    )

    classification = db.relationship(
        WorkflowClassificationOrm,
        backref=db.backref("workflow_templates", lazy=True),
        passive_deletes=True,
    )

    @staticmethod
    def schema():
        return WorkflowTemplateSchema


class WorkflowTemplateStepOrm(db.Model):
    __tablename__ = "workflow_template_step"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    expected_completion = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # FOREIGN KEYS
    condition_id = db.Column(
        db.ForeignKey(RuleGroupOrm.id, ondelete="SET NULL"), nullable=True
    )

    form_id = db.Column(
        db.ForeignKey(FormTemplateOrm.id, ondelete="SET NULL"),
        nullable=True,
    )

    workflow_template_id = db.Column(
        db.ForeignKey(WorkflowTemplateOrm.id, ondelete="CASCADE"), nullable=False
    )

    # RELATIONSHIPS
    workflow_template = db.relationship(
        WorkflowTemplateOrm,
        backref=db.backref("steps", cascade="all, delete", lazy=True),
    )

    condition = db.relationship(
        RuleGroupOrm,
        backref=db.backref("workflow_template_steps", lazy=True),
        passive_deletes=True,
    )

    form = db.relationship(
        FormTemplateOrm,
        backref=db.backref("workflow_template_steps", lazy=True),
        passive_deletes=True,
    )

    @staticmethod
    def schema():
        return WorkflowTemplateStepSchema


class WorkflowTemplateStepBranchOrm(db.Model):
    __tablename__ = "workflow_template_step_branch"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    target_step_id = db.Column(db.String(50), nullable=True)

    # FOREIGN KEYS
    step_id = db.Column(
        db.ForeignKey(WorkflowTemplateStepOrm.id, ondelete="CASCADE"),
        nullable=False,
    )

    condition_id = db.Column(
        db.ForeignKey(RuleGroupOrm.id, ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    step = db.relationship(
        WorkflowTemplateStepOrm,
        backref=db.backref("branches", cascade="all, delete", lazy=True),
    )

    condition = db.relationship(
        RuleGroupOrm,
        backref=db.backref("workflow_template_step_branches", lazy=True),
        passive_deletes=True,
    )

    @staticmethod
    def schema():
        return WorkflowTemplateStepBranchSchema


class WorkflowInstanceOrm(db.Model):
    __tablename__ = "workflow_instance"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    current_step_id = db.Column(db.String(50), nullable=True)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    completion_date = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    status = db.Column(db.String(20), nullable=False, default="Active")

    # FOREIGN KEYS
    workflow_template_id = db.Column(
        db.ForeignKey(WorkflowTemplateOrm.id, ondelete="SET NULL"), nullable=True
    )

    patient_id = db.Column(
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"), nullable=False
    )

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("workflow_instances", cascade="all, delete", lazy=True),
    )

    workflow_template = db.relationship(
        WorkflowTemplateOrm,
        backref=db.backref("workflow_instances", lazy=True),
    )

    @staticmethod
    def schema():
        return WorkflowInstanceSchema


class WorkflowInstanceStepOrm(db.Model):
    __tablename__ = "workflow_instance_step"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    triggered_by = db.Column(
        db.String(50), nullable=True
    )  # The prior step in the workflow that activated the current step
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    expected_completion = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    completion_date = db.Column(
        db.BigInteger, nullable=True, default=None, onupdate=get_current_time
    )
    status = db.Column(db.String(20), nullable=False, default="Active")
    data = db.Column(db.Text, nullable=True)

    # FOREIGN KEYS
    form_id = db.Column(db.ForeignKey(FormOrm.id, ondelete="SET NULL"), nullable=True)

    assigned_to = db.Column(
        db.ForeignKey(UserOrm.id, ondelete="SET NULL"), nullable=True
    )

    workflow_instance_id = db.Column(
        db.ForeignKey(WorkflowInstanceOrm.id, ondelete="CASCADE"), nullable=False
    )

    condition_id = db.Column(
        db.ForeignKey(RuleGroupOrm.id, ondelete="SET NULL"), nullable=True
    )

    # RELATIONSHIPS
    workflow_instance = db.relationship(
        WorkflowInstanceOrm,
        backref=db.backref("steps", cascade="all, delete", lazy=True),
    )

    condition = db.relationship(
        RuleGroupOrm,
        backref=db.backref("workflow_instance_steps", lazy=True),
        passive_deletes=True,
    )

    form = db.relationship(
        FormOrm,
        backref=db.backref("workflow_instance_steps", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return WorkflowInstanceStepSchema


#
# SCHEMAS
#


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


class RelayServerPhoneNumberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = RelayServerPhoneNumberOrm
        load_instance = True
        include_relationships = True


class PatientSchema(ma.SQLAlchemyAutoSchema):
    patientSex = EnumField(SexEnum, by_value=True)

    class Meta:
        include_fk = True
        model = PatientOrm
        load_instance = True
        include_relationships = True


class ReadingSchema(ma.SQLAlchemyAutoSchema):
    trafficLightStatus = EnumField(TrafficLightEnum, by_value=True)

    class Meta:
        include_fk = True
        model = ReadingOrm
        load_instance = True
        include_relationships = True


class HealthFacilitySchema(ma.SQLAlchemyAutoSchema):
    type = EnumField(FacilityTypeEnum, by_value=True)

    class Meta:
        include_fk = True
        model = HealthFacilityOrm
        load_instance = True
        include_relationships = True


class AssessmentSchema(ma.SQLAlchemyAutoSchema):
    healthcare_worker = fields.Nested(UserSchema)

    class Meta:
        include_fk = True
        model = AssessmentOrm
        load_instance = True
        include_relationships = True


class ReferralSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = ReferralOrm
        load_instance = True
        include_relationships = True


class UrineTestSchema(ma.SQLAlchemyAutoSchema):
    # urineTests = fields.Nested(ReadingSchema)
    class Meta:
        include_fk = True
        model = UrineTestOrm
        load_instance = True
        include_relationships = True


class PatientAssociationsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = PatientAssociationsOrm
        load_instance = True
        include_relationships = True


user_schema = {
    "type": "object",
    "properties": {
        "username": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "name": {"type": "string"},
        "role": {"type": "string"},
        "health_facility_name": {"type": "string"},
    },
    "required": ["email", "username", "name"],
    "additionalProperties": False,
}


class VillageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = VillageOrm
        load_instance = True
        include_relationships = True


def validate_timestamp(ts):
    if ts > get_current_time():
        raise marshmallow.ValidationError("Date must not be in the future.")


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


def validate_user(data):
    try:
        validate(data, user_schema)
    except ValidationError as e:
        return {"ok": False, "message": e}
    except SchemaError as e:
        return {"ok": False, "message": e}
    return {"ok": True, "data": data}
