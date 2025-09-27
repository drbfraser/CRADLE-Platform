from .base import *

# MODELS
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
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.id')
    )
    patient_id = db.Column(
        db.String(50), 
        db.ForeignKey('patient.id')
    )
    health_facility_name = db.Column(
        db.String(50),
        db.ForeignKey('health_facility.id'),
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
        db.ForeignKey('user.id', ondelete="SET NULL"),
        nullable=True,
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id'),
        nullable=False,
    )
    referral_id = db.Column(
        db.String(50),
        db.ForeignKey('referral.id'),
        nullable=True,  # or nullable=False, depending on your business logic
    )

    # RELATIONSHIPS
    patient = db.relationship(
        'PatientOrm',
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
        db.ForeignKey('user.id'),
        nullable=False
    )
    patient_id = db.Column(
        db.String(50),
        db.ForeignKey('patient.id'),
        nullable=False,
    )

    # RELATIONSHIPS
    healthcare_worker = db.relationship(
        'UserOrm', backref=db.backref("assessments", lazy=True)
    )
    patient = db.relationship(
        'PatientOrm',
        backref=db.backref("assessments", cascade="all, delete-orphan", lazy=True),
    )

    @staticmethod
    def schema():
        return AssessmentSchema

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
    reading_id = db.Column(
        db.String(50), 
        db.ForeignKey('reading.id', ondelete="CASCADE")
    )

    # RELATIONSHIPS
    reading = db.relationship(
        'ReadingOrm',
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

# SCHEMAS
# class ReferralSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = ReferralOrm
#         load_instance = True
#         include_relationships = True

# class ReadingSchema(ma.SQLAlchemyAutoSchema):
#     trafficLightStatus = EnumField(TrafficLightEnum, by_value=True)

#     class Meta:
#         include_fk = True
#         model = ReadingOrm
#         load_instance = True
#         include_relationships = True
        
# class AssessmentSchema(ma.SQLAlchemyAutoSchema):
#     # late import to avoid circular dependency
#     def __init__(self, *args, **kwargs):
#         from .users import UserSchema
#         super().__init__(*args, **kwargs)
#         self.fields['healthcare_worker'] = fields.Nested(UserSchema)
    
#     class Meta:
#         include_fk = True
#         model = AssessmentOrm
#         load_instance = True
#         include_relationships = True

# class UrineTestSchema(ma.SQLAlchemyAutoSchema):
#     # urineTests = fields.Nested(ReadingSchema)
#     class Meta:
#         include_fk = True
#         model = UrineTestOrm
#         load_instance = True
#         include_relationships = True

