"""Unit tests for workflow variable type coercion (Phase 7)."""

from datetime import date, datetime, timezone

import pytest

from enums import WorkflowVariableTypeEnum
from service.workflow.datasourcing.variable_type_coercion import (
    coerce_resolved_value_for_rule,
)
from service.workflow.datasourcing.variable_type_registry import (
    get_expected_type_for_variable,
    infer_expected_type_from_tag,
)


def test_coerce_integer_from_string():
    assert (
        coerce_resolved_value_for_rule(
            "42", WorkflowVariableTypeEnum.INTEGER, "x"
        )
        == 42
    )


def test_coerce_integer_none():
    assert coerce_resolved_value_for_rule(None, WorkflowVariableTypeEnum.INTEGER, "x") is None


def test_coerce_double():
    v = coerce_resolved_value_for_rule(
        "3.5", WorkflowVariableTypeEnum.DOUBLE, "x"
    )
    assert v == pytest.approx(3.5)


def test_coerce_boolean_strings():
    assert (
        coerce_resolved_value_for_rule(
            "true", WorkflowVariableTypeEnum.BOOLEAN, "x"
        )
        is True
    )
    assert (
        coerce_resolved_value_for_rule(
            "no", WorkflowVariableTypeEnum.BOOLEAN, "x"
        )
        is False
    )


def test_coerce_date_datetime():
    dt = datetime(2024, 6, 15, 12, 30, tzinfo=timezone.utc)
    out = coerce_resolved_value_for_rule(
        dt, WorkflowVariableTypeEnum.DATE, "x"
    )
    assert out == "2024-06-15"


def test_coerce_date_iso_string():
    assert (
        coerce_resolved_value_for_rule(
            "2024-01-02", WorkflowVariableTypeEnum.DATE, "x"
        )
        == "2024-01-02"
    )


def test_coerce_date_from_date():
    assert (
        coerce_resolved_value_for_rule(
            date(2020, 3, 4), WorkflowVariableTypeEnum.DATE, "x"
        )
        == "2020-03-04"
    )


def test_coerce_string_datetime():
    out = coerce_resolved_value_for_rule(
        datetime(2024, 1, 2, 3, 4, 5),
        WorkflowVariableTypeEnum.STRING,
        "local-date-time",
    )
    assert "2024-01-02" in out


def test_coerce_collection_passthrough():
    payload = {"a": 1}
    assert (
        coerce_resolved_value_for_rule(
            payload, WorkflowVariableTypeEnum.COLLECTION, "x"
        )
        is payload
    )


def test_infer_vitals_size():
    assert infer_expected_type_from_tag("vitals.size") == WorkflowVariableTypeEnum.INTEGER


def test_infer_vitals_latest_bp():
    assert (
        get_expected_type_for_variable("vitals[latest].systolic_blood_pressure")
        == WorkflowVariableTypeEnum.INTEGER
    )


def test_infer_wf_info():
    assert (
        get_expected_type_for_variable("wf.info.status")
        == WorkflowVariableTypeEnum.STRING
    )


def test_infer_reading_field():
    assert (
        get_expected_type_for_variable("reading.systolic_blood_pressure")
        == WorkflowVariableTypeEnum.INTEGER
    )
