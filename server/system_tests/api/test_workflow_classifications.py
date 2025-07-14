import pytest
from humps import decamelize

from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from data import crud
from models import WorkflowClassificationOrm


def test_create_workflow_classification_success(database, api_post):
    """Test successful creation of a workflow classification"""
    classification_data = {
        "id": get_uuid(),
        "name": "Test Classification",
    }
    
    try:
        response = api_post(
            endpoint="/api/workflow/classifications", 
            json=classification_data
        )
        database.session.commit()
        
        response_body = decamelize(response.json())
        pretty_print(response_body)
        
        assert response.status_code == 201
        assert response_body["name"] == classification_data["name"]
        assert response_body["id"] == classification_data["id"]
        
        # Verify it was actually created in the database
        created_classification = crud.read(
            WorkflowClassificationOrm, 
            id=classification_data["id"]
        )
        assert created_classification is not None
        assert created_classification.name == classification_data["name"]
        
    finally:
        # Clean up - but be careful about what exists
        try:
            crud.delete_workflow_classification(
                WorkflowClassificationOrm, 
                id=classification_data["id"]
            )
        except:
            pass

    
def test_get_workflow_classifications_with_data(database, api_get, api_post):
    """Test getting workflow classifications when multiple exist"""
    # Create test classifications
    classification1_data = {
        "id": get_uuid(),
        "name": "Test Classification 1",
    }
    
    classification2_data = {
        "id": get_uuid(),
        "name": "Test Classification 2",
    }
    
    classification3_data = {
        "id": get_uuid(),
        "name": "Test Classification 3",
    }
    
    try:
        # Create the classifications
        api_post(endpoint="/api/workflow/classifications", json=classification1_data)
        api_post(endpoint="/api/workflow/classifications", json=classification2_data)
        api_post(endpoint="/api/workflow/classifications", json=classification3_data)
        database.session.commit()
        
        # Get all classifications
        response = api_get(endpoint="/api/workflow/classifications")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        
        assert response.status_code == 200
        assert "items" in response_body
        assert isinstance(response_body["items"], list)
        assert len(response_body["items"]) == 3
        
        # Check that all classifications are present
        classification_ids = [item["id"] for item in response_body["items"]]
        classification_names = [item["name"] for item in response_body["items"]]
        
        assert classification1_data["id"] in classification_ids
        assert classification2_data["id"] in classification_ids
        assert classification3_data["id"] in classification_ids
        
        assert classification1_data["name"] in classification_names
        assert classification2_data["name"] in classification_names
        assert classification3_data["name"] in classification_names
        
    finally:
        # Clean up
        for classification_data in [classification1_data, classification2_data, classification3_data]:
            try:
                crud.delete_workflow_classification(
                    WorkflowClassificationOrm, 
                    id=classification_data["id"]
                )
            except:
                pass


def test_get_single_workflow_classification_success(database, api_get, api_post):
    """Test getting a single workflow classification that exists"""
    classification_data = {
        "id": get_uuid(),
        "name": "Test Single Classification",
    }
    
    try:
        # Create the classification
        create_response = api_post(
            endpoint="/api/workflow/classifications", 
            json=classification_data
        )
        database.session.commit()
        
        assert create_response.status_code == 201
        
        # Get the specific classification
        response = api_get(
            endpoint=f"/api/workflow/classifications/{classification_data['id']}"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)
        
        assert response.status_code == 200
        assert response_body["id"] == classification_data["id"]
        assert response_body["name"] == classification_data["name"]
        
    finally:
        # Clean up
        try:
            crud.delete_workflow_classification(
                WorkflowClassificationOrm, 
                id=classification_data["id"]
            )
        except:
            pass