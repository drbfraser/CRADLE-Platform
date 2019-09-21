from app import db
import enum

# To add a table to db, make a new class
# create a migration: flask db migrate
# apply the migration: flask db upgrade

#####################
### ENUMS CLASSES ###
#####################
class RoleEnum(enum.Enum):
    VHT = 1
    HCW = 2
    ADMIN = 3

class SexEnum(enum.Enum):
    MALE = 1
    FEMALE = 2
    OTHER = 3


######################
### HELPER CLASSES ###
######################
user_role = db.Table('user_role',
    db.Column('id', db.Integer, primary_key=True),
    
    # FOREIGN KEYS
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)


#####################
### MODEL CLASSES ###
#####################
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    # FOREIGN KEYS
    health_facility_id = db.Column(db.Integer, db.ForeignKey('health_facility.id'), nullable=True)

    # RELATIONSHIPS
    health_facility = db.relationship('HealthFacility', backref=db.backref('users', lazy=True))
    role_ids = db.relationship('Role', secondary=user_role, backref=db.backref('users', lazy=True))
    referrals = db.relationship('Referral', backref=db.backref('users', lazy=True))

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Enum(RoleEnum), nullable=False)

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_referred = db.Column(db.DateTime, nullable=False)

    # FOREIGN KEYS
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))

    referral_health_facility_id = db.Column(db.Integer, db.ForeignKey('health_facility.id'))
    reading_id = db.Column(db.Integer, db.ForeignKey('reading.id'))
    follow_up_id = db.Column(db.Integer, db.ForeignKey('follow_up.id'))

    # RELATIONSHIPS
    health_facility = db.relationship('HealthFacility', backref=db.backref('referrals', lazy=True))
    reading = db.relationship('Reading', backref=db.backref('referrals', lazy=True))
    follow_up = db.relationship('FollowUp', backref=db.backref('referrals', lazy=True))

class HealthFacility(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(150), nullable=True)


class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Integer, nullable=False)
    sex = db.Column(db.Enum(SexEnum), nullable=False)
    pregnant = db.Column(db.Boolean)
    gestationalAge = db.Column(db.String(20))
    medical_history = db.Column(db.Text)
    drug_history = db.Column(db.Text)
    symptoms = db.Column(db.Text)


    # FOREIGN KEYS
    village_no = db.Column(db.String(50), db.ForeignKey('village.village_no'))

    # RELATIONSHIPS
    village = db.relationship('Village', backref=db.backref('patients', lazy=True))


class Reading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bp_systolic = db.Column(db.Integer)
    bp_diastolic = db.Column(db.Integer)
    heart_rate_bpm = db.Column(db.Integer)
    date_time_taken = db.Column(db.DateTime)
    date_uploaded_to_server = db.Column(db.DateTime)
    gps_location_of_reading = db.Column(db.String(50))

    # FOREIGN KEYS
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)

    # RELATIONSHIPS
    patient = db.relationship('Patient', backref=db.backref('readings', lazy=True))


class FollowUp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    follow_up_action = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)


class Village(db.Model):
    village_no = db.Column(db.String(50), primary_key=True)




    


