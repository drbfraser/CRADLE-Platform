"""RuleEvaluator applies catalogue type coercion before JsonLogic."""

from unittest.mock import patch

from service.workflow.evaluate.rule_evaluator import RuleEvaluator
from service.workflow.evaluate.rules_engine import RuleStatus


def test_evaluate_rule_coerces_string_patient_age_to_int():
    with patch(
        "service.workflow.evaluate.rule_evaluator.resolve_object_variable_paths",
        return_value={"patient.age": "25"},
    ):
        evaluator = RuleEvaluator(catalogue={})
        rule = '{"<=": [{"var": "patient.age"}, 30]}'
        status, resolutions = evaluator.evaluate_rule(rule, patient_id="p1")

    assert status == RuleStatus.TRUE
    by_var = {r.var: r for r in resolutions}
    assert by_var["patient.age"].value == 25


def test_evaluate_rule_coercion_failure_yields_none():
    with patch(
        "service.workflow.evaluate.rule_evaluator.resolve_object_variable_paths",
        return_value={"patient.age": "not-a-number"},
    ):
        evaluator = RuleEvaluator(catalogue={})
        rule = '{"<=": [{"var": "patient.age"}, 30]}'
        status, resolutions = evaluator.evaluate_rule(rule, patient_id="p1")

    by_var = {r.var: r for r in resolutions}
    assert by_var["patient.age"].value is None
    # Coercion yields None; RulesEngineImpl treats None as missing for required vars.
    assert status == RuleStatus.NOT_ENOUGH_DATA
