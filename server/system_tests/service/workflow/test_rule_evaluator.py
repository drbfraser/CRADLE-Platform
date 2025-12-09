from service.workflow.datasourcing.data_sourcing import VariableResolutionStatus
from server.service.workflow.evaluate.rule_evaluator import RuleEvaluator
from service.workflow.workflow_planner import WorkflowPlanner
from service.workflow.workflow_service import WorkflowService
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import (
    StartWorkflowActionModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepBranchModel,
    WorkflowTemplateStepModel,
)


class TestIntegratedRuleEvaluator:

    def test_evaluate_rule_with_patient_age(self, patient_factory):
        patient_factory.create(
            id="patient_age_test",
            name="Senior Patient",
            date_of_birth="1950-01-01",
            is_exact_date_of_birth=True,
        )

        evaluator = RuleEvaluator()
        rule = '{">=": [{"var": "patient.age"}, 65]}'

        status, var_resolutions = evaluator.evaluate_rule(rule, "patient_age_test")

        assert status == "TRUE"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "patient.age"
        assert var_resolutions[0].value > 70
        assert var_resolutions[0].status == VariableResolutionStatus.RESOLVED

    def test_evaluate_rule_with_missing_data(self, patient_factory):
        patient_factory.create(
            id="patient_no_reading", name="No Reading Patient"
        )

        evaluator = RuleEvaluator()
        rule = '{">=": [{"var": "reading.systolic_blood_pressure"}, 120]}'

        status, var_resolutions = evaluator.evaluate_rule(rule, "patient_no_reading")

        assert status == "NOT_ENOUGH_DATA"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "reading.systolic_blood_pressure"
        assert var_resolutions[0].value is None
        assert var_resolutions[0].status == VariableResolutionStatus.OBJECT_NOT_FOUND

    def test_evaluate_rule_with_multiple_variables(
        self, patient_factory, reading_factory, user_factory
    ):
        user_factory.create(id=120, username="user_multi_var")
        
        patient_factory.create(
            id="patient_multi_var",
            name="Multi Var Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
            is_pregnant=True,
        )
        reading_factory.create(
            id="reading_multi_var",
            patient_id="patient_multi_var",
            systolic_blood_pressure=150,
            diastolic_blood_pressure=95,
            heart_rate=78,
        )

        evaluator = RuleEvaluator()
        rule = '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}'

        status, var_resolutions = evaluator.evaluate_rule(rule, "patient_multi_var")

        assert status == "TRUE"
        assert len(var_resolutions) == 2
        
        var_dict = {vr.var: vr for vr in var_resolutions}
        assert "patient.sex" in var_dict
        assert "reading.systolic_blood_pressure" in var_dict
        
        assert var_dict["patient.sex"].status == VariableResolutionStatus.RESOLVED
        assert var_dict["reading.systolic_blood_pressure"].status == VariableResolutionStatus.RESOLVED
        
        assert var_dict["patient.sex"].value == "FEMALE"
        assert var_dict["reading.systolic_blood_pressure"].value == 150

    def test_evaluate_rule_no_rule_returns_true(self, patient_factory):
        patient_factory.create(id="patient_no_rule", name="Test Patient")

        evaluator = RuleEvaluator()

        status_none, _ = evaluator.evaluate_rule(None, "patient_no_rule")
        status_empty, _ = evaluator.evaluate_rule("", "patient_no_rule")

        assert status_none == "TRUE"
        assert status_empty == "TRUE"