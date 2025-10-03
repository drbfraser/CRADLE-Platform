"""
Unit tests for JsonLogic Variable Extraction Parser
"""

import pytest
from server.service.workflow.evaluate.jsonlogic_parser import (
    JsonLogicParser,
    extract_variables_from_rule,
    validate_rule_syntax
)


class TestJsonLogicParser:
    """Test suite for JsonLogicParser class"""
    
    def test_simple_variable_extraction(self):
        parser = JsonLogicParser()
        rule = '{"==": [{"var": "answer.text"}, "A"]}'
        variables = parser.extract_variables(rule)
        assert variables == {"answer.text"}
    
    def test_multiple_variables(self):
        parser = JsonLogicParser()
        rule = {
            "and": [
                {"==": [{"var": "user.role"}, "admin"]},
                {">": [{"var": "user.age"}, 18]}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {"user.role", "user.age"}
    
    def test_nested_variables(self):
        parser = JsonLogicParser()
        rule = {
            "if": [
                {"==": [{"var": "patient.status"}, "active"]},
                {"var": "patient.treatment"},
                {"var": "patient.default_treatment"}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {
            "patient.status",
            "patient.treatment", 
            "patient.default_treatment"
        }
    
    def test_variable_with_default_value(self):
        parser = JsonLogicParser()
        rule = {"var": ["user.name", "Anonymous"]}
        variables = parser.extract_variables(rule)
        assert variables == {"user.name"}
    
    def test_no_variables(self):
        parser = JsonLogicParser()
        rule = {"==": [1, 1]}
        variables = parser.extract_variables(rule)
        assert variables == set()
    
    def test_duplicate_variables(self):
        parser = JsonLogicParser()
        rule = {
            "or": [
                {"==": [{"var": "status"}, "A"]},
                {"==": [{"var": "status"}, "B"]}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {"status"}
    
    def test_complex_workflow_rule(self):
        parser = JsonLogicParser()
        rule = {
            "and": [
                {"==": [{"var": "patient.risk_level"}, "high"]},
                {">": [{"var": "patient.blood_pressure"}, 140]},
                {"in": [{"var": "patient.symptoms"}, ["fever", "cough"]]}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {
            "patient.risk_level",
            "patient.blood_pressure",
            "patient.symptoms"
        }
    
    def test_empty_rule(self):
        parser = JsonLogicParser()
        rule = {}
        variables = parser.extract_variables(rule)
        assert variables == set()
    
    def test_invalid_json_string(self):
        parser = JsonLogicParser()
        with pytest.raises(ValueError, match="Invalid JSON"):
            parser.extract_variables('{"invalid": json}')
    
    def test_invalid_rule_type(self):
        parser = JsonLogicParser()
        with pytest.raises(ValueError, match="Invalid JSON"):
            parser.extract_variables("just a string")
    
    def test_list_rule(self):
        parser = JsonLogicParser()
        rule = [
            {"var": "field1"},
            {"var": "field2"}
        ]
        variables = parser.extract_variables(rule)
        assert variables == {"field1", "field2"}


class TestExtractVariablesFunction:
    """Test the wrapper function"""

    def test_wrapper_function_with_string(self):
        rule = '{"==": [{"var": "status"}, "active"]}'
        variables = extract_variables_from_rule(rule)
        assert variables == {"status"}

    def test_wrapper_function_with_dict(self):
        rule = {"==": [{"var": "status"}, "active"]}
        variables = extract_variables_from_rule(rule)
        assert variables == {"status"}


class TestValidateRuleSyntax:
    """Test rule validation function"""
    
    def test_valid_rule_dict(self):
        rule = {"==": [{"var": "x"}, 1]}
        assert validate_rule_syntax(rule) is True
    
    def test_valid_rule_string(self):
        rule = '{"==": [{"var": "x"}, 1]}'
        assert validate_rule_syntax(rule) is True
    
    def test_invalid_json(self):
        rule = '{"invalid": json}'
        assert validate_rule_syntax(rule) is False
    
    def test_invalid_type(self):
        rule = "just a string"
        assert validate_rule_syntax(rule) is False
    
    def test_empty_rule(self):
        rule = {}
        assert validate_rule_syntax(rule) is True


class TestEdgeCases:
    """Test edge cases and special scenarios"""
    
    def test_deeply_nested_structure(self):
        parser = JsonLogicParser()
        rule = {
            "and": [
                {
                    "or": [
                        {"==": [{"var": "a.b.c.d"}, 1]},
                        {"==": [{"var": "e.f.g.h"}, 2]}
                    ]
                },
                {
                    "if": [
                        {"var": "condition"},
                        {"var": "true_value"},
                        {"var": "false_value"}
                    ]
                }
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {
            "a.b.c.d",
            "e.f.g.h",
            "condition",
            "true_value",
            "false_value"
        }
    
    def test_variable_in_array_operations(self):
        parser = JsonLogicParser()
        rule = {
            "map": [
                {"var": "items"},
                {"var": "item.name"}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {"items", "item.name"}
    
    def test_numeric_var_values(self):
        parser = JsonLogicParser()
        rule = {"var": [0]}  # Numeric index, not a path
        variables = parser.extract_variables(rule)
        assert variables == set()
    
    def test_null_and_boolean_values(self):
        parser = JsonLogicParser()
        rule = {
            "and": [
                {"==": [{"var": "field1"}, None]},
                {"==": [{"var": "field2"}, True]},
                {"==": [{"var": "field3"}, False]}
            ]
        }
        variables = parser.extract_variables(rule)
        assert variables == {"field1", "field2", "field3"}