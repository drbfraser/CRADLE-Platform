import datetime as dt

from data import marshal as m
from models import SmsSecretKeyOrm


def make_sms_secret_key(
    *,
    id_="ssk-001",
    user_id=777,
    secret_key="4e6f7264-53c7-4f31-9d5c-a65c0b1c9c2a",
    stale_date=dt.datetime(2024, 1, 1, 9, 0, 0),
    expiry_date=dt.datetime(2024, 1, 1, 10, 0, 0),
):
    s = SmsSecretKeyOrm()
    s.id = id_
    s.user_id = user_id
    s.secret_key = secret_key
    s.stale_date = stale_date
    s.expiry_date = expiry_date
    return s


def test_sms_secret_key_marshal_includes_core_fields_and_no_relationships():
    """
    marshal(SmsSecretKeyOrm) should return ONLY:
      - id, user_id, secret_key, stale_date, expiry_date
    and must NOT leak relationship objects (like 'user') or arbitrary attributes.
    It should preserve datetime objects (no string conversion in this implementation).
    """
    stale = dt.datetime(2024, 6, 1, 8, 30, 0)
    expiry = dt.datetime(2024, 6, 1, 9, 0, 0)
    s = make_sms_secret_key(
        id_="ssk-prod-42",
        user_id=42,
        secret_key="SEC-42-abcdef012345",
        stale_date=stale,
        expiry_date=expiry,
    )

    # Add attributes that must not appear in marshaled output
    s._debug = {"trace": True}
    s.extra = None

    out = m.marshal(s)

    # expected keys/values
    assert out["id"] == "ssk-prod-42"
    assert out["user_id"] == 42
    assert out["secret_key"] == "SEC-42-abcdef012345"

    # datetimes preserved as datetime objects
    assert out["stale_date"] == stale
    assert out["expiry_date"] == expiry

    # only those five fields present
    assert set(out.keys()) == {
        "id",
        "user_id",
        "secret_key",
        "stale_date",
        "expiry_date",
    }

    # relationship & private/extra fields not present
    assert "user" not in out
    assert "_debug" not in out
    assert "extra" not in out
