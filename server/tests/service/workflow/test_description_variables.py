from types import SimpleNamespace
from unittest.mock import patch

from service.workflow.datasourcing import data_sourcing, description_variables
from service.workflow.datasourcing.description_variables import (
    VariableOutcomeStatus,
    resolve_description_variables,
)
from validation.patients import PatientModel

REAL_MODEL_REGISTRY = {"patient": PatientModel}


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolves_object_namespace_variable():
    catalogue = {
        "patient": {
            "query": lambda id: {
                "id": id,
                "name": "Test Patient",
                "sex": "FEMALE",
                "date_of_birth": "1990-01-01",
                "is_exact_date_of_birth": True,
            },
            "custom": {},
        }
    }
    with patch.object(description_variables, "get_catalogue", return_value=catalogue):
        result = resolve_description_variables(
            {"patient_id": "p1"}, ["patient.name"]
        )

    assert result["patient.name"].status == VariableOutcomeStatus.RESOLVED
    assert result["patient.name"].value == "Test Patient"


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolves_explicit_null_field_as_resolved():
    """
    A real field with no value (e.g. zone unset) is RESOLVED with value=None,
    distinct from NO_DATA (the object/namespace couldn't be found at all).
    """
    catalogue = {
        "patient": {
            "query": lambda id: {
                "id": id,
                "name": "Test Patient",
                "sex": "FEMALE",
                "date_of_birth": "1990-01-01",
                "is_exact_date_of_birth": True,
            },
            "custom": {},
        }
    }
    with patch.object(description_variables, "get_catalogue", return_value=catalogue):
        result = resolve_description_variables({"patient_id": "p1"}, ["patient.zone"])

    assert result["patient.zone"].status == VariableOutcomeStatus.RESOLVED
    assert result["patient.zone"].value is None


def test_resolves_no_data_when_namespace_missing_from_catalogue():
    with patch.object(description_variables, "get_catalogue", return_value={}):
        result = resolve_description_variables({"patient_id": "p1"}, ["patient.name"])

    assert result["patient.name"].status == VariableOutcomeStatus.NO_DATA
    assert result["patient.name"].value is None


def test_resolves_collection_namespace_variable():
    catalogue = {
        "vitals": {
            "query": lambda _patient_id: [
                {"systolic_blood_pressure": 120, "date_taken": 100},
                {"systolic_blood_pressure": 110, "date_taken": 90},
            ],
            "collection": True,
        }
    }
    with patch.object(description_variables, "get_catalogue", return_value=catalogue):
        result = resolve_description_variables(
            {"patient_id": "p1"},
            ["vitals[latest].systolic_blood_pressure"],
        )

    resolved = result["vitals[latest].systolic_blood_pressure"]
    assert resolved.status == VariableOutcomeStatus.RESOLVED
    assert resolved.value == 120


def test_resolves_wf_namespace_variable():
    fake_instance = SimpleNamespace(
        start_date=123,
        status="Active",
        current_step_id="step1",
        name="Test Workflow",
        description="",
        completion_date=None,
        id="wf1",
        workflow_template_id="tmpl1",
        patient_id="p1",
        last_edited=123,
    )
    with (
        patch.object(description_variables, "get_catalogue", return_value={}),
        patch.object(
            data_sourcing.crud, "read_workflow_instance", return_value=fake_instance
        ),
    ):
        result = resolve_description_variables(
            {"patient_id": "p1", "workflow_instance_id": "wf1"},
            ["wf.info.status"],
        )

    assert result["wf.info.status"].status == VariableOutcomeStatus.RESOLVED
    assert result["wf.info.status"].value == "Active"


def test_not_yet_implemented_namespace_is_flagged_distinctly():
    with patch.object(description_variables, "get_catalogue", return_value={}):
        result = resolve_description_variables(
            {"patient_id": "p1"}, ["referrals[latest].date_referred"]
        )

    resolved = result["referrals[latest].date_referred"]
    assert resolved.status == VariableOutcomeStatus.NOT_IMPLEMENTED
    assert resolved.value is None


def test_invalid_variable_tag():
    with patch.object(description_variables, "get_catalogue", return_value={}):
        result = resolve_description_variables({"patient_id": "p1"}, ["notavalidtag"])

    assert result["notavalidtag"].status == VariableOutcomeStatus.INVALID_VARIABLE


def test_duplicate_and_equivalent_tags_resolve_once():
    call_count = {"n": 0}

    def mock_query(patient_id):
        call_count["n"] += 1
        return [{"systolic_blood_pressure": 120}]

    catalogue = {"vitals": {"query": mock_query, "collection": True}}
    with patch.object(description_variables, "get_catalogue", return_value=catalogue):
        result = resolve_description_variables(
            {"patient_id": "p1"},
            [
                "vitals[latest].systolic_blood_pressure",
                "vitals[ latest ].systolic_blood_pressure",  # same canonical path
            ],
        )

    assert call_count["n"] == 1
    assert all(
        r.status == VariableOutcomeStatus.RESOLVED and r.value == 120
        for r in result.values()
    )
