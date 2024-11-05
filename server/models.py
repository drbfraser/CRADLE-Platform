import datetime

import marshmallow
from jsonschema import validate
from jsonschema.exceptions import SchemaError, ValidationError
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import fields

from config import db, ma
from enums import (
    FacilityTypeEnum,
    QuestionTypeEnum,
    SexEnum,
    TrafficLightEnum,
)
from utils import get_current_time, get_uuid

#
# HELPER CLASSES
#


supervises = db.Table(
    "supervises",
    db.Column(
        "cho_id",
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        index=True,
    ),
    db.Column("vht_id", db.Integer, db.ForeignKey("user.id", ondelete="CASCADE")),
    db.UniqueConstraint("cho_id", "vht_id", name="unique_supervise"),
)
if supervises is None:
    raise RuntimeError("ERROR: could not instantiate supervises table")

#
# MODEL CLASSES
#


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    role = db.Column(db.String(50))
    sub = db.Column(db.String(64), unique=True, nullable=False) # Unique identifier used by Cognito.

    # FOREIGN KEYS
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.name"),
        nullable=True,
    )

    # RELATIONSHIPS
    health_facility = db.relationship(
        "HealthFacility",
        backref=db.backref("users", lazy=True),
    )
    referrals = db.relationship("Referral", backref=db.backref("users", lazy=True))
    vht_list = db.relationship(
        "User",
        secondary=supervises,
        primaryjoin=id == supervises.c.choId,
        secondaryjoin=id == supervises.c.vhtId,
    )
    phone_numbers = db.relationship(
        "UserPhoneNumber",
        back_populates="user",
        lazy=True,
        cascade="all, delete-orphan",
    )

    @staticmethod
    def schema():
        return UserSchema

    def __repr__(self):
        """Return a string with enough information to uniquely identify the user."""
        return f"<User {self.username}>"


class UserPhoneNumber(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)

    # FOREIGN KEYS
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # RELATIONSHIPS
    user = db.relationship("User", back_populates="phone_numbers")

    @staticmethod
    def schema():
        return UserPhoneNumberSchema


class RelayServerPhoneNumber(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)
    description = db.Column(db.String(50), unique=False)
    last_received = db.Column(db.BigInteger, unique=False, default=get_current_time)

    @staticmethod
    def schema():
        return RelayServerPhoneNumberSchema


