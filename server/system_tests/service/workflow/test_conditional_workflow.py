import pytest

from service.workflow.workflow_service import WorkflowService
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import (
    StartWorkflowActionModel,
    CompleteStepActionModel,
    StartStepActionModel,
    CompleteWorkflowActionModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
    WorkflowTemplateStepBranchModel,
    RuleGroupModel,
)


@pytest.fixture
def conditional_workflow_template():
    """
    Workflow with age and blood pressure based branching:
    
    Step 1: Age Check
      - Branch 1: if age >= 65 → Senior Care (Step 2)
      - Branch 2: if age < 65 → Adult Care (Step 3)
    
    Step 2: Senior Care
      - Branch: unconditional → Blood Pressure Check (Step 4)
    
    Step 3: Adult Care
      - Branch: unconditional → Blood Pressure Check (Step 4)
    
    Step 4: Blood Pressure Check
      - Branch 1: if systolic_bp >= 140 → High BP Treatment (Step 5)
      - Branch 2: if systolic_bp < 140 → Normal BP Treatment (Step 6)
    
    Step 5: High BP Treatment (terminal)
    
    Step 6: Normal BP Treatment (terminal)
    """
    workflow_id = "conditional-wf-1"
    step1 = WorkflowTemplateStepModel(
        id="age-check-step",
        name="Age Check",
        description="Check patient age for care pathway",
        workflow_template_id=workflow_id,
        branches=[
            WorkflowTemplateStepBranchModel(
                id="branch-senior",
                step_id="age-check-step",
                target_step_id="senior-care-step",
                condition=RuleGroupModel(
                    id="rule-senior",
                    rule='{">=": [{"var": "patient.age"}, 65]}'
                )
            ),
            WorkflowTemplateStepBranchModel(
                id="branch-adult",
                step_id="age-check-step",
                target_step_id="adult-care-step",
                condition=RuleGroupModel(
                    id="rule-adult",
                    rule='{"<": [{"var": "patient.age"}, 65]}'
                )
            )
        ]
    )
    
    step2 = WorkflowTemplateStepModel(
        id="senior-care-step",
        name="Senior Care",
        description="Care pathway for seniors",
        workflow_template_id=workflow_id,
        branches=[
            WorkflowTemplateStepBranchModel(
                id="branch-senior-to-bp",
                step_id="senior-care-step",
                target_step_id="bp-check-step",
                condition=None
            )
        ]
    )
    
    step3 = WorkflowTemplateStepModel(
        id="adult-care-step",
        name="Adult Care",
        description="Care pathway for adults",
        workflow_template_id=workflow_id,
        branches=[
            WorkflowTemplateStepBranchModel(
                id="branch-adult-to-bp",
                step_id="adult-care-step",
                target_step_id="bp-check-step",
                condition=None
            )
        ]
    )
    
    step4 = WorkflowTemplateStepModel(
        id="bp-check-step",
        name="Blood Pressure Check",
        description="Check blood pressure for treatment pathway",
        workflow_template_id=workflow_id,
        branches=[
            WorkflowTemplateStepBranchModel(
                id="branch-high-bp",
                step_id="bp-check-step",
                target_step_id="high-bp-treatment-step",
                condition=RuleGroupModel(
                    id="rule-high-bp",
                    rule='{">=": [{"var": "reading.systolic_blood_pressure"}, 140]}'
                )
            ),
            WorkflowTemplateStepBranchModel(
                id="branch-normal-bp",
                step_id="bp-check-step",
                target_step_id="normal-bp-treatment-step",
                condition=RuleGroupModel(
                    id="rule-normal-bp",
                    rule='{"<": [{"var": "reading.systolic_blood_pressure"}, 140]}'
                )
            )
        ]
    )
    
    step5 = WorkflowTemplateStepModel(
        id="high-bp-treatment-step",
        name="High BP Treatment",
        description="Treatment for high blood pressure",
        workflow_template_id=workflow_id,
        branches=[]
    )
    
    step6 = WorkflowTemplateStepModel(
        id="normal-bp-treatment-step",
        name="Normal BP Treatment",
        description="Treatment for normal blood pressure",
        workflow_template_id=workflow_id,
        branches=[]
    )
    
    template = WorkflowTemplateModel(
        id=workflow_id,
        name="Conditional Care Workflow",
        description="Workflow with age and BP based conditional branching",
        archived=False,
        starting_step_id="age-check-step",
        version="V1",
        steps=[step1, step2, step3, step4, step5, step6]
    )
    
    return template


