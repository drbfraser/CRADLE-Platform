import enum

from jsonschema import validate
from jsonschema.exceptions import SchemaError
from jsonschema.exceptions import ValidationError
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import fields

from config import db, ma
from utils import get_current_time


# To add a table to db, make a new class
# create a migration: flask db migrate
# apply the migration: flask db upgrade

#
# ENUMS CLASSES
#


class RoleEnum(enum.Enum):
    VHT = "VHT"
    HCW = "HCW"
    ADMIN = "ADMIN"
    CHO = "CHO"


class SexEnum(enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class GestationalAgeUnitEnum(enum.Enum):
    MONTHS = "MONTHS"
    WEEKS = "WEEKS"


class TrafficLightEnum(enum.Enum):
    NONE = "NONE"
    GREEN = "GREEN"
    YELLOW_UP = "YELLOW_UP"
    YELLOW_DOWN = "YELLOW_DOWN"
    RED_UP = "RED_UP"
    RED_DOWN = "RED_DOWN"


class FacilityTypeEnum(enum.Enum):
    HCF_2 = "HCF_2"
    HCF_3 = "HCF_3"
    HCF_4 = "HCF_4"
    HOSPITAL = "HOSPITAL"


#
# HELPER CLASSES
#


supervises = db.Table(
    "supervises",
    db.Column(
        "choId", db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), index=True
    ),
    db.Column("vhtId", db.Integer, db.ForeignKey("user.id", ondelete="CASCADE")),
    db.UniqueConstraint("choId", "vhtId", name="unique_supervise"),
)


#
# MODEL CLASSES
#


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(25))
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password = db.Column(db.String(128))
    role = db.Column(db.String(50))

    # FOREIGN KEYS
    healthFacilityName = db.Column(
        db.String(50), db.ForeignKey("healthfacility.healthFacilityName"), nullable=True
    )

    # RELATIONSHIPS
    healthFacility = db.relationship(
        "HealthFacility", backref=db.backref("users", lazy=True)
    )

    referrals = db.relationship("Referral", backref=db.backref("users", lazy=True))
    vhtList = db.relationship(
        "User",
        secondary=supervises,
        primaryjoin=id == supervises.c.choId,
        secondaryjoin=id == supervises.c.vhtId,
    )

    @staticmethod
    def schema():
        return UserSchema

    def __repr__(self):
        return "<User {}>".format(self.username)


class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dateReferred = db.Column(db.BigInteger, nullable=False)
    comment = db.Column(db.Text)
    actionTaken = db.Column(db.Text)
    isAssessed = db.Column(db.Boolean, nullable=False, default=0)

    # FOREIGN KEYS
    userId = db.Column(db.Integer, db.ForeignKey("user.id"))
    patientId = db.Column(db.String(50), db.ForeignKey("patient.patientId"))
    readingId = db.Column(db.String(50), db.ForeignKey("reading.readingId"))
    referralHealthFacilityName = db.Column(
        db.String(50), db.ForeignKey("healthfacility.healthFacilityName")
    )

    # RELATIONSHIPS
    healthFacility = db.relationship(
        "HealthFacility", backref=db.backref("referrals", lazy=True)
    )
    reading = db.relationship(
        "Reading", backref=db.backref("referral", lazy=True, uselist=False)
    )
    patient = db.relationship("Patient", backref=db.backref("referrals", lazy=True))

    @staticmethod
    def schema():
        return ReferralSchema


class HealthFacility(db.Model):
    __tablename__ = "healthfacility"
    # TODO: should probably have a unique id as primary key here, in addition to facility name
    healthFacilityName = db.Column(db.String(50), primary_key=True)
    facilityType = db.Column(db.Enum(FacilityTypeEnum))

    # Best practice would be to add column for area code + column for rest of number.
    # However, all of our facilities are in Uganda so area code does not change.
    # May want to change in the future if system if used in multiple countries
    healthFacilityPhoneNumber = db.Column(db.String(50))
    location = db.Column(db.String(50))
    about = db.Column(db.Text)

    @staticmethod
    def schema():
        return HealthFacilitySchema


class Patient(db.Model):
    patientId = db.Column(db.String(50), primary_key=True)
    patientName = db.Column(db.String(50))
    patientSex = db.Column(db.Enum(SexEnum), nullable=False)
    isPregnant = db.Column(db.Boolean)
    gestationalAgeUnit = db.Column(db.Enum(GestationalAgeUnitEnum), nullable=True)
    gestationalTimestamp = db.Column(db.BigInteger)
    medicalHistory = db.Column(db.Text)
    drugHistory = db.Column(db.Text)
    zone = db.Column(db.String(20))
    dob = db.Column(db.Date)
    isExactDob = db.Column(db.Boolean)
    villageNumber = db.Column(db.String(50))
    householdNumber = db.Column(db.String(50))
    created = db.Column(db.BigInteger, nullable=False, default=get_current_time)
    lastEdited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @staticmethod
    def schema():
        return PatientSchema


