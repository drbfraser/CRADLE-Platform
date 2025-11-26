from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver


class TestWorkflowDataResolverIntegration:
    """Integration tests for WorkflowDataResolver with real database"""

    def test_evaluate_workflow_with_patient_age(self, patient_factory):
        patient_factory.create(
            id="patient_senior",
            name="Senior Patient",
            sex="MALE",
            date_of_birth="1950-01-01",
            is_exact_date_of_birth=True,
        )

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {
                "rule": '{">=": [{"var": "patient.age"}, 65]}',
                "target_step_id": "senior_care",
            },
            {
                "rule": '{"==": [{"var": "patient.sex"}, "MALE"]}',
                "target_step_id": "male_care",
            },
        ]

        result = resolver.evaluate_workflow_branches("patient_senior", branches)

        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "senior_care"

    def test_missing_patient_returns_not_enough_data(self):
        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}', "target_step_id": "adult"}
        ]

        result = resolver.evaluate_workflow_branches("nonexistent", branches)

        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "patient.age" in result["missing_variables"]

    def test_patient_and_reading_evaluation(self, patient_factory, reading_factory):
        patient_factory.create(
            id="patient_bp",
            name="BP Test Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
            is_pregnant=True,
        )
        reading_factory.create(
            id="reading_bp",
            patient_id="patient_bp",
            systolic_blood_pressure=150,
            diastolic_blood_pressure=95,
            heart_rate=70,
            date_taken=1234567890,
        )

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {
                "rule": '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}',
                "target_step_id": "high_bp_female",
            }
        ]

        result = resolver.evaluate_workflow_branches("patient_bp", branches)

        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "high_bp_female"

    def test_pregnancy_and_bp_evaluation(self, patient_factory, reading_factory):
        patient_factory.create(
            id="patient_preg_bp",
            name="Pregnant BP Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
            is_pregnant=True,
        )
        reading_factory.create(
            id="reading_preg_bp",
            patient_id="patient_preg_bp",
            systolic_blood_pressure=145,
            diastolic_blood_pressure=92,
            heart_rate=78,
            date_taken=1234567890,
        )

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {
                "rule": '{"and": [{"==": [{"var": "patient.is_pregnant"}, true]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}',
                "target_step_id": "high_bp_pregnancy",
            }
        ]

        result = resolver.evaluate_workflow_branches("patient_preg_bp", branches)

        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "high_bp_pregnancy"

    def test_missing_reading_data(self, patient_factory):
        patient_factory.create(
            id="patient_no_reading", name="No Reading Patient", sex="MALE"
        )

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {
                "rule": '{">=": [{"var": "reading.systolic_blood_pressure"}, 120]}',
                "target_step_id": "normal_bp",
            }
        ]

        result = resolver.evaluate_workflow_branches("patient_no_reading", branches)

        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "reading.systolic_blood_pressure" in result["missing_variables"]