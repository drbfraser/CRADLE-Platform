"""
Unit tests for rule_logic_parser (single-comparison variable logic extraction).
"""

import pytest

from service.workflow.evaluate.rule_logic_parser import parse_single_comparison_from_rule


def test_single_comparison_greater_than():
    rule = {">": [{"var": "patient.age"}, 18]}
    out = parse_single_comparison_from_rule(rule)
    assert out == {"variable_tag": "patient.age", "operator": ">", "value": 18}


def test_single_comparison_less_than():
    rule = {"<": [{"var": "vitals[latest].systolic"}, 140]}
    out = parse_single_comparison_from_rule(rule)
    assert out == {
        "variable_tag": "vitals[latest].systolic",
        "operator": "<",
        "value": 140,
    }


def test_single_comparison_gte():
    rule = {">=": [{"var": "patient.age"}, 21]}
    out = parse_single_comparison_from_rule(rule)
    assert out["operator"] == ">=" and out["value"] == 21


def test_single_comparison_rule_as_json_string():
    rule = '{"<=": [{"var": "patient.age"}, 65]}'
    out = parse_single_comparison_from_rule(rule)
    assert out == {"variable_tag": "patient.age", "operator": "<=", "value": 65}


def test_var_with_default_returns_variable_tag_only():
    rule = {">": [{"var": ["patient.age", 0]}, 18]}
    out = parse_single_comparison_from_rule(rule)
    assert out == {"variable_tag": "patient.age", "operator": ">", "value": 18}


def test_compound_rule_returns_none():
    rule = {"and": [{">": [{"var": "patient.age"}, 18]}, {"<": [{"var": "patient.age"}, 65]}]}
    assert parse_single_comparison_from_rule(rule) is None


def test_empty_or_invalid_returns_none():
    assert parse_single_comparison_from_rule(None) is None
    assert parse_single_comparison_from_rule({}) is None
    assert parse_single_comparison_from_rule({"and": []}) is None
    assert parse_single_comparison_from_rule("not json") is None
