import datetime as dt

from data import marshal as m
from models import SmsSecretKeyOrm

UTC = dt.timezone.utc


def make_sms_secret_key(
    *,
    id_="ssk-001",
    user_id=777,
    secret_key="4e6f7264-53c7-4f31-9d5c-a65c0b1c9c2a",
    stale_date=dt.datetime(2024, 1, 1, 9, 0, 0, tzinfo=UTC),
    expiry_date=dt.datetime(2024, 1, 1, 10, 0, 0, tzinfo=UTC),
):
    """
    Convenience function to create an SmsSecretKeyOrm instance with the given parameters.

    Args:
        id_ (str, optional): Defaults to "ssk-001". The id of the SMS secret key.
        user_id (int, optional): Defaults to 777. The id of the user this key belongs to.
        secret_key (str, optional): Defaults to "4e6f7264-53c7-4f31-9d5c-a65c0b1c9c2a". The secret key itself.
        stale_date (datetime, optional): Defaults to datetime.datetime(2024, 1, 1, 9, 0, 0, tzinfo=datetime.timezone.utc). Date after which the key becomes stale.
        expiry_date (datetime, optional): Defaults to datetime.datetime(2024, 1, 1, 10, 0, 0, tzinfo=datetime.timezone.utc). Date after which the key expires.

    Returns:
        SmsSecretKeyOrm: An instance of SmsSecretKeyOrm with the given parameters.

    """
    sms_sec_key = SmsSecretKeyOrm()
    sms_sec_key.id = id_
    sms_sec_key.user_id = user_id
    sms_sec_key.secret_key = secret_key
    sms_sec_key.stale_date = stale_date
    sms_sec_key.expiry_date = expiry_date
    return sms_sec_key


def test_sms_secret_key_marshal_includes_core_fields_and_no_relationships():
    """
    marshal(SmsSecretKeyOrm) should return ONLY:
      - id, user_id, secret_key, stale_date, expiry_date
    and must NOT leak relationship objects (like 'user') or arbitrary attributes.
    It should preserve datetime objects (no string conversion in this implementation).
    """
    stale = dt.datetime(2024, 6, 1, 8, 30, 0, tzinfo=UTC)
    expiry = dt.datetime(2024, 6, 1, 9, 0, 0, tzinfo=UTC)
    s = make_sms_secret_key(
        id_="ssk-prod-42",
        user_id=42,
        secret_key="SEC-42-abcdef012345",
        stale_date=stale,
        expiry_date=expiry,
    )

    s.extra = None

    marshalled = m.marshal(s)

    # expected keys/values
    assert marshalled["id"] == "ssk-prod-42"
    assert marshalled["user_id"] == 42
    assert marshalled["secret_key"] == "SEC-42-abcdef012345"

    # datetimes preserved as datetime objects
    assert marshalled["stale_date"] == stale
    assert marshalled["expiry_date"] == expiry

    # only those five fields present
    assert set(marshalled.keys()) == {
        "id",
        "user_id",
        "secret_key",
        "stale_date",
        "expiry_date",
    }

    assert "user" not in marshalled
    assert "extra" not in marshalled
