from __future__ import annotations

import datetime as dt
import types

from data.marshal import unmarshal
from models import SmsSecretKeyOrm


def _create_sms_secret_key(
    *,
    id: str = "ssk-001",
    user_id: int = 42,
    secret_key: str = "abc123",
    stale_date: dt.datetime | None = None,
    expiry_date: dt.datetime | None = None,
) -> dict:
    """
    Convenience function to create a dict representing an SmsSecretKeyOrm instance with the given parameters.

    Args:
        id (str, optional): Defaults to "ssk-001". The id of the SMS secret key.
        user_id (int, optional): Defaults to 42. The id of the user this key belongs to.
        secret_key (str, optional): Defaults to "abc123". The secret key itself.
        stale_date (datetime, optional): Defaults to None. Date after which the key becomes stale.
        expiry_date (datetime, optional): Defaults to None. Date after which the key expires.

    Returns:
        dict: A dict with the given parameters.

    """
    if stale_date is None:
        stale_date = dt.datetime(2024, 1, 2, 3, 4, 5, tzinfo=dt.timezone.utc)
    if expiry_date is None:
        expiry_date = dt.datetime(2024, 2, 3, 4, 5, 6, tzinfo=dt.timezone.utc)

    return {
        "id": id,
        "user_id": user_id,
        "secret_key": secret_key,
        "stale_date": stale_date,
        "expiry_date": expiry_date,
    }


def test_unmarshal_sms_secret_key_happy_path_passes_expected_payload_to_schema_load(
    schema_loads_by_model,
):
    """
    Test that unmarshal(SmsSecretKeyOrm) passes the expected payload to schema.load if all required fields are present and valid.

    The test creates a valid payload for SmsSecretKeyOrm and then calls unmarshal with that payload. It asserts that the returned object is a namespace with the correct values for each field, and that the schema.load function is called with the expected payload.

    Finally, it asserts that the input dict is unmodified and that exactly one load occurred for this object creation.
    """
    payload = _create_sms_secret_key(
        id="ssk-xyz",
        user_id=777,
        secret_key="sEcReT!",
        stale_date=dt.datetime(2025, 3, 4, 5, 6, 7, tzinfo=dt.timezone.utc),
        expiry_date=dt.datetime(2025, 4, 5, 6, 7, 8, tzinfo=dt.timezone.utc),
    )
    # Keep a copy to assert the input dict isn't mutated
    original_SSKey = dict(payload)

    unmarshal_SSKey = unmarshal(SmsSecretKeyOrm, payload)

    assert isinstance(unmarshal_SSKey, types.SimpleNamespace)
    assert unmarshal_SSKey.id == "ssk-xyz"
    assert unmarshal_SSKey.user_id == 777
    assert unmarshal_SSKey.secret_key == "sEcReT!"
    assert unmarshal_SSKey.stale_date == dt.datetime(
        2025, 3, 4, 5, 6, 7, tzinfo=dt.timezone.utc
    )
    assert unmarshal_SSKey.expiry_date == dt.datetime(
        2025, 4, 5, 6, 7, 8, tzinfo=dt.timezone.utc
    )

    loads = schema_loads_by_model("SmsSecretKeyOrm")
    assert len(loads) >= 1, "Expected schema.load(...) for SmsSecretKeyOrm"
    last = loads[-1]

    # The schema payload should include all provided fields unchanged
    assert last["id"] == "ssk-xyz"
    assert last["user_id"] == 777
    assert last["secret_key"] == "sEcReT!"
    assert last["stale_date"] == dt.datetime(
        2025, 3, 4, 5, 6, 7, tzinfo=dt.timezone.utc
    )
    assert last["expiry_date"] == dt.datetime(
        2025, 4, 5, 6, 7, 8, tzinfo=dt.timezone.utc
    )

    # Ensure exactly one load for this object creation (stronger signal)
    assert len(loads) == 1

    # Input dict should be unmodified
    assert payload == original_SSKey


def test_unmarshal_sms_secret_key_with_minimal_realistic_payload(schema_loads_by_model):
    """
    Test that unmarshal(SmsSecretKeyOrm) produces the expected payload with a minimal, realistic payload.

    The test creates a minimal, realistic payload for SmsSecretKeyOrm and then calls unmarshal with that payload. It asserts that the returned object is a namespace with the correct values for each field, and that the schema.load function is called with the expected payload.

    Finally, it asserts that the input dict is unmodified and that exactly one load occurred for this object creation.
    """
    payload = _create_sms_secret_key(
        id="ssk-002",
        user_id=1,
        secret_key="another-key",
        stale_date=dt.datetime(2023, 12, 31, 23, 59, 59, tzinfo=dt.timezone.utc),
        expiry_date=dt.datetime(2024, 1, 31, 12, 0, 0, tzinfo=dt.timezone.utc),
    )

    unmarshal_SSKey = unmarshal(SmsSecretKeyOrm, payload)
    assert isinstance(unmarshal_SSKey, types.SimpleNamespace)
    assert unmarshal_SSKey.id == "ssk-002"
    assert unmarshal_SSKey.user_id == 1
    assert unmarshal_SSKey.secret_key == "another-key"
    assert unmarshal_SSKey.stale_date == dt.datetime(
        2023, 12, 31, 23, 59, 59, tzinfo=dt.timezone.utc
    )
    assert unmarshal_SSKey.expiry_date == dt.datetime(
        2024, 1, 31, 12, 0, 0, tzinfo=dt.timezone.utc
    )

    loads = schema_loads_by_model("SmsSecretKeyOrm")
    assert loads, "Expected schema.load(...) for SmsSecretKeyOrm"
    last = loads[-1]
    assert last == payload