class Referral(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    date_referred = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    comment = db.Column(db.Text)
    action_taken = db.Column(db.Text)
    is_assessed = db.Column(db.Boolean, nullable=False, default=0)
    date_assessed = db.Column(db.BigInteger, nullable=True)
    is_cancelled = db.Column(db.Boolean, nullable=False, default=0)
    cancel_reason = db.Column(db.Text)
    date_cancelled = db.Column(db.BigInteger, nullable=True)
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
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    patient_id = db.Column(db.String(50), db.ForeignKey("patient.id"))
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.name"),
    )

    # RELATIONSHIPS
    health_facility = db.relationship(
        "HealthFacility",
        backref=db.backref("referrals", lazy=True),
    )
    patient = db.relationship(
        "Patient",
        backref=db.backref("referrals", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return ReferralSchema


class HealthFacility(db.Model):
    # TODO: should probably have a unique id as primary key here, in addition to facility name
    name = db.Column(db.String(50), primary_key=True)
    type = db.Column(db.Enum(FacilityTypeEnum))

    # Best practice would be to add column for area code + column for rest of number.
    # However, all of our facilities are in Uganda so area code does not change.
    # May want to change in the future if system if used in multiple countries
    phone_number = db.Column(db.String(50), unique=True)
    location = db.Column(db.String(50))
    about = db.Column(db.Text)
    new_referrals = db.Column(db.String(50))

    @staticmethod
    def schema():
        return HealthFacilitySchema


class Patient(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(50))
    sex = db.Column(db.Enum(SexEnum), nullable=False)
    is_pregnant = db.Column(db.Boolean)
    gestational_timestamp = db.Column(db.BigInteger)
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


class Reading(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    systolic_blood_pressure = db.Column(db.Integer)
    diastolic_blood_pressure = db.Column(db.Integer)
    heart_rate_BPM = db.Column(db.Integer)

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
        db.ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey("patient.id"),
        nullable=False,
    )
    referral_id = db.Column(
        db.String(50),
        db.ForeignKey("referral.id"),
        nullable=True,  # or nullable=False, depending on your business logic
    )

    # RELATIONSHIPS
    patient = db.relationship(
        "Patient",
        backref=db.backref("readings", cascade="all, delete-orphan", lazy=True),
    )
    referral = db.relationship(
        "Referral",
        backref=db.backref("reading", uselist=False),
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
            or self.heart_rate_BPM is None
        ):
            return TrafficLightEnum.NONE.value

        shock_index = self.heart_rate_BPM / self.systolic_blood_pressure

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


class FollowUp(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)

    follow_up_instructions = db.Column(db.Text)
    special_investigations = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medication_prescribed = db.Column(db.Text)
    date_assessed = db.Column(db.BigInteger, nullable=False)
    follow_up_needed = db.Column(db.Boolean)

    # FOREIGN KEYS
    healthcare_worker_id = db.Column(db.ForeignKey("user.id"), nullable=False)
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey("patient.id"),
        nullable=False,
    )

    # RELATIONSHIPS
    healthcare_worker = db.relationship(User, backref=db.backref("follow_ups", lazy=True))
    patient = db.relationship(
        "Patient",
        backref=db.backref("follow_ups", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return FollowUpSchema


class Village(db.Model):
    village_number = db.Column(db.String(50), primary_key=True)
    zone_number = db.Column(db.String(50))


class UrineTest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    leuc = db.Column(db.String(5))
    nit = db.Column(db.String(5))
    glu = db.Column(db.String(5))
    pro = db.Column(db.String(5))
    blood = db.Column(db.String(5))

    # FOREIGN KEYS
    reading_id = db.Column(db.ForeignKey("reading.id", ondelete="CASCADE"))

    # RELATIONSHIPS
    reading = db.relationship(
        Reading,
        backref=db.backref(
            "urine_tests",
            lazy=True,
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    @staticmethod
    def schema():
        return UrineTestSchema


class PatientAssociations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
        nullable=False,
    )
    health_facility_name = db.Column(
        db.ForeignKey("health_facility.name", ondelete="CASCADE"),
        nullable=True,
    )
    user_id = db.Column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=True)

    # RELATIONSHIPS
    patient = db.relationship(
        "Patient",
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    health_facility = db.relationship(
        "HealthFacility",
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    user = db.relationship(
        "User",
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )

    @staticmethod
    def schema():
        return PatientAssociationsSchema


class Pregnancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
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
        "Patient",
        backref=db.backref("pregnancies", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return PregnancySchema


class MedicalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
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
        "Patient",
        backref=db.backref("records", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return MedicalRecordSchema


class FormClassification(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    @staticmethod
    def schema():
        return FormClassificationSchema


class FormTemplate(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    version = db.Column(db.Text, nullable=True)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    form_classification_id = db.Column(
        db.ForeignKey(FormClassification.id, ondelete="SET NULL"),
        nullable=True,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)

    classification = db.relationship(
        "FormClassification",
        backref=db.backref("templates", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormTemplateSchema


class Form(db.Model):
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    lang = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.Text, nullable=False, default="")
    patient_id = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
        nullable=False,
    )
    form_template_id = db.Column(
        db.ForeignKey(FormTemplate.id, ondelete="SET NULL"),
        nullable=True,
    )
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
    last_edited_by = db.Column(db.ForeignKey(User.id, ondelete="SET NULL"), nullable=True)

    form_classification_id = db.Column(
        db.ForeignKey(FormClassification.id, ondelete="SET NULL"),
        nullable=True,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)

    # RELATIONSHIPS
    patient = db.relationship(
        "Patient",
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )

    classification = db.relationship(
        "FormClassification",
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormSchema


class Question(db.Model):
    """
    Question: a child model related to a form template or a form

    isBlank: true means the question is related to form template, vice versa
    questionIndex: a custom-defined question number index e.g. 1,2,3...
    visibleCondition: any json format string indicating a visible condition,
    the content logic should be handled in frontend
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
            "mcid": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]

    answers: a json format string indicating the answers filled by user
    e.g.
    {
        "number": 5/5.0,
        "text": "a",
        "mcidArray":[0,1],
        "comment": "other opt"
    }
    """

    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    is_blank = db.Column(db.Boolean, nullable=False, default=0)
    question_index = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.Text, nullable=True)
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
        db.ForeignKey(Form.id, ondelete="CASCADE"),
        nullable=True,
    )
    form_template_id = db.Column(
        db.ForeignKey(FormTemplate.id, ondelete="CASCADE"),
        nullable=True,
    )

    # RELATIONSHIPS
    form = db.relationship(
        "Form",
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )
    form_template = db.relationship(
        "FormTemplate",
        backref=db.backref("questions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionSchema


class QuestionLangVersion(db.Model):
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
        db.ForeignKey(Question.id, ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    question = db.relationship(
        "Question",
        backref=db.backref("lang_versions", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return QuestionLangVersionSchema


class SmsSecretKey(db.Model):
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    secret_Key = db.Column(db.String(256), default="", nullable=False)
    stale_date = db.Column(db.DateTime, default=datetime.datetime.now(), nullable=False)
    expiry_date = db.Column(
        db.DateTime,
        default=datetime.datetime.now(),
        nullable=False,
    )

    # FOREIGNKEY
    user_id = db.Column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    @staticmethod
    def schema():
        return SmsSecretKeySchema


#
# SCHEMAS
#


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = User
        load_instance = True
        include_relationships = True


class UserPhoneNumberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = UserPhoneNumber
        load_instance = True
        include_relationships = True


class RelayServerPhoneNumberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = RelayServerPhoneNumber
        load_instance = True
        include_relationships = True


class PatientSchema(ma.SQLAlchemyAutoSchema):
    patientSex = EnumField(SexEnum, by_value=True)

    class Meta:
        include_fk = True
        model = Patient
        load_instance = True
        include_relationships = True


class ReadingSchema(ma.SQLAlchemyAutoSchema):
    trafficLightStatus = EnumField(TrafficLightEnum, by_value=True)

    class Meta:
        include_fk = True
        model = Reading
        load_instance = True
        include_relationships = True


class HealthFacilitySchema(ma.SQLAlchemyAutoSchema):
    facilityType = EnumField(FacilityTypeEnum, by_value=True)

    class Meta:
        include_fk = True
        model = HealthFacility
        load_instance = True
        include_relationships = True


class FollowUpSchema(ma.SQLAlchemyAutoSchema):
    healthcareWorker = fields.Nested(UserSchema)

    class Meta:
        include_fk = True
        model = FollowUp
        load_instance = True
        include_relationships = True


class ReferralSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = Referral
        load_instance = True
        include_relationships = True


class UrineTestSchema(ma.SQLAlchemyAutoSchema):
    # urineTests = fields.Nested(ReadingSchema)
    class Meta:
        include_fk = True
        model = UrineTest
        load_instance = True
        include_relationships = True


class PatientAssociationsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = PatientAssociations
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
        model = Village
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
        model = Pregnancy
        load_instance = True
        include_relationships = True


class MedicalRecordSchema(ma.SQLAlchemyAutoSchema):
    date_created = marshmallow.fields.Integer(validate=validate_timestamp)

    class Meta:
        include_fk = True
        model = MedicalRecord
        load_instance = True
        include_relationships = True


class FormClassificationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormClassification
        load_instance = True
        include_relationships = True


class FormTemplateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = FormTemplate
        load_instance = True
        include_relationships = True


class FormSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = Form
        load_instance = True
        include_relationships = True


class QuestionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = Question
        load_instance = True
        include_relationships = True


class QuestionLangVersionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = QuestionLangVersion
        load_instance = True
        include_relationships = True


class SmsSecretKeySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = SmsSecretKey
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
