from .base import *

# MODELS
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

class PatientAssociationsOrm(db.Model):
    """
    Links patients to their assigned healthcare workers and facilities.
    
    Creates associations between patients, users, and facilities for access control. 
    Patients can be associated with multiple providers across different facilities as needed for their care.
    """
    __tablename__ = "patient_association"
    id = db.Column(db.Integer, primary_key=True)
    
    # FOREIGN KEYS
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id', ondelete="CASCADE"),
        nullable=False,
    )
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey('health_facility.name', ondelete="CASCADE"),
        nullable=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(U'user.id', ondelete="CASCADE"), 
        nullable=True
    )

    # RELATIONSHIPS
    patient = db.relationship(
        'PatientOrm',
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    health_facility = db.relationship(
        'HealthFacilityOrm',
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    user = db.relationship(
        'UserOrm',
        backref=db.backref("associations", lazy=True, cascade="all, delete"),
    )
    
class PregnancyOrm(db.Model):
    """
    Tracks pregnancy records for female patients in the Cradle system.
    
    Records pregnancy start dates, completion dates, and outcomes. 
    Supports ongoing pregnancies (no end date) and completed pregnancies with documented outcomes. 
    """
    __tablename__ = "pregnancy"
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.BigInteger, nullable=False)
    end_date = db.Column(db.BigInteger, nullable=True, default=None)
    outcome = db.Column(db.Text)
    last_edited = db.Column(
        db.BigInteger,
        nullable=False,
        default=get_current_time,
        onupdate=get_current_time,
    )
    
    # FOREIGN KEYS
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id', ondelete="CASCADE"),
        nullable=False,
    )
    
    # RELATIONSHIPS
    patient = db.relationship(
        'PatientOrm',
        backref=db.backref("pregnancies", cascade="all, delete-orphan", lazy=True),
    )

class MedicalRecordOrm(db.Model):
    """
    Stores additional medical information and drug records for patients.
    
    Records medical notes, historical information, and medication records that supplement structured data. 
    Uses a flag to distinguish between general medical records and specific drug-related entries.
    """
    __tablename__ = "medical_record"
    id = db.Column(db.Integer, primary_key=True)
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
    
    # FOREIGN KEYS
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id', ondelete="CASCADE"),
        nullable=False,
    )

    # RELATIONSHIPS
    patient = db.relationship(
        'PatientOrm',
        backref=db.backref("records", cascade="all, delete-orphan", lazy=True),
    )
