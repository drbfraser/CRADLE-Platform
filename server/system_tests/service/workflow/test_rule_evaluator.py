from server.tests.helpers import get_uuid, make_workflow_instance

from service.workflow.datasourcing.data_sourcing import VariableResolutionStatus
from service.workflow.evaluate.rule_evaluator import RuleEvaluator
from service.workflow.workflow_service import WorkflowService
from validation.workflow_models import WorkflowInstanceModel


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
        patient_factory.create(id="patient_no_reading", name="No Reading Patient")

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
        assert (
            var_dict["reading.systolic_blood_pressure"].status
            == VariableResolutionStatus.RESOLVED
        )

        assert var_dict["patient.sex"].value == "FEMALE"
        assert var_dict["reading.systolic_blood_pressure"].value == 150

    def test_evaluate_rule_no_rule_returns_true(self, patient_factory):
        patient_factory.create(id="patient_no_rule", name="Test Patient")

        evaluator = RuleEvaluator()

        status_none, _ = evaluator.evaluate_rule(None, "patient_no_rule")
        status_empty, _ = evaluator.evaluate_rule("", "patient_no_rule")

        assert status_none == "TRUE"
        assert status_empty == "TRUE"

    def test_evaluate_rule_with_local_date(self):
        evaluator = RuleEvaluator()
        rule = '{"==": [{"var": "local-date"}, {"var": "local-date"}]}'

        status, var_resolutions = evaluator.evaluate_rule(rule, patient_id="p1")

        assert status == "TRUE"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "local-date"
        assert isinstance(var_resolutions[0].value, str)
        assert var_resolutions[0].status == VariableResolutionStatus.RESOLVED

    def test_evaluate_rule_with_current_user(self):
        evaluator = RuleEvaluator()
        current_user = {
            "id": 123,
            "name": "Alice Example",
            "username": "alice",
            "email": "alice@example.com",
            "health_facility_name": "Facility A",
            "role": "HCW",
        }
        rule = '{"==": [{"var": "current-user.name"}, {"var": "current-user.name"}]}'

        status, var_resolutions = evaluator.evaluate_rule(
            rule, patient_id="p1", current_user=current_user
        )

        assert status == "TRUE"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "current-user.name"
        assert var_resolutions[0].value == "Alice Example"
        assert var_resolutions[0].status == VariableResolutionStatus.RESOLVED

    def test_evaluate_rule_with_missing_current_user(self):
        evaluator = RuleEvaluator()
        rule = '{"==": [{"var": "current-user.name"}, {"var": "current-user.name"}]}'

        status, var_resolutions = evaluator.evaluate_rule(rule, patient_id="p1")

        assert status == "NOT_ENOUGH_DATA"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "current-user.name"
        assert var_resolutions[0].value is None
        assert var_resolutions[0].status == VariableResolutionStatus.OBJECT_NOT_FOUND

    def test_evaluate_rule_mixed_vitals_and_patient(
        self, patient_factory, reading_factory
    ):
        pid = "patient_vitals_mixed"
        patient_factory.create(
            id=pid,
            name="Mixed Vars Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
        )
        reading_factory.create(
            id="reading_vitals_mixed",
            patient_id=pid,
            systolic_blood_pressure=150,
            diastolic_blood_pressure=90,
            heart_rate=72,
        )

        evaluator = RuleEvaluator()
        rule = (
            '{"and": ['
            '{"==": [{"var": "patient.sex"}, "FEMALE"]}, '
            '{">=": [{"var": "vitals[latest].systolic_blood_pressure"}, 140]}'
            "]}"
        )

        status, var_resolutions = evaluator.evaluate_rule(rule, pid)

        assert status == "TRUE"
        by_var = {vr.var: vr for vr in var_resolutions}
        assert by_var["patient.sex"].value == "FEMALE"
        assert by_var["vitals[latest].systolic_blood_pressure"].value == 150

    def test_evaluate_rule_wf_info_status(self, patient_factory):
        pid = "patient_wf_info"
        patient_factory.create(
            id=pid,
            name="WF Info Patient",
            sex="MALE",
            date_of_birth="1985-01-01",
            is_exact_date_of_birth=True,
        )
        wf_id = get_uuid()
        wf_dict = make_workflow_instance(
            id=wf_id,
            patient_id=pid,
            name="Test WF",
            description="desc",
            status="Active",
            steps=[],
        )
        WorkflowService.upsert_workflow_instance(WorkflowInstanceModel(**wf_dict))

        evaluator = RuleEvaluator()
        rule = '{"==": [{"var": "wf.info.status"}, "Active"]}'

        status, var_resolutions = evaluator.evaluate_rule(
            rule, pid, workflow_instance_id=wf_id
        )

        assert status == "TRUE"
        assert len(var_resolutions) == 1
        assert var_resolutions[0].var == "wf.info.status"
        assert var_resolutions[0].value == "Active"
