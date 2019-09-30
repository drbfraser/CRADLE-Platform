from config import db, ma
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from jsonschema.exceptions import SchemaError
from marshmallow_enum import EnumField
import enum

# To add a table to db, make a new class
# create a migration: flask db migrate
# apply the migration: flask db upgrade

#####################
### ENUMS CLASSES ###
#####################
class RoleEnum(enum.Enum):
    VHT = 'VHT'
    HCW = 'HCW'
    ADMIN = 'ADMIN'

class SexEnum(enum.Enum):
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'I'

class TrafficLightEnum(enum.Enum):
    NONE = 'NONE'
    GREEN = 'GREEN'
    YELLOW_UP = 'YELLOW_UP'
    YELLOW_DOWN = 'YELLOW_DOWN'
    RED_UP = 'RED_UP'
    RED_DOWN = 'RED_DOWN'


######################
### HELPER CLASSES ###
######################
userRole = db.Table('userrole',
    db.Column('id', db.Integer, primary_key=True),
    
    # FOREIGN KEYS
    db.Column('userId', db.Integer, db.ForeignKey('user.id')),
    db.Column('roleId', db.Integer, db.ForeignKey('role.id'))
)


#####################
### MODEL CLASSES ###
#####################
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password = db.Column(db.String(128))

    # FOREIGN KEYS
    healthFacilityName = db.Column(db.String(50), db.ForeignKey('healthfacility.healthFacilityName'), nullable=True)

    # RELATIONSHIPS
    healthFacility = db.relationship('HealthFacility', backref=db.backref('users', lazy=True))
    roleIds = db.relationship('Role', secondary=userRole, backref=db.backref('users', lazy=True))
    referrals = db.relationship('Referral', backref=db.backref('users', lazy=True))

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Enum(RoleEnum), nullable=False)

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dateReferred = db.Column(db.String(100), nullable=False) 
    comment = db.Column(db.Text)
    actionTaken = db.Column(db.Text)

    # FOREIGN KEYS
    userId = db.Column(db.Integer, db.ForeignKey('user.id'))
    patientId = db.Column(db.String(50), db.ForeignKey('patient.patientId'))

    referralHealthFacilityName = db.Column(db.String(50), db.ForeignKey('healthfacility.healthFacilityName'))
    readingId = db.Column(db.String(50), db.ForeignKey('reading.readingId'))
    followUpId = db.Column(db.Integer, db.ForeignKey('followup.id'))

    # RELATIONSHIPS
    healthFacility = db.relationship('HealthFacility', backref=db.backref('referrals', lazy=True))
    reading = db.relationship('Reading', backref=db.backref('referrals', lazy=True))
    followUp = db.relationship('FollowUp', backref=db.backref('referrals', lazy=True))

class HealthFacility(db.Model):
    __tablename__ = 'healthfacility'
    healthFacilityName = db.Column(db.String(50), primary_key=True)


class Patient(db.Model):
    patientId = db.Column(db.String(50), primary_key=True)
    patientName = db.Column(db.String(50))
    patientAge = db.Column(db.Integer, nullable=False)
    patientSex = db.Column(db.Enum(SexEnum), nullable=False)
    isPregnant = db.Column(db.Boolean)
    gestationalAgeUnit = db.Column(db.String(50))
    gestationalAgeValue = db.Column(db.String(20))
    medicalHistory = db.Column(db.Text)
    drugHistory = db.Column(db.Text)
    zone = db.Column(db.String(20))
    tank = db.Column(db.String(20))
    block = db.Column(db.String(20))

    villageNumber = db.Column(db.String(50))
    # FOREIGN KEYS
    # villageNumber = db.Column(db.String(50), db.ForeignKey('village.villageNumber'))

    # RELATIONSHIPS
    # village = db.relationship('Village', backref=db.backref('patients', lazy=True))

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


class Reading(db.Model):
    readingId = db.Column(db.String(50), primary_key=True)
    bpSystolic = db.Column(db.Integer)
    bpDiastolic = db.Column(db.Integer)
    heartRateBPM = db.Column(db.Integer)
    symptoms = db.Column(db.Text)
    trafficLightStatus = db.Column(db.Enum(TrafficLightEnum), nullable=False)

    # date ex: 2019-09-25T19:00:16.683-07:00[America/Vancouver]
    dateLastSaved = db.Column(db.String(100)) 
    dateTimeTaken = db.Column(db.String(100))
    dateUploadedToServer = db.Column(db.String(100))
    dateRecheckVitalsNeeded = db.Column(db.String(100))

    gpsLocationOfReading = db.Column(db.String(50))
    retestOfPreviousReadingIds = db.Column(db.String(100))
    isFlaggedForFollowup = db.Column(db.Boolean)
    appVersion = db.Column(db.String(50))
    deviceInfo = db.Column(db.String(50))
    totalOcrSeconds = db.Column(db.Float)
    manuallyChangeOcrResults = db.Column(db.Integer)
    temporaryFlags = db.Column(db.Integer)
    userHasSelectedNoSymptoms = db.Column(db.Boolean)

    # FOREIGN KEYS
    patientId = db.Column(db.String(50), db.ForeignKey('patient.patientId'), nullable=False)

    # RELATIONSHIPS
    patient = db.relationship('Patient', backref=db.backref('readings', lazy=True))


class FollowUp(db.Model):
    __tablename__ = 'followup'
    id = db.Column(db.Integer, primary_key=True)
    followUpAction = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)


class Village(db.Model):
    villageNumber = db.Column(db.String(50), primary_key=True)
    zoneNumber    = db.Column(db.String(50))


######################
###    SCHEMAS     ###
######################

class UserSchema(ma.ModelSchema):
    class Meta:
        include_fk = True
        model = User

class PatientSchema(ma.ModelSchema):
    patientSex = EnumField(SexEnum, by_value=True)
    class Meta:
        include_fk = True
        model = Patient

class ReferralSchema(ma.ModelSchema):
    class Meta:
        include_fk = True
        model = Referral

class ReadingSchema(ma.ModelSchema):
    class Meta:
        include_fk = True
        model = Reading

class RoleSchema(ma.ModelSchema):
    class Meta:
        include_fk = True
        model = Role



user_schema = {
    "type": "object",
    "properties": {
        "username": {
            "type": "string",
        },
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string",
            "minLength": 5
        },
    },
    "required": ["email", "password"],
    "additionalProperties": False
}


def validate_user(data):
    try:
        validate(data, user_schema)
    except ValidationError as e:
        return {'ok': False, 'message': e}
    except SchemaError as e:
        return {'ok': False, 'message': e}
    return {'ok': True, 'data': data}
