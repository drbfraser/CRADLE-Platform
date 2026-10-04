import logging

import pytest
from werkzeug.test import Client

import authentication
from app import app
from common import user_utils
from common.user_utils import UserDict
from enums import RoleEnum
from service import assoc, view
from service.patient_authorization import can_access_patient


@pytest.fixture
def patient_access_scenario(
    facility_factory,
    patient_factory,
    user_factory,
):
    facility = facility_factory.create(name="AUTH-F1")

    users = {
        "admin": user_factory.create(
            email="auth-admin@example.com",
            role=RoleEnum.ADMIN.value,
            health_facility_name=facility.name,
        ),
        "hcw": user_factory.create(
            email="auth-hcw@example.com",
            role=RoleEnum.HCW.value,
            health_facility_name=facility.name,
        ),
        "cho": user_factory.create(
            email="auth-cho@example.com",
            role=RoleEnum.CHO.value,
            health_facility_name=facility.name,
        ),
        "vht": user_factory.create(
            email="auth-vht@example.com",
            role=RoleEnum.VHT.value,
            health_facility_name=facility.name,
        ),
        "unrelated_vht": user_factory.create(
            email="auth-unrelated-vht@example.com",
            role=RoleEnum.VHT.value,
            health_facility_name=facility.name,
        ),
        "unknown": user_factory.create(
            email="auth-unknown@example.com",
            role="UNKNOWN",
            health_facility_name=facility.name,
        ),
    }

    patients = {
        "vht_direct": patient_factory.create(id="AUTH-P1"),
        "unrelated": patient_factory.create(id="AUTH-P2"),
        "unknown_direct": patient_factory.create(id="AUTH-P3"),
    }

    assoc.associate(patients["vht_direct"], user=users["vht"])
    assoc.associate(patients["vht_direct"], facility=facility, user=users["vht"])
    assoc.associate(patients["unrelated"], user=users["unrelated_vht"])
    assoc.associate(patients["unknown_direct"], user=users["unknown"])

    return {
        "users": {name: _user_dict(user) for name, user in users.items()},
        "patients": {name: patient.id for name, patient in patients.items()},
    }


def _user_dict(user) -> UserDict:
    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "health_facility_name": user.health_facility_name,
        "role": user.role,
    }


@pytest.mark.parametrize(
    ("user_name", "patient_name", "expected"),
    [
        ("admin", "unrelated", True),
        ("hcw", "unrelated", True),
        ("cho", "unrelated", True),
        ("vht", "vht_direct", True),
        ("vht", "unrelated", False),
        ("unknown", "unknown_direct", False),
    ],
)
def test_can_access_patient(
    patient_access_scenario,
    user_name,
    patient_name,
    expected,
):
    user = patient_access_scenario["users"][user_name]
    patient_id = patient_access_scenario["patients"][patient_name]

    assert can_access_patient(user, patient_id) is expected


@pytest.mark.parametrize(
    ("user_name", "expected_patient_names"),
    [
        ("admin", ["vht_direct", "unrelated", "unknown_direct"]),
        ("hcw", ["vht_direct", "unrelated", "unknown_direct"]),
        ("cho", ["vht_direct", "unrelated", "unknown_direct"]),
        ("vht", ["vht_direct"]),
        ("unknown", []),
    ],
)
def test_patient_list_matches_access_policy(
    patient_access_scenario,
    user_name,
    expected_patient_names,
):
    users = patient_access_scenario["users"]
    patients = patient_access_scenario["patients"]

    rows = view.patient_list_view(
        users[user_name], search="AUTH-P", order_by="id", direction="ASC"
    )

    assert [row.id for row in rows] == sorted(
        patients[name] for name in expected_patient_names
    )


def test_scoped_patient_response_does_not_report_missing_authorization(
    patient_access_scenario, monkeypatch, caplog
):
    user = patient_access_scenario["users"]["vht"]
    patients = patient_access_scenario["patients"]
    monkeypatch.setattr(authentication, "_decode_access_token", dict)
    monkeypatch.setattr(user_utils, "get_current_user_from_jwt", lambda: user)

    with caplog.at_level(logging.WARNING, logger="api.authorization_check"):
        response = Client(app, app.response_class).get("/api/patients?search=AUTH-P")

    assert response.status_code == 200
    assert {patient["id"] for patient in response.json} == {patients["vht_direct"]}
    assert not [
        record for record in caplog.records if record.name == "api.authorization_check"
    ]


def test_vht_reading_collection_excludes_unassociated_patients(
    patient_access_scenario,
    reading_factory,
):
    patients = patient_access_scenario["patients"]
    users = patient_access_scenario["users"]
    associated_reading = reading_factory.create(
        id="AUTH-R1", patient_id=patients["vht_direct"], user_id=users["vht"]["id"]
    )
    reading_factory.create(
        id="AUTH-R2",
        patient_id=patients["unrelated"],
        user_id=users["unrelated_vht"]["id"],
    )

    rows = view.reading_view(users["vht"])

    assert [reading.id for reading, _ in rows if reading.id.startswith("AUTH-R")] == [
        associated_reading.id
    ]
