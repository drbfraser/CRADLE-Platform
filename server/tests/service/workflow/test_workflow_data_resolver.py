from unittest.mock import Mock, patch

from models import PatientOrm, ReadingOrm
from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver


class TestWorkflowDataResolverUnit:
    """Unit tests for WorkflowDataResolver"""

    @patch("service.workflow.datasourcing.workflow_data_resolver.resolve_variables")
    def test_resolve_data_for_branches_calls_resolve_variables(
        self, mock_resolve_variables
    ):
        mock_catalogue = {
            "patient": {"query": Mock(), "custom": {}},
            "reading": {"query": Mock(), "custom": {}},
        }
        mock_resolve_variables.return_value = {"patient.age": 25}

        resolver = WorkflowDataResolver(catalogue=mock_catalogue)

        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}', "target_step_id": "adult"}
        ]

        result = resolver.resolve_data_for_branches("patient_123", branches)

        mock_resolve_variables.assert_called_once()

        call_args = mock_resolve_variables.call_args
        assert call_args[0][0] == {"patient_id": "patient_123"}
        variables_list = call_args[0][1]
        assert len(variables_list) == 1
        assert variables_list[0].to_string() == "patient.age"
        assert call_args[0][2] == mock_catalogue

        assert result == {"patient.age": 25}

    @patch("service.workflow.datasourcing.workflow_data_resolver.resolve_variables")
    def test_resolve_data_for_branches_with_multiple_variables(
        self, mock_resolve_variables
    ):
        mock_catalogue = {
            "patient": {"query": Mock(), "custom": {}},
            "reading": {"query": Mock(), "custom": {}},
        }
        mock_resolve_variables.return_value = {
            "patient.age": 30,
            "patient.sex": "FEMALE",
            "reading.systolic": 120,
        }

        resolver = WorkflowDataResolver(catalogue=mock_catalogue)

        branches = [
            {
                "rule": '{"and": [{">=": [{"var": "patient.age"}, 18]}, {"==": [{"var": "patient.sex"}, "FEMALE"]}]}',
                "target_step_id": "adult_female",
            }
        ]

        result = resolver.resolve_data_for_branches("patient_456", branches)

        assert result == {
            "patient.age": 30,
            "patient.sex": "FEMALE",
            "reading.systolic": 120,
        }

    @patch("service.workflow.datasourcing.workflow_data_resolver.evaluate_branches")
    @patch("service.workflow.datasourcing.workflow_data_resolver.resolve_variables")
    def test_evaluate_workflow_branches_passes_resolved_data(
        self, mock_resolve_variables, mock_evaluate_branches
    ):
        mock_catalogue = {
            "patient": {"query": Mock(), "custom": {}},
            "reading": {"query": Mock(), "custom": {}},
        }
        mock_resolve_variables.return_value = {"patient.age": 25}
        mock_evaluate_branches.return_value = {
            "status": "TRUE",
            "branch": {"target_step_id": "adult"},
        }

        resolver = WorkflowDataResolver(catalogue=mock_catalogue)

        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}', "target_step_id": "adult"}
        ]

        result = resolver.evaluate_workflow_branches("patient_123", branches)

        mock_evaluate_branches.assert_called_once_with(
            branches=branches, data={"patient.age": 25}
        )

        assert result == {"status": "TRUE", "branch": {"target_step_id": "adult"}}


class TestIntegrationWithRealCatalogue:
    @patch("data.db_operations.read")
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

        resolver = WorkflowDataResolver()

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

    @patch("data.db_operations.read")
    @patch("data.marshal.marshal")
    def test_missing_patient_with_real_catalogue(self, mock_marshal, mock_read):
        mock_read.return_value = None
        mock_marshal.return_value = None

        resolver = WorkflowDataResolver()

        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}', "target_step_id": "adult"}
        ]

        result = resolver.evaluate_workflow_branches("nonexistent", branches)

        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "patient.age" in result["missing_variables"]


class TestIntegrationWithMultipleDataSources:
    @patch("data.db_operations.read")
    @patch("data.marshal.marshal")
    def test_patient_and_reading_data(self, mock_marshal, mock_read):
        def mock_read_side_effect(model, **kwargs):
            mock_orm = Mock()
            mock_orm.model_class = model
            return mock_orm

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

        mock_read.side_effect = mock_read_side_effect
        mock_marshal.side_effect = mock_marshal_side_effect

        resolver = WorkflowDataResolver()

        branches = [
            {
                "rule": '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic_blood_pressure"}, 140]}]}',
                "target_step_id": "high_bp_female",
            }
        ]

        result = resolver.evaluate_workflow_branches("patient_123", branches)

        assert mock_read.call_count == 2, (
            f"Expected 2 calls to read, got {mock_read.call_count}"
        )
        assert mock_marshal.call_count == 2, (
            f"Expected 2 calls to marshal, got {mock_marshal.call_count}"
        )
        assert result["status"] == "TRUE", f"Expected TRUE but got {result['status']}"
        assert result["branch"]["target_step_id"] == "high_bp_female"