from .base import db, SupervisesTable, get_uuid
import datetime


# MODELS
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
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # RELATIONSHIPS
    user = db.relationship("UserOrm", back_populates="phone_numbers")

    def __repr__(self):
        """Return a string with enough information to uniquely identify the user."""
        return f"<UserPhoneNumberOrm {self.phone_number}>"


class SmsSecretKeyOrm(db.Model):
    """
    Stores temporary security keys for SMS authentication.

    Each user can have SMS secret keys with expiration dates for secure text message verification.
    Keys become stale before expiring completely.
    """

    __tablename__ = "sms_secret_key"
    id = db.Column(db.String(50), primary_key=True, nullable=False, default=get_uuid)
    secret_key = db.Column(db.String(256), default="", nullable=False)
    stale_date = db.Column(db.DateTime, default=datetime.datetime.now(), nullable=False)
    expiry_date = db.Column(
        db.DateTime,
        default=datetime.datetime.now(),
        nullable=False,
    )

    # FOREIGN KEYS
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )

    # RELATIONSHIPS
    user = db.relationship("UserOrm", back_populates="sms_secret_keys")
