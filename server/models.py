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

SupervisesTable = db.Table(
    "supervises",
    db.Column(
        "cho_id",
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        index=True,
    ),
    db.Column("vht_id", db.Integer, db.ForeignKey("user.id", ondelete="CASCADE")),
)


#
# ORM DATABASE MODEL CLASSES
#


class UserOrm(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    role = db.Column(db.String(50))

    # FOREIGN KEYS
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.name"),
        nullable=True,
    )

    # RELATIONSHIPS
    health_facility = db.relationship(
        "HealthFacilityOrm",
        backref=db.backref("users", lazy=True),
    )
    referrals = db.relationship("ReferralOrm", backref=db.backref("user", lazy=True))
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
    __tablename__ = "user_phone_number"
    id = db.Column(db.String(36), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)

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
    __tablename__ = "relay_server_phone_number"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    phone_number = db.Column(db.String(20), unique=True)
    description = db.Column(db.String(50), unique=False)
    last_received = db.Column(db.BigInteger, unique=False, default=get_current_time)

    @staticmethod
    def schema():
        return RelayServerPhoneNumberSchema


class ReferralOrm(db.Model):
    __tablename__ = "referral"
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
    user_id = db.Column(db.Integer, db.ForeignKey(UserOrm.id))
    patient_id = db.Column(db.String(50), db.ForeignKey("patient.id"))
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey("health_facility.name"),
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
    __tablename__ = "health_facility"
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


class PatientOrm(db.Model):
    __tablename__ = "patient"
    id = db.Column(db.String(50), primary_key=True)
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


class FollowUpOrm(db.Model):
    __tablename__ = "follow_up"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)

    follow_up_instructions = db.Column(db.Text)
    special_investigations = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medication_prescribed = db.Column(db.Text)
    date_assessed = db.Column(db.BigInteger, nullable=False)
    follow_up_needed = db.Column(db.Boolean)

    # FOREIGN KEYS
    healthcare_worker_id = db.Column(db.ForeignKey(UserOrm.id), nullable=False)
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey(PatientOrm.id),
        nullable=False,
    )

    # RELATIONSHIPS
    healthcare_worker = db.relationship(
        UserOrm, backref=db.backref("follow_ups", lazy=True)
    )
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("follow_ups", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return FollowUpSchema


class VillageOrm(db.Model):
    __tablename__ = "village"
    village_number = db.Column(db.String(50), primary_key=True)
    zone_number = db.Column(db.String(50))


class UrineTestOrm(db.Model):
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
            "urine_tests",
            lazy=True,
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    @staticmethod
    def schema():
        return UrineTestSchema


class PatientAssociationsOrm(db.Model):
    __tablename__ = "patient_association"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    health_facility_name = db.Column(
        db.ForeignKey(HealthFacilityOrm.name, ondelete="CASCADE"),
        nullable=True,
    )
    user_id = db.Column(db.ForeignKey(UserOrm.id, ondelete="CASCADE"), nullable=True)

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
    __tablename__ = "pregnancy"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
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
    __tablename__ = "medical_record"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
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
    __tablename__ = "form_classification"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(200), index=True, nullable=False)

    @staticmethod
    def schema():
        return FormClassificationSchema


class FormTemplateOrm(db.Model):
    __tablename__ = "form_template"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    version = db.Column(db.Text, nullable=True)
    date_created = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
    )
    form_classification_id = db.Column(
        db.ForeignKey(FormClassificationOrm.id, ondelete="SET NULL"),
        nullable=True,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)

    classification = db.relationship(
        FormClassificationOrm,
        backref=db.backref("templates", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormTemplateSchema


class FormOrm(db.Model):
    __tablename__ = "form"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    lang = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.Text, nullable=False, default="")
    patient_id = db.Column(
        db.ForeignKey(PatientOrm.id, ondelete="CASCADE"),
        nullable=False,
    )
    form_template_id = db.Column(
        db.ForeignKey(FormTemplateOrm.id, ondelete="SET NULL"),
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
    last_edited_by = db.Column(
        db.ForeignKey(UserOrm.id, ondelete="SET NULL"), nullable=True
    )

    form_classification_id = db.Column(
        db.ForeignKey(FormClassificationOrm.id, ondelete="SET NULL"),
        nullable=True,
    )
    archived = db.Column(db.Boolean, nullable=False, default=False)

    # RELATIONSHIPS
    patient = db.relationship(
        PatientOrm,
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )

    classification = db.relationship(
        FormClassificationOrm,
        backref=db.backref("forms", cascade="all, delete", lazy=True),
    )

    @staticmethod
    def schema():
        return FormSchema


class QuestionOrm(db.Model):
    __tablename__ = "question"
    """
    Question: a child model related to a form template or a form

    isBlank: true means the question is related to form template, vice versa
    questionIndex: a custom-defined question number index e.g. 1,2,3...
    visible_condition: any json format string indicating a visible condition,
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


class FollowUpSchema(ma.SQLAlchemyAutoSchema):
    healthcare_worker = fields.Nested(UserSchema)

    class Meta:
        include_fk = True
        model = FollowUpOrm
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


def validate_user(data):
    try:
        validate(data, user_schema)
    except ValidationError as e:
        return {"ok": False, "message": e}
    except SchemaError as e:
        return {"ok": False, "message": e}
    return {"ok": True, "data": data}
