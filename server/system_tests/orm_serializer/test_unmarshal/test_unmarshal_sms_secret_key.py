from __future__ import annotations

import datetime as dt
import types

from data.marshal import unmarshal
from models import SmsSecretKeyOrm


def _to_iso_naive_utc(value: dt.datetime | None) -> str | None:
    """
    Marshmallow expects strings on load. Convert tz-aware → UTC → naive → ISO.
    If already naive, treat it as UTC and stringify.
    """
    if value is None:
        return None
    if value.tzinfo:
        value = value.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return value.replace(tzinfo=None).isoformat(timespec="seconds")


def _create_sms_secret_key(
    *,
    id: str = "ssk-001",
    user_id: int = 42,
    secret_key: str = "abc123",
    stale_date: dt.datetime | None = None,
    expiry_date: dt.datetime | None = None,
) -> dict:
    """
    Build payload using **ISO strings** (UTC, naive) for date-times.
    """
    if stale_date is None:
        stale_date = dt.datetime(2024, 1, 2, 3, 4, 5, tzinfo=dt.timezone.utc)
    if expiry_date is None:
        expiry_date = dt.datetime(2024, 2, 3, 4, 5, 6, tzinfo=dt.timezone.utc)
    return {
        "id": id,
        "user_id": user_id,
        "secret_key": secret_key,
        "stale_date": _to_iso_naive_utc(stale_date),
        "expiry_date": _to_iso_naive_utc(expiry_date),
    }


def _as_naive_dt(v: dt.datetime | str) -> dt.datetime:
    """Accept either datetime or ISO string; return naive UTC datetime."""
    if isinstance(v, str):
        # Marshmallow often returns 'YYYY-MM-DDTHH:MM:SS'
        return dt.datetime.fromisoformat(v)
    # If tz-aware sneaks in, normalize to naive UTC for comparison
    return v.astimezone(dt.timezone.utc).replace(tzinfo=None) if v.tzinfo else v


def _dt(y, m, d, H, M, S) -> dt.datetime:
    return dt.datetime(y, m, d, H, M, S, tzinfo=dt.timezone.utc).replace(tzinfo=None)


def test_unmarshal_sms_secret_key_happy_path_sets_fields_and_keeps_input_unchanged():
    """
    Test that unmarshal(SmsSecretKeyOrm) sets fields and keeps input unchanged when given a valid payload.
    The test creates a valid payload for SmsSecretKeyOrm, calls unmarshal with that payload, and then
    asserts that the returned object has the correct values for each field and that the input dict is unmodified.
    """
    payload = _create_sms_secret_key(
        id="ssk-xyz",
        user_id=777,
        secret_key="sEcReT!",
        stale_date=dt.datetime(2025, 3, 4, 5, 6, 7, tzinfo=dt.timezone.utc),
        expiry_date=dt.datetime(2025, 4, 5, 6, 7, 8, tzinfo=dt.timezone.utc),
    )
    original = dict(payload)

    obj = unmarshal(SmsSecretKeyOrm, payload)

    assert isinstance(obj, (SmsSecretKeyOrm, types.SimpleNamespace))
    assert obj.id == "ssk-xyz"
    assert obj.user_id == 777
    assert obj.secret_key == "sEcReT!"
    assert _as_naive_dt(obj.stale_date) == _dt(2025, 3, 4, 5, 6, 7)
    assert _as_naive_dt(obj.expiry_date) == _dt(2025, 4, 5, 6, 7, 8)
    assert payload == original


def test_unmarshal_sms_secret_key_with_minimal_payload():
    payload = _create_sms_secret_key(
        id="ssk-002",
        user_id=1,
        secret_key="another-key",
        stale_date=dt.datetime(2023, 12, 31, 23, 59, 59, tzinfo=dt.timezone.utc),
        expiry_date=dt.datetime(2024, 1, 31, 12, 0, 0, tzinfo=dt.timezone.utc),
    )

    obj = unmarshal(SmsSecretKeyOrm, payload)

    assert isinstance(obj, (SmsSecretKeyOrm, types.SimpleNamespace))
    assert obj.id == "ssk-002"
    assert obj.user_id == 1
    assert obj.secret_key == "another-key"
    assert _as_naive_dt(obj.stale_date) == _dt(2023, 12, 31, 23, 59, 59)
    assert _as_naive_dt(obj.expiry_date) == _dt(2024, 1, 31, 12, 0, 0)
