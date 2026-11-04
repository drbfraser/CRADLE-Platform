import logging
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock

import pytest
from werkzeug.test import Client

import api.resources.sync as sync_api
import authentication
import data.db_operations as crud
from app import app
from common import user_utils
from enums import RoleEnum, SexEnum
from models import PatientAssociationsOrm, PatientOrm, UserOrm
from service import assoc
from validation.patients import SyncPatientRequest


@pytest.mark.parametrize(
    ("role", "expected_status"),
    [
        (RoleEnum.ADMIN, 201),
        (RoleEnum.HCW, 201),
        (RoleEnum.CHO, 201),
        (RoleEnum.VHT, 403),
    ],
)
def test_existing_patient_association_requires_approved_role(
    monkeypatch, caplog, role, expected_status
):
    patient = SimpleNamespace(id="P1")
    facility = SimpleNamespace(name="F1")
    user = SimpleNamespace(id=7, health_facility=facility)
    current_user = {"id": user.id, "role": role.value}

    def read_model(model, **filters):
        if model is PatientOrm:
            assert filters == {"id": patient.id}
            return patient
        if model is UserOrm:
            assert filters == {"id": user.id}
            return user
        raise AssertionError(f"Unexpected model: {model}")

    read = Mock(side_effect=read_model)
    associate = Mock()
    monkeypatch.setattr(authentication, "_decode_access_token", dict)
    monkeypatch.setattr(user_utils, "get_current_user_from_jwt", lambda: current_user)
    monkeypatch.setattr(crud, "read", read)
    monkeypatch.setattr(assoc, "has_association", Mock(return_value=False))
    monkeypatch.setattr(assoc, "associate", associate)

    with caplog.at_level(logging.WARNING, logger="api.authorization_check"):
        response = Client(app, app.response_class).post(
            "/api/patient_associations",
            json={"patientId": patient.id, "userId": 8, "healthFacilityName": "F2"},
        )

    assert response.status_code == expected_status
    if role is RoleEnum.VHT:
        read.assert_not_called()
        associate.assert_not_called()
    else:
        associate.assert_called_once_with(patient, facility, user)
    assert not [
        record for record in caplog.records if record.name == "api.authorization_check"
    ]


@pytest.mark.parametrize(
    "extra_fields",
    [(), ("userId", "healthFacilityName"), ("healthFacilityName",)],
    ids=["mobile-payload", "other-user-and-facility", "other-facility"],
)
def test_patient_association_uses_current_user_and_facility(
    monkeypatch, patient_factory, facility_factory, user_factory, extra_fields
):
    facility = facility_factory.create(name="association-current-facility")
    other_facility = facility_factory.create(name="association-other-facility")
    user = user_factory.create(
        username="association_current_user", health_facility_name=facility.name
    )
    other_user = user_factory.create(
        username="association_other_user", health_facility_name=other_facility.name
    )
    patient = patient_factory.create(id="association-patient")
    current_user = {"id": user.id, "role": RoleEnum.ADMIN.value}
    ignored_values = {
        "userId": other_user.id,
        "healthFacilityName": other_facility.name,
    }
    payload = {"patientId": patient.id}
    payload.update({field: ignored_values[field] for field in extra_fields})

    monkeypatch.setattr(authentication, "_decode_access_token", dict)
    monkeypatch.setattr(user_utils, "get_current_user_from_jwt", lambda: current_user)

    client = Client(app, app.response_class)
    for _ in range(2):
        response = client.post("/api/patient_associations", json=payload)
        assert response.status_code == 201

    associations = crud.read_all(PatientAssociationsOrm, patient_id=patient.id)
    assert [(item.user_id, item.health_facility_name) for item in associations] == [
        (user.id, facility.name)
    ]


@pytest.mark.parametrize(("has_access", "expected_status"), [(True, 200), (False, 207)])
def test_vht_sync_does_not_create_an_existing_patient_association(
    monkeypatch, has_access, expected_status
):
    patient_id = "P2"
    current_user = {"id": 7, "role": RoleEnum.VHT.value, "health_facility_name": "F1"}
    mobile_patient = SyncPatientRequest(
        id=patient_id,
        name="Test Patient",
        sex=SexEnum.FEMALE,
        date_of_birth="2000-01-01",
        is_exact_date_of_birth=True,
    )

    def read_model(model, **filters):
        if model is PatientOrm:
            assert filters == {"id": patient_id}
            return SimpleNamespace(id=patient_id, last_edited=0)
        if model is PatientAssociationsOrm:
            return None
        raise AssertionError(f"Unexpected model: {model}")

    create_all = Mock()
    monkeypatch.setattr(user_utils, "get_current_user_from_jwt", lambda: current_user)
    monkeypatch.setattr(sync_api, "can_access_patient", Mock(return_value=has_access))
    monkeypatch.setattr(crud, "read", Mock(side_effect=read_model))
    monkeypatch.setattr(crud, "create_all", create_all)
    monkeypatch.setattr(crud, "db_session", MagicMock())
    monkeypatch.setattr(sync_api.orm_serializer, "unmarshal", Mock())
    monkeypatch.setattr(sync_api.view, "patient_view", Mock(return_value=[]))

    response, status = sync_api.sync_patients(
        query=sync_api.LastSyncQueryParam(since=0),
        body=sync_api.SyncPatientsBody(root=[mobile_patient]),
    )

    assert status == expected_status
    if not has_access:
        assert response["errors"][0]["patient_id"] == patient_id
    create_all.assert_not_called()
