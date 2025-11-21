from unittest.mock import Mock, patch

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
            "reading.systolic_blood_pressure": 120,
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
            "reading.systolic_blood_pressure": 120,
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
