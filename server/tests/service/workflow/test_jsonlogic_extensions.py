"""
Unit tests for custom JsonLogic operations and rule normalization.
"""

import json

from service.workflow.evaluate.jsonlogic_extensions import normalize_rule_literals
from service.workflow.evaluate.rules_engine import RulesEngineFacade, RuleStatus


class TestNormalizeRuleLiterals:
    def test_date_literal_to_iso_string(self):
        rule = {"<": [{"var": "dob"}, {"date": "2024-06-01"}]}
        normalized = normalize_rule_literals(rule)
        assert normalized == {"<": [{"var": "dob"}, "2024-06-01"]}

    def test_nested_date_literals(self):
        rule = {
            "and": [
                {"<": [{"var": "start"}, {"date": "2024-01-01"}]},
                {">": [{"var": "end"}, {"date": "2024-12-31"}]},
            ]
        }
        normalized = normalize_rule_literals(rule)
        assert normalized == {
            "and": [
                {"<": [{"var": "start"}, "2024-01-01"]},
                {">": [{"var": "end"}, "2024-12-31"]},
            ]
        }

    def test_non_date_dict_unchanged(self):
        rule = {"==": [{"var": "patient.name"}, "John"]}
        assert normalize_rule_literals(rule) == rule


class TestStringOperations:
    def test_contains_case_sensitive(self):
        rule = json.dumps(
            {"contains": [{"var": "notes"}, "Flu", False]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"notes": "Patient has Flu symptoms"}).status == RuleStatus.TRUE
        assert engine.evaluate({"notes": "Patient has flu symptoms"}).status == RuleStatus.FALSE

    def test_contains_case_insensitive(self):
        rule = json.dumps(
            {"contains": [{"var": "notes"}, "flu", True]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"notes": "Patient has FLU symptoms"}).status == RuleStatus.TRUE

    def test_starts_with_case_sensitive(self):
        rule = json.dumps(
            {"startsWith": [{"var": "code"}, "AB", False]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"code": "AB123"}).status == RuleStatus.TRUE
        assert engine.evaluate({"code": "ab123"}).status == RuleStatus.FALSE

    def test_starts_with_case_insensitive(self):
        rule = json.dumps(
            {"startsWith": [{"var": "code"}, "ab", True]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"code": "AB123"}).status == RuleStatus.TRUE

    def test_ends_with_case_sensitive(self):
        rule = json.dumps(
            {"endsWith": [{"var": "filename"}, ".PDF", False]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"filename": "report.PDF"}).status == RuleStatus.TRUE
        assert engine.evaluate({"filename": "report.pdf"}).status == RuleStatus.FALSE

    def test_ends_with_case_insensitive(self):
        rule = json.dumps(
            {"endsWith": [{"var": "filename"}, ".pdf", True]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"filename": "report.PDF"}).status == RuleStatus.TRUE

    def test_length(self):
        rule = json.dumps({">": [{"length": [{"var": "name"}]}, 3]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"name": "Jane"}).status == RuleStatus.TRUE
        assert engine.evaluate({"name": "Jo"}).status == RuleStatus.FALSE

    def test_length_with_missing_variable(self):
        rule = json.dumps({">": [{"length": [{"var": "name"}]}, 0]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({}).status == RuleStatus.NOT_ENOUGH_DATA


class TestDateComparisons:
    def test_date_before_with_blockly_literal(self):
        rule = json.dumps({"<": [{"var": "dob"}, {"date": "2024-06-01"}]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"dob": "2024-01-15"}).status == RuleStatus.TRUE

    def test_date_equal_with_blockly_literal(self):
        rule = json.dumps({"==": [{"var": "dob"}, {"date": "2024-01-15"}]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"dob": "2024-01-15"}).status == RuleStatus.TRUE

    def test_date_after_with_blockly_literal(self):
        rule = json.dumps({">": [{"var": "visit"}, {"date": "2024-01-01"}]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"visit": "2024-06-15"}).status == RuleStatus.TRUE

    def test_date_before_or_equal(self):
        rule = json.dumps({"<=": [{"var": "dob"}, {"date": "2024-01-15"}]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"dob": "2024-01-15"}).status == RuleStatus.TRUE

    def test_date_on_or_after(self):
        rule = json.dumps({">=": [{"var": "dob"}, {"date": "2024-01-15"}]})
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"dob": "2024-01-15"}).status == RuleStatus.TRUE

    def test_date_comparison_with_nested_variable(self):
        rule = json.dumps(
            {"<": [{"var": "patient.dob"}, {"date": "2000-01-01"}]}
        )
        engine = RulesEngineFacade(rule, {})
        assert engine.evaluate({"patient.dob": "1990-05-20"}).status == RuleStatus.TRUE
