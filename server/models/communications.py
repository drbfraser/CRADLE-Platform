from .base import db, get_uuid, get_current_time


# MODELS
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
