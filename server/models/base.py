import marshmallow
from jsonschema import validate
from jsonschema.exceptions import SchemaError, ValidationError

from common.commonUtil import get_current_time
from config import db

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


def validate_timestamp(ts):
    """Raise a ValidationError if the timestamp is in the future."""
    if ts > get_current_time():
        raise marshmallow.ValidationError("Date must not be in the future.")


def validate_user(data):
    """Validate user data against the user schema, returning an error dict on failure."""
    try:
        validate(data, user_schema)
    except ValidationError as e:
        return {"ok": False, "message": e}
    except SchemaError as e:
        return {"ok": False, "message": e}
    return {"ok": True, "data": data}
