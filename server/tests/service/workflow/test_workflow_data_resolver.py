import pytest
from unittest.mock import patch, Mock

class TestIntegrationWithRealCatalogue:
    
    @patch('data.db_operations.read')
    @patch('data.marshal.marshal')
    def test_evaluate_workflow_with_real_catalogue(self, mock_marshal, mock_read):
        mock_read.return_value = Mock()
        mock_marshal.return_value = {
            "id": "patient_456",
            "name": "Senior Patient",
            "sex": "MALE",
            "date_of_birth": "1950-01-01",  
            "is_pregnant": False
        }
        
        from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver
        
        resolver = WorkflowDataResolver()
        
        branches = [
            {
                "rule": '{">=": [{"var": "patient.age"}, 65]}',
                "target_step_id": "senior_care"
            },
            {
                "rule": '{"==": [{"var": "patient.sex"}, "MALE"]}',
                "target_step_id": "male_care"
            }
        ]
        
        result = resolver.evaluate_workflow_branches("patient_456", branches)
        
        assert result["status"] == "TRUE"
        assert result["branch"]["target_step_id"] == "senior_care"
    
    @patch('data.db_operations.read')
    @patch('data.marshal.marshal')
    def test_missing_patient_with_real_catalogue(self, mock_marshal, mock_read, app_context):
        mock_read.return_value = None
        mock_marshal.return_value = None
        
        from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver
        
        resolver = WorkflowDataResolver()
        
        branches = [
            {
                "rule": '{">=": [{"var": "patient.age"}, 18]}',
                "target_step_id": "adult"
            }
        ]
        
        result = resolver.evaluate_workflow_branches("nonexistent", branches)
        
        assert result["status"] == "NOT_ENOUGH_DATA"
        assert "patient.age" in result["missing_variables"]
    
    @patch('data.db_operations.read')
    @patch('data.marshal.marshal')
    def test_custom_attribute_age_with_real_catalogue(self, mock_marshal, mock_read, app_context):
        mock_read.return_value = Mock()
        mock_marshal.return_value = {
            "id": "patient_789",
            "name": "Test Patient",
            "sex": "FEMALE",
            "date_of_birth": "2000-01-01",  
            "is_pregnant": False
        }
        
        from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver
        
        resolver = WorkflowDataResolver()
        
        branches = [
            {"rule": '{">=": [{"var": "patient.age"}, 18]}'}
        ]
        
        result = resolver.resolve_data_for_branches("patient_789", branches)
        
        assert "$patient.age" in result
        assert result["$patient.age"] is not None
        assert isinstance(result["$patient.age"], (int, float))


class TestIntegrationWithMultipleDataSources:
    
    @patch('data.db_operations.read')
    @patch('data.marshal.marshal')
    def test_patient_and_reading_data(self, mock_marshal, mock_read, app_context):
        
        def mock_read_side_effect(model, **kwargs):
            mock_orm = Mock()
            mock_orm._model_class = model
            return mock_orm
        
        def mock_marshal_side_effect(orm_obj):
            model_class = getattr(orm_obj, '_model_class', None)
            
            from models import PatientOrm, ReadingOrm
            
            if model_class == PatientOrm:
                return {
                    "id": "patient_123",
                    "name": "Test Patient",
                    "sex": "FEMALE",
                    "is_pregnant": True
                }
            elif model_class == ReadingOrm:
                return {
                    "patient_id": "patient_123",
                    "systolic": 150,
                    "diastolic": 95
                }
            else:
                return {}
        
        mock_read.side_effect = mock_read_side_effect
        mock_marshal.side_effect = mock_marshal_side_effect
        
        from service.workflow.datasourcing.workflow_data_resolver import WorkflowDataResolver
        
        resolver = WorkflowDataResolver()
        
        branches = [
            {
                "rule": '{"and": [{"==": [{"var": "patient.sex"}, "FEMALE"]}, {">=": [{"var": "reading.systolic"}, 140]}]}',
                "target_step_id": "high_bp_female"
            }
        ]
        
        result = resolver.evaluate_workflow_branches("patient_123", branches)
        
        assert mock_read.call_count == 2, f"Expected 2 calls to read, got {mock_read.call_count}"
        assert mock_marshal.call_count == 2, f"Expected 2 calls to marshal, got {mock_marshal.call_count}"
        assert result["status"] == "TRUE", f"Expected TRUE but got {result['status']}"
        assert result["branch"]["target_step_id"] == "high_bp_female"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])