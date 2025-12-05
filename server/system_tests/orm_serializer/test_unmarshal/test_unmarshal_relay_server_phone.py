from __future__ import annotations

from typing import Any

import pytest

from data import orm_serializer
from models import RelayServerPhoneNumberOrm


def _create_relay_phone(
    *,
    id: str = "rpn-001",
    phone_number: str = "+15551234567",
    description: str = "Nairobi triage line",
    last_received: int | None = 1_699_999_999,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {
        "id": id,
        "phone_number": phone_number,
        "description": description,
        **extras,
    }
    if last_received is not None:
        d["last_received"] = last_received
    return d


def test_unmarshal_relay_phone_number_sets_attrs_and_does_not_rename_field(monkeypatch):
    """
    Test that orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload) sets the appropriate
    attributes on the returned object and does not rename the "phone" field.
    """
    payload = _create_relay_phone(
        id="rpn-qa",
        phone_number="+254700000001",
        description="Main relay line (KE1)",
        last_received=1_725_000_123,
    )

    obj = orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload)
    assert isinstance(obj, RelayServerPhoneNumberOrm)

    assert obj.id == "rpn-qa"
    assert obj.description == "Main relay line (KE1)"
    assert getattr(obj, "last_received", None) == 1_725_000_123

    assert obj.phone_number == "+254700000001"

    assert not hasattr(obj, "region")


def test_unmarshal_relay_phone_number_without_last_received_is_none(monkeypatch):
    """
    Test that orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload) sets last_received to None if the key is missing from the payload.
    """
    payload = _create_relay_phone(
        id="rpn-002",
        phone_number="+15550000002",
        description="US relay #2",
        last_received=None,  # omit key entirely
    )

    obj = orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload)
    assert isinstance(obj, RelayServerPhoneNumberOrm)
    assert obj.id == "rpn-002"
    assert obj.description == "US relay #2"
    assert obj.phone_number == "+15550000002"

    assert obj.last_received is None


def test_unmarshal_relay_phone_number_missing_required_keys_raises_keyerror(
    monkeypatch,
):
    """
    Test that orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload) raises a KeyError
    if either phone or description are missing from the payload.
    """
    payload_missing_phone = {
        "id": "rpn-missing-phone",
        "description": "No phone provided",
    }
    with pytest.raises(KeyError) as excinfo_phone:
        orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload_missing_phone)
    assert excinfo_phone.value.args[0] == "phone_number"

    payload_missing_desc = {"id": "rpn-missing-desc", "phone_number": "+19990000000"}
    with pytest.raises(KeyError) as excinfo_desc:
        orm_serializer.unmarshal(RelayServerPhoneNumberOrm, payload_missing_desc)
    assert excinfo_desc.value.args[0] == "description"
