"""
Unit tests for VariablePath parsing.
"""

import pytest

from service.workflow.datasourcing.data_sourcing import VariablePath


class TestVariablePathSimple:
    """Simple object.attribute and namespace.field_path formats."""

    def test_simple_two_part(self):
        p = VariablePath.from_string("patient.age")
        assert p is not None
        assert p.namespace == "patient"
        assert p.collection_index is None
        assert p.field_path == ["age"]
        assert p.to_string() == "patient.age"

    def test_simple_nested_three_part(self):
        p = VariablePath.from_string("patient.medical_history.diagnosis")
        assert p is not None
        assert p.namespace == "patient"
        assert p.collection_index is None
        assert p.field_path == ["medical_history", "diagnosis"]
        assert p.to_string() == "patient.medical_history.diagnosis"

    def test_namespace_with_hyphen(self):
        p = VariablePath.from_string("current-user.name")
        assert p is not None
        assert p.namespace == "current-user"
        assert p.field_path == ["name"]

    def test_wf_namespace(self):
        p = VariablePath.from_string("wf.info.status")
        assert p is not None
        assert p.namespace == "wf"
        assert p.field_path == ["info", "status"]

    def test_global_namespace(self):
        p = VariablePath.from_string("global.some-tag")
        assert p is not None
        assert p.namespace == "global"
        assert p.field_path == ["some-tag"]


class TestVariablePathCollectionIndexing:
    """Container indexing: [latest], [1], [-1]."""

    def test_latest_index(self):
        p = VariablePath.from_string("vitals[latest].systolic")
        assert p is not None
        assert p.namespace == "vitals"
        assert p.collection_index == "latest"
        assert p.field_path == ["systolic"]
        assert p.to_string() == "vitals[latest].systolic"

    def test_latest_case_insensitive(self):
        p = VariablePath.from_string("vitals[LATEST].diastolic")
        assert p is not None
        assert p.collection_index == "latest"

    def test_positive_integer_index(self):
        p = VariablePath.from_string("vitals[1].heart_rate")
        assert p is not None
        assert p.namespace == "vitals"
        assert p.collection_index == 1
        assert p.field_path == ["heart_rate"]

    def test_negative_integer_index(self):
        p = VariablePath.from_string("vitals[-1].systolic")
        assert p is not None
        assert p.collection_index == -1
        assert p.field_path == ["systolic"]

    def test_larger_integer_index(self):
        p = VariablePath.from_string("pregnancies[2].start_date")
        assert p is not None
        assert p.collection_index == 2
        assert p.field_path == ["start_date"]

    def test_collection_index_no_field_path(self):
        """vitals[latest] with no trailing field - resolves to item itself."""
        p = VariablePath.from_string("vitals[latest]")
        assert p is not None
        assert p.namespace == "vitals"
        assert p.collection_index == "latest"
        assert p.field_path == []
        assert p.to_string() == "vitals[latest]"


class TestVariablePathNestedFieldPaths:
    """Nested field paths after collection index."""

    def test_nested_after_index(self):
        p = VariablePath.from_string("vitals[latest].urine_test.leukocytes")
        assert p is not None
        assert p.namespace == "vitals"
        assert p.collection_index == "latest"
        assert p.field_path == ["urine_test", "leukocytes"]
        assert p.to_string() == "vitals[latest].urine_test.leukocytes"

    def test_nested_three_levels(self):
        p = VariablePath.from_string("forms[1].section.subfield.value")
        assert p is not None
        assert p.field_path == ["section", "subfield", "value"]


class TestVariablePathCollectionSize:
    """Collection .size access."""

    def test_collection_size(self):
        p = VariablePath.from_string("vitals.size")
        assert p is not None
        assert p.namespace == "vitals"
        assert p.collection_index is None
        assert p.field_path == ["size"]

    def test_pregnancies_size(self):
        p = VariablePath.from_string("pregnancies.size")
        assert p is not None
        assert p.field_path == ["size"]


class TestVariablePathRoundTrip:
    """Round-trip and str."""

    def test_round_trip_simple(self):
        s = "patient.age"
        p = VariablePath.from_string(s)
        assert p is not None
        assert p.to_string() == s
        assert str(p) == s

    def test_round_trip_collection(self):
        s = "vitals[latest].systolic"
        p = VariablePath.from_string(s)
        assert p is not None
        assert p.to_string() == s

    def test_round_trip_nested(self):
        s = "vitals[latest].urine_test.leukocytes"
        p = VariablePath.from_string(s)
        assert p is not None
        assert p.to_string() == s


class TestVariablePathInvalid:
    """Invalid inputs return None."""

    def test_empty_string(self):
        assert VariablePath.from_string("") is None
        assert VariablePath.from_string("   ") is None

    def test_single_part(self):
        assert VariablePath.from_string("patient") is None
        assert VariablePath.from_string("vitals") is None

    def test_non_integer_index(self):
        assert VariablePath.from_string("vitals[oldest].systolic") is None
        assert VariablePath.from_string("vitals[first].x") is None

    def test_float_index_rejected(self):
        """Only integer indices supported; 1.0 is invalid."""
        p = VariablePath.from_string("vitals[1.0].systolic")
        assert p is None


class TestVariablePathHashable:
    """VariablePath is frozen and hashable."""

    def test_equality(self):
        p1 = VariablePath.from_string("patient.age")
        p2 = VariablePath.from_string("patient.age")
        assert p1 is not None and p2 is not None
        assert p1 == p2

    def test_hash(self):
        p1 = VariablePath.from_string("vitals[latest].systolic")
        p2 = VariablePath.from_string("vitals[latest].systolic")
        assert p1 is not None and p2 is not None
        assert hash(p1) == hash(p2)

    def test_set_dedup(self):
        paths = [
            VariablePath.from_string("patient.age"),
            VariablePath.from_string("patient.age"),
            VariablePath.from_string("patient.sex"),
        ]
        paths = [p for p in paths if p is not None]
        assert len(set(paths)) == 2
