"""
Unit tests for Rule Engine
"""

from server.service.workflow.evaluate.rules_engine import (
    RulesEngineFacade,
    evaluate_branches,
)


class TestRuleEvaluator:
    def test_evaluate_simple_rule_true(self):
        rule = '{"==": [{"var": "age"}, 18]}'
        data = {"age": 18}

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "TRUE"
        assert result.value == True
        assert len(result.missing_variables) == 0

    def test_evaluate_simple_rule_false(self):
        rule = '{"==": [{"var": "age"}, 18]}'
        data = {"age": 25}

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "FALSE"
        assert result.value == False
        assert len(result.missing_variables) == 0

    def test_evaluate_rule_missing_data(self):
        rule = '{"==": [{"var": "age"}, 18]}'
        data = {}  # age is missing

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "NOT_ENOUGH_DATA"
        assert "age" in result.missing_variables

    def test_evaluate_rule_with_null_value(self):
        rule = '{"==": [{"var": "age"}, 18]}'
        data = {"age": None}

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "NOT_ENOUGH_DATA"
        assert "age" in result.missing_variables

    def test_evaluate_complex_rule(self):
        rule = '{"and": [{">=": [{"var": "age"}, 18]}, {"==": [{"var": "status"}, "active"]}]}'
        data = {"age": 25, "status": "active"}

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "TRUE"

    def test_evaluate_complex_rule_partial_data(self):
        rule = '{"and": [{">=": [{"var": "age"}, 18]}, {"==": [{"var": "status"}, "active"]}]}'
        data = {"age": 25}  # status is missing

        engine = RulesEngineFacade(rule, {})
        result = engine.evaluate(data)

        assert result.status == "NOT_ENOUGH_DATA"
        assert "status" in result.missing_variables

    def test_evaluate_with_datasources(self):
        rule = '{"==": [{"var": "$patient.age"}, 18]}'
        datasources = {"$patient.age": 18}
        data = {}

        engine = RulesEngineFacade(rule, datasources)
        result = engine.evaluate(data)

        assert result.status == "TRUE"


class TestEvaluateBranches:
    """Test suite for short-circuit branch evaluation"""

    def test_first_branch_true(self):
        branches = [
            {"id": "A", "rule": '{"==": [{"var": "answer"}, "A"]}', "target": "step_2"},
            {"id": "B", "rule": '{"==": [{"var": "answer"}, "B"]}', "target": "step_3"},
        ]
        data = {"answer": "A"}

        result = evaluate_branches(branches, data)

        assert result["status"] == "TRUE"
        assert result["branch"]["id"] == "A"

    def test_second_branch_true(self):
        branches = [
            {"id": "A", "rule": '{"==": [{"var": "answer"}, "A"]}', "target": "step_2"},
            {"id": "B", "rule": '{"==": [{"var": "answer"}, "B"]}', "target": "step_3"},
        ]
        data = {"answer": "B"}

        result = evaluate_branches(branches, data)

        assert result["status"] == "TRUE"
        assert result["branch"]["id"] == "B"

    def test_not_enough_data_stops_evaluation(self):
        branches = [
            {
                "id": "A",
                "rule": '{"==": [{"var": "missing"}, "A"]}',
                "target": "step_2",
            },
            {"id": "B", "rule": '{"==": [{"var": "answer"}, "B"]}', "target": "step_3"},
        ]
        data = {"answer": "B"}  # "missing" variable is not present

        result = evaluate_branches(branches, data)

        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "missing" in result["missing_variables"]

    def test_no_branches_match(self):
        branches = [
            {"id": "A", "rule": '{"==": [{"var": "answer"}, "A"]}', "target": "step_2"},
            {"id": "B", "rule": '{"==": [{"var": "answer"}, "B"]}', "target": "step_3"},
        ]
        data = {"answer": "C"}

        result = evaluate_branches(branches, data)

        assert result["status"] == "NO_MATCH"

    def test_branches_with_datasources(self):
        branches = [
            {
                "id": "A",
                "rule": '{">=": [{"var": "$patient.bp"}, 140]}',
                "target": "high_risk",
            },
        ]
        datasources = {"$patient.bp": 155}
        data = {}

        result = evaluate_branches(branches, data, datasources)

        assert result["status"] == "TRUE"
        assert result["branch"]["id"] == "A"
