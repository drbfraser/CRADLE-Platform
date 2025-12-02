"""
Integration tests for workflow evaluation with extractor, resolver, and rule engine.

These tests verify the complete flow from workflow template to rule evaluation
with real patient data.
"""

from service.workflow.evaluate.integrated_rule_evaluator import IntegratedRuleEvaluator
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
    """Test the integrated rule evaluator with real database data"""

    def test_evaluate_rule_with_patient_age(self, patient_factory):
        """Test evaluating a rule that checks patient age"""
        patient_factory.create(
            id="patient_age_test",
            name="Senior Patient",
            date_of_birth="1950-01-01",
            is_exact_date_of_birth=True,
        )

        evaluator = IntegratedRuleEvaluator()
        rule = '{">=": [{"var": "patient.age"}, 65]}'
        context = {"patient_id": "patient_age_test"} 

        status, var_resolutions = evaluator.evaluate_rule(rule, context)

        assert status == "TRUE"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "patient.age"
        assert var_resolutions[0].value > 70 

    def test_evaluate_rule_with_missing_data(self, patient_factory):
        """Test that missing data returns NOT_ENOUGH_DATA"""
        patient_factory.create(
            id="patient_no_reading", name="No Reading Patient"
        )

        evaluator = IntegratedRuleEvaluator()
        rule = '{">=": [{"var": "reading.systolic_blood_pressure"}, 120]}'
        context = {"patient_id": "patient_no_reading"} 

        status, var_resolutions = evaluator.evaluate_rule(rule, context)

        assert status == "NOT_ENOUGH_DATA"
        assert len(var_resolutions) == 0

    def test_evaluate_rule_with_multiple_variables(
        self, patient_factory, reading_factory, user_factory
    ):
        """Test evaluating a rule with multiple variables"""
        user_factory.create(id=1, username="user_multi_var")
        
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

        evaluator = IntegratedRuleEvaluator()
        rule = '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}'
        context = {"patient_id": "patient_multi_var"}

        status, var_resolutions = evaluator.evaluate_rule(rule, context)

        assert status == "TRUE"
        assert len(var_resolutions) == 2
        
        var_names = {vr.var for vr in var_resolutions}
        assert "patient.sex" in var_names
        assert "reading.systolic_blood_pressure" in var_names

    def test_evaluate_rule_no_rule_returns_true(self, patient_factory):
        patient_factory.create(id="patient_no_rule", name="Test Patient")

        evaluator = IntegratedRuleEvaluator()
        context = {"patient_id": "patient_no_rule"} 
        status_none, _ = evaluator.evaluate_rule(None, context)
        status_empty, _ = evaluator.evaluate_rule("", context)

        assert status_none == "TRUE"
        assert status_empty == "TRUE"


class TestWorkflowPlannerIntegration:

    def test_evaluate_step_with_real_data(
        self, patient_factory, reading_factory, user_factory, sequential_workflow_template
    ):
        user_factory.create(id=1, username="user_workflow_eval")
        
        patient_factory.create(
            id="patient_workflow_eval",
            name="Workflow Test Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
        )
        reading_factory.create(
            id="reading_workflow_eval",
            patient_id="patient_workflow_eval",
            systolic_blood_pressure=150,
        )

        workflow_instance = WorkflowService.generate_workflow_instance(
            sequential_workflow_template
        )
        workflow_instance.patient_id = "patient_workflow_eval"

        workflow_view = WorkflowView(sequential_workflow_template, workflow_instance)

        first_step = workflow_instance.steps[0]

        step_evaluation = WorkflowPlanner.evaluate_step(workflow_view, first_step)

        assert step_evaluation is not None
        assert len(step_evaluation.branch_evaluations) > 0

    def test_workflow_transitions_with_rule_evaluation(
        self, patient_factory, sequential_workflow_template
    ):
        patient_factory.create(
            id="patient_transition_test", name="Transition Test Patient"
        )

        workflow_instance = WorkflowService.generate_workflow_instance(
            sequential_workflow_template
        )
        workflow_instance.patient_id = "patient_transition_test"

        workflow_view = WorkflowView(sequential_workflow_template, workflow_instance)

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert len(actions) == 1
        assert isinstance(actions[0], StartWorkflowActionModel)

        WorkflowService.apply_workflow_action(actions[0], workflow_view)

        assert workflow_view.instance.status == "Active"
        assert workflow_view.instance.current_step_id is not None


class TestEndToEndWorkflowEvaluation:

    def test_complete_workflow_with_patient_age_rule(
        self, patient_factory, sequential_workflow_template
    ):
        patient_factory.create(
            id="patient_senior",
            name="Senior Patient",
            date_of_birth="1950-01-01",
            is_exact_date_of_birth=True,
        )

        workflow_instance = WorkflowService.generate_workflow_instance(sequential_workflow_template)
        workflow_instance.patient_id = "patient_senior"

        workflow_view = WorkflowView(sequential_workflow_template, workflow_instance)

        start_action = StartWorkflowActionModel()
        WorkflowService.apply_workflow_action(start_action, workflow_view)

        current_step = workflow_view.get_current_step()
        step_evaluation = WorkflowPlanner.evaluate_step(workflow_view, current_step)

        assert step_evaluation.selected_branch_id is not None
        assert len(step_evaluation.branch_evaluations) > 0
        
        assert step_evaluation.branch_evaluations[0].rule_status == "TRUE"