class Reading(db.Model):
    readingId = db.Column(db.String(50), primary_key=True)
    bpSystolic = db.Column(db.Integer)
    bpDiastolic = db.Column(db.Integer)
    heartRateBPM = db.Column(db.Integer)

    symptoms = db.Column(db.Text)
    trafficLightStatus = db.Column(db.Enum(TrafficLightEnum, nullable=False))
    dateTimeTaken = db.Column(db.BigInteger)
    dateRecheckVitalsNeeded = db.Column(db.BigInteger)
    retestOfPreviousReadingIds = db.Column(db.String(100))
    isFlaggedForFollowup = db.Column(db.Boolean)

    lastEdited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # FOREIGN KEYS
    userId = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    patientId = db.Column(
        db.String(50), db.ForeignKey("patient.patientId"), nullable=False
    )

    # RELATIONSHIPS
    patient = db.relationship("Patient", backref=db.backref("readings", lazy=True))

    def get_traffic_light(self):
        red_systolic = 160
        red_diastolic = 110
        yellow_systolic = 140
        yellow_diastolic = 90
        shock_high = 1.7
        shock_medium = 0.9

        if (
            self.bpSystolic is None
            or self.bpDiastolic is None
            or self.heartRateBPM is None
        ):
            return TrafficLightEnum.NONE.value

        shock_index = self.heartRateBPM / self.bpSystolic

        is_bp_very_high = (self.bpSystolic >= red_systolic) or (
            self.bpDiastolic >= red_diastolic
        )
        is_bp_high = (self.bpSystolic >= yellow_systolic) or (
            self.bpDiastolic >= yellow_diastolic
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
    __tablename__ = "followup"
    id = db.Column(db.Integer, primary_key=True)
    followupInstructions = db.Column(db.Text)
    specialInvestigations = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medicationPrescribed = db.Column(db.Text)
    dateAssessed = db.Column(db.BigInteger, nullable=False)
    followupNeeded = db.Column(db.Boolean)

    # FOREIGN KEYS
    readingId = db.Column(db.ForeignKey(Reading.readingId), nullable=False)
    healthcareWorkerId = db.Column(db.ForeignKey(User.id), nullable=False)

    # RELATIONSHIPS
    reading = db.relationship(
        Reading,
        backref=db.backref(
            "followup", lazy=True, uselist=False, cascade="all, delete-orphan"
        ),
    )
    healthcareWorker = db.relationship(User, backref=db.backref("followups", lazy=True))

    @staticmethod
    def schema():
        return FollowUpSchema


class Village(db.Model):
    villageNumber = db.Column(db.String(50), primary_key=True)
    zoneNumber = db.Column(db.String(50))


class UrineTest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    urineTestLeuc = db.Column(db.String(5))
    urineTestNit = db.Column(db.String(5))
    urineTestGlu = db.Column(db.String(5))
    urineTestPro = db.Column(db.String(5))
    urineTestBlood = db.Column(db.String(5))

    # FOREIGN KEYS
    readingId = db.Column(db.ForeignKey("reading.readingId", ondelete="CASCADE"))

    # RELATIONSHIPS
    reading = db.relationship(
        Reading,
        backref=db.backref(
            "urineTests", lazy=True, uselist=False, cascade="all, delete-orphan"
        ),
    )

    @staticmethod
    def schema():
        return UrineTestSchema


class PatientAssociations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patientId = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
        nullable=False,
    )
    healthFacilityName = db.Column(
        db.ForeignKey(HealthFacility.healthFacilityName, ondelete="CASCADE"),
        nullable=True,
    )
    userId = db.Column(db.ForeignKey(User.id, ondelete="CASCADE"), nullable=True)

    # RELATIONSHIPS
    patient = db.relationship(
        "Patient",
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    healthFacility = db.relationship(
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
    patientId = db.Column(
        db.ForeignKey(Patient.patientId, ondelete="CASCADE"),
        nullable=False,
    )
    startDate = db.Column(db.BigInteger, nullable=False)
    defaultTimeUnit = db.Column(db.Enum(GestationalAgeUnitEnum))
    endDate = db.Column(db.BigInteger, nullable=True, default=None)
    outcome = db.Column(db.Text)
    lastEdited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )

    # RELATIONSHIPS
    patient = db.relationship("Patient", backref=db.backref("pregnancy", lazy=True))

    @staticmethod
    def schema():
        return PregnancySchema


#
# SCHEMAS
#


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = User
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
    followUp = fields.Nested(FollowUpSchema)

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


class PregnancySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = Pregnancy
        load_instance = True
        include_relationships = True


user_schema = {
    "type": "object",
    "properties": {
        "username": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "firstName": {"type": "string"},
        "role": {"type": "string"},
        "healthFacilityName": {"type": "string"},
        "password": {"type": "string", "minLength": 5},
    },
    "required": ["email", "password"],
    "additionalProperties": False,
}


class VillageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_fk = True
        model = Village
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
