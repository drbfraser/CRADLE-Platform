from __future__ import annotations

import types
from typing import Any

import pytest

from data.marshal import unmarshal
from models import RelayServerPhoneNumberOrm


def _create_relay_phone(
    *,
    id: str = "rpn-001",
    phone: str = "+15551234567",
    description: str = "Nairobi triage line",
    last_received: int | None = 1_699_999_999,
    **extras: Any,
) -> dict:
    """
    Creates a dictionary representing a relay server phone number.

    Args:
        id: The ID of the relay server phone number.
        phone: The phone number of the relay server phone number.
        description: A description of the relay server phone number.
        last_received: The last time a message was received by the relay server phone number.
            None if not applicable.
        **extras: Any additional keyword arguments will be added to the dictionary.

    Returns:
        A dictionary representing the relay server phone number.

    """
    d: dict[str, Any] = {
        "id": id,
        "phone": phone,
        "description": description,
        **extras,
    }
    if last_received is not None:
        d["last_received"] = last_received
    return d


def test_unmarshal_relay_phone_number_forwards_payload_and_sets_attrs(
    schema_loads_by_model, without_model_key
):
    """
    Test that unmarshal(RelayServerPhoneNumberOrm, payload) forwards the payload and sets the appropriate attributes on the returned object.

    The test creates a payload representing a relay server phone number with an extra field ("region").
    It then calls unmarshal with the payload and checks that the returned object has the appropriate attributes set (id, phone, description, last_received, and region).
    Additionally, it checks that the returned object does not have an attribute named "phone_number" (indicating that no ORM-field rename occurred).

    The test also captures the schema.load call made by unmarshal and checks that the captured payload matches the original input payload.
    """
    payload = _create_relay_phone(
        id="rpn-qa",
        phone="+254700000001",
        description="Main relay line (KE1)",
        last_received=1_725_000_123,  # realistic epoch ms/seconds depending on system
        region="KE",  # extra field to ensure pass-through
    )

    unmarshal_relay_phone_num = unmarshal(RelayServerPhoneNumberOrm, payload)
    assert isinstance(unmarshal_relay_phone_num, types.SimpleNamespace)

    # Values carried to the returned object
    assert unmarshal_relay_phone_num.id == "rpn-qa"
    assert unmarshal_relay_phone_num.phone == "+254700000001"
    assert unmarshal_relay_phone_num.description == "Main relay line (KE1)"
    assert getattr(unmarshal_relay_phone_num, "last_received", None) == 1_725_000_123
    assert getattr(unmarshal_relay_phone_num, "region", None) == "KE"

    # Current behavior: no ORM-field rename here
    assert not hasattr(unmarshal_relay_phone_num, "phone_number")

    # Schema load call captured (payload-only view via conftest fixture)
    loads = schema_loads_by_model("RelayServerPhoneNumberOrm")
    assert loads, "Expected schema.load(...) for RelayServerPhoneNumberOrm"
    assert loads[-1] == payload
    assert without_model_key(loads[-1]) == payload


def test_unmarshal_relay_phone_number_without_last_received_stays_unset(
    schema_loads_by_model, without_model_key
):
    """
    Test that unmarshal(RelayServerPhoneNumberOrm, payload) does not set
    RelayServerPhoneNumberOrm.last_received if it is not present in the
    payload.

    The test creates a payload representing a relay server phone number
    without the last_received key. It then calls unmarshal with the
    payload and checks that the returned object does not have an
    attribute named "last_received" (indicating that no default value
    was injected by unmarshal).

    The test also captures the schema.load call made by unmarshal and
    checks that the captured payload matches the original input payload.
    """
    payload = _create_relay_phone(
        id="rpn-002",
        phone="+15550000002",
        description="US relay #2",
        last_received=None,  # omit the key
    )

    unmarshal_relay_phone_num = unmarshal(RelayServerPhoneNumberOrm, payload)
    assert isinstance(unmarshal_relay_phone_num, types.SimpleNamespace)
    assert unmarshal_relay_phone_num.id == "rpn-002"
    assert unmarshal_relay_phone_num.phone == "+15550000002"
    assert unmarshal_relay_phone_num.description == "US relay #2"
    assert not hasattr(unmarshal_relay_phone_num, "last_received"), (
        "Unmarshal should not inject defaults"
    )

    # No implicit rename by unmarshal
    assert not hasattr(unmarshal_relay_phone_num, "phone_number")

    loads = schema_loads_by_model("RelayServerPhoneNumberOrm")
    assert loads, "Expected schema.load(...) for RelayServerPhoneNumberOrm"
    # The forwarded payload should not contain `last_received`
    assert loads[-1] == {
        "id": "rpn-002",
        "phone": "+15550000002",
        "description": "US relay #2",
    }
    assert without_model_key(loads[-1]) == {
        "id": "rpn-002",
        "phone": "+15550000002",
        "description": "US relay #2",
    }


def test_unmarshal_relay_phone_number_missing_required_keys_raises_keyerror(
    schema_loads_by_model, without_model_key
):
    """
    Test that unmarshal(RelayServerPhoneNumberOrm, payload) raises a KeyError
    if any of the required fields are missing from the payload.

    The test creates two payloads: one missing the 'phone' key, and
    another missing the 'description' key. It then calls unmarshal with
    each payload and checks that a KeyError is raised with the correct
    key name.

    The test also captures the schema.load call made by unmarshal and
    checks that the captured payloads match the original input payloads.
    """
    payload_missing_phone = {
        "id": "rpn-missing-phone",
        "description": "No phone provided",
    }

    # Missing `phone`
    with pytest.raises(KeyError) as excinfo_phone:
        unmarshal(RelayServerPhoneNumberOrm, payload_missing_phone)
    assert excinfo_phone.value.args[0] == "phone"

    # Missing `description`
    payload_missing_desc = {"id": "rpn-missing-desc", "phone": "+19990000000"}
    with pytest.raises(KeyError) as excinfo_desc:
        unmarshal(RelayServerPhoneNumberOrm, payload_missing_desc)
    assert excinfo_desc.value.args[0] == "description"

    # Confirm both cases still forwarded to schema.load with the incomplete dicts
    loads = schema_loads_by_model("RelayServerPhoneNumberOrm")
    # We only care that each payload appears at least once; order is fine either way.
    assert any(without_model_key(call) == payload_missing_phone for call in loads)
    assert any(without_model_key(call) == payload_missing_desc for call in loads)