class TestEndToEndConditionalWorkflow:
    
    def test_senior_patient_with_high_bp_full_workflow(
        self, patient_factory, reading_factory, user_factory, conditional_workflow_template
    ):
        """
        Test complete workflow: Senior patient (age 75) with high BP (150/95)
        Expected path: Age Check → Senior Care → BP Check → High BP Treatment
        """
        user_factory.create(id=1, username="test_user")
        
        patient_factory.create(
            id="patient-senior-high-bp",
            name="Senior High BP Patient",
            date_of_birth="1948-01-01", 
            is_exact_date_of_birth=True,
        )
        reading_factory.create(
            id="reading-high-bp",
            patient_id="patient-senior-high-bp",
            systolic_blood_pressure=150,
            diastolic_blood_pressure=95,
            heart_rate=75,
        )
        
        workflow_instance = WorkflowService.generate_workflow_instance(
            conditional_workflow_template
        )
        workflow_instance.patient_id = "patient-senior-high-bp"
        workflow_view = WorkflowView(conditional_workflow_template, workflow_instance)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert len(actions) == 1
        assert isinstance(actions[0], StartWorkflowActionModel)
        
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        assert workflow_view.instance.status == "Active"
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert isinstance(actions[0], StartStepActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "age-check-step"
        assert current_step.status == "Active"
        
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        assert step_eval.selected_branch_id == "branch-senior"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert isinstance(actions[0], CompleteStepActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert isinstance(actions[0], StartStepActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "senior-care-step"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "bp-check-step"
        
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        assert step_eval.selected_branch_id == "branch-high-bp"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "high-bp-treatment-step"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert len(actions) == 1
        assert isinstance(actions[0], CompleteWorkflowActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        assert workflow_view.instance.status == "Completed"
        assert workflow_view.instance.current_step_id is not None
    
    def test_adult_patient_with_normal_bp_full_workflow(
        self, patient_factory, reading_factory, user_factory, conditional_workflow_template
    ):
        """
        Test complete workflow: Adult patient (age 35) with normal BP (120/80)
        Expected path: Age Check → Adult Care → BP Check → Normal BP Treatment
        """
        user_factory.create(id=1, username="test_user2")
        
        patient_factory.create(
            id="patient-adult-normal-bp",
            name="Adult Normal BP Patient",
            date_of_birth="1989-01-01",
            is_exact_date_of_birth=True,
        )
        reading_factory.create(
            id="reading-normal-bp",
            patient_id="patient-adult-normal-bp",
            systolic_blood_pressure=120,
            diastolic_blood_pressure=80,
            heart_rate=70,
        )
        
        workflow_instance = WorkflowService.generate_workflow_instance(
            conditional_workflow_template
        )
        workflow_instance.patient_id = "patient-adult-normal-bp"
        workflow_view = WorkflowView(conditional_workflow_template, workflow_instance)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        assert step_eval.selected_branch_id == "branch-adult"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "adult-care-step"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        assert step_eval.selected_branch_id == "branch-normal-bp"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "normal-bp-treatment-step"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert isinstance(actions[0], CompleteWorkflowActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        assert workflow_view.instance.status == "Completed"
    
    def test_missing_reading_data_returns_not_enough_data(
        self, patient_factory, conditional_workflow_template
    ):
        """
        Test workflow when patient has no readings - should return NOT_ENOUGH_DATA at BP check
        """
        patient_factory.create(
            id="patient-no-reading",
            name="Patient Without Reading",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
        )
        
        workflow_instance = WorkflowService.generate_workflow_instance(
            conditional_workflow_template
        )
        workflow_instance.patient_id = "patient-no-reading"
        workflow_view = WorkflowView(conditional_workflow_template, workflow_instance)
        
        WorkflowService.apply_workflow_action(StartWorkflowActionModel(), workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        assert step_eval.selected_branch_id == "branch-adult"
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        WorkflowService.advance_workflow(workflow_view)
        
        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)
        
        current_step = workflow_view.get_current_step()
        assert current_step.workflow_template_step_id == "bp-check-step"
        
        step_eval = WorkflowService.evaluate_workflow_step(workflow_view, current_step.id)
        
        for branch_eval in step_eval.branch_evaluations:
            assert branch_eval.rule_status == "NOT_ENOUGH_DATA"
        
        assert step_eval.selected_branch_id is None