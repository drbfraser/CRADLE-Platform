from unittest.mock import Mock, patch

import data.db_operations as crud
from models import PatientOrm, ReadingOrm
from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver


class TestWorkflowDataResolverIntegration:
    """Integration tests for WorkflowDataResolver"""

    @patch("data.db_operations.read_by_filter")
    @patch("data.marshal.marshal")
    def test_evaluate_workflow_with_real_catalogue(self, mock_marshal, mock_read):
        mock_read.return_value = Mock()
        mock_marshal.return_value = {
            "id": "patient_456",
            "name": "Senior Patient",
            "sex": "MALE",
            "date_of_birth": "1950-01-01",
            "is_exact_date_of_birth": True,
            "is_pregnant": False,
        }

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

        result = resolver.evaluate_workflow_branches("patient_456", branches)

        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "senior_care"

    @patch("data.db_operations.read_by_filter")
    @patch("data.marshal.marshal")
    def test_missing_patient_with_real_catalogue(self, mock_marshal, mock_read):
        mock_read.return_value = None
        mock_marshal.return_value = None

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}', "target_step_id": "adult"}
        ]

        result = resolver.evaluate_workflow_branches("nonexistent", branches)

        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "patient.age" in result["missing_variables"]

    @patch("data.db_operations.read_by_filter")
    @patch("data.marshal.marshal")
    def test_patient_and_reading_data(self, mock_marshal, mock_read_by_filter):
        def mock_marshal_side_effect(orm_obj):
            model_class = getattr(orm_obj, "model_class", None)
            if model_class == PatientOrm:
                return {
                    "id": "patient_123",
                    "name": "Test Patient",
                    "sex": "FEMALE",
                    "date_of_birth": "1995-01-01",
                    "is_exact_date_of_birth": True,
                    "is_pregnant": True,
                }
            if model_class == ReadingOrm:
                return {
                    "id": "reading_123",
                    "patient_id": "patient_123",
                    "systolic_blood_pressure": 150,
                    "diastolic_blood_pressure": 95,
                    "heart_rate": 70,
                    "date_taken": 1234567890,
                }
            return {}

        def mock_read_by_filter_side_effect(model, filter_condition):
            mock_orm = Mock()
            mock_orm.model_class = model
            return mock_orm

        mock_read_by_filter.side_effect = mock_read_by_filter_side_effect
        mock_marshal.side_effect = mock_marshal_side_effect

        resolver = WorkflowDataResolver(get_catalogue())

        branches = [
            {
                "rule": '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}',
                "target_step_id": "high_bp_female",
            }
        ]

        result = resolver.evaluate_workflow_branches("patient_123", branches)

        assert mock_read_by_filter.call_count == 2
        assert mock_marshal.call_count == 2
        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "high_bp_female"

    def test_evaluate_with_real_patient_database(self, _database):
        patient = PatientOrm(
            id="real_patient_123",
            name="Real Patient",
            sex="FEMALE",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
            is_pregnant=True,
        )
        crud.create(patient, refresh=True)

        try:
            resolver = WorkflowDataResolver(get_catalogue())

            branches = [
                {
                    "rule": '{"==": [{"var": "patient.sex"}, "FEMALE"]}',
                    "target_step_id": "female_care",
                }
            ]

            result = resolver.evaluate_workflow_branches("real_patient_123", branches)

            assert result["status"] == "TRUE"
            assert result["branch"]["target_step_id"] == "female_care"
        finally:
            crud.delete(patient)

    def test_patient_and_reading_real_database(self, _database):
        patient = PatientOrm(
            id="patient_reading_789",
            name="BP Test Patient",
            sex="FEMALE",
            date_of_birth="1985-06-15",
            is_exact_date_of_birth=True,
            is_pregnant=True,
        )
        crud.create(patient, refresh=True)

        reading = ReadingOrm(
            id="reading_789",
            patient_id="patient_reading_789",
            systolic_blood_pressure=145,
            diastolic_blood_pressure=92,
            heart_rate=78,
            date_taken=1234567890,
            is_flagged_for_follow_up=False,
        )
        crud.create(reading, refresh=True)

        try:
            resolver = WorkflowDataResolver(get_catalogue())

            branches = [
                {
                    "rule": '{"and": [{"==": [{"var": "patient.is_pregnant"}, true]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}',
                    "target_step_id": "high_bp_pregnancy",
                }
            ]

            result = resolver.evaluate_workflow_branches(
                "patient_reading_789", branches
            )

            assert result["status"] == "TRUE"
            assert result["branch"]["target_step_id"] == "high_bp_pregnancy"
        finally:
            crud.delete(reading)
            crud.delete(patient)

    def test_missing_data_real_database(self, _database):
        patient = PatientOrm(
            id="patient_no_reading_999",
            name="No Reading Patient",
            sex="MALE",
            date_of_birth="1980-03-20",
            is_exact_date_of_birth=True,
            is_pregnant=False,
        )
        crud.create(patient, refresh=True)

        try:
            resolver = WorkflowDataResolver(get_catalogue())

            branches = [
                {
                    "rule": '{">=": [{"var": "reading.systolic_blood_pressure"}, 120]}',
                    "target_step_id": "normal_bp",
                }
            ]

            result = resolver.evaluate_workflow_branches(
                "patient_no_reading_999", branches
            )

            assert result["status"] == "NOT_ENOUGH_DATA"
            assert "reading.systolic_blood_pressure" in result["missing_variables"]
        finally:
            crud.delete(patient)
