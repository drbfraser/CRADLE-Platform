from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from common.print_utils import pretty_print
from models import WorkflowClassificationOrm


def test_create_workflow_classification_success(database, api_post):
    """Test successful creation of a workflow classification"""
    classification_data = {
        "id": get_uuid(),
        "name": "Test Classification",
    }

    try:
        response = api_post(
            endpoint="/api/workflow/classifications", json=classification_data
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 201
        assert response_body["name"] == classification_data["name"]
        assert response_body["id"] == classification_data["id"]

        # Verify it was actually created in the database
        created_classification = crud.read(
            WorkflowClassificationOrm, id=classification_data["id"]
        )
        assert created_classification is not None
        assert created_classification.name == classification_data["name"]

    finally:
        crud.delete_workflow_classification(
            WorkflowClassificationOrm, id=classification_data["id"]
        )


def test_patch_workflow_classification(database, api_get, api_post, api_patch):
    classification_data = {
        "id": get_uuid(),
        "name": "Test Classification",
    }

    patch_data = {
        "name": "updated_classification_name",
    }

    try:
        response = api_post(
            endpoint="/api/workflow/classifications", json=classification_data
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 201
        assert response_body["name"] == classification_data["name"]
        assert response_body["id"] == classification_data["id"]

        # Verify it was actually created in the database
        created_classification = crud.read(
            WorkflowClassificationOrm, id=classification_data["id"]
        )
        assert created_classification is not None
        assert created_classification.name == classification_data["name"]

        response = api_patch(
            endpoint=f"/api/workflow/classifications/{classification_data['id']}",
            json=patch_data,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200
        assert response_body["name"] == "updated_classification_name"

        # Verify the changes persisted by getting the instance
        response = api_get(
            endpoint=f"/api/workflow/classifications/{classification_data['id']}"
        )
        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert response_body["name"] == "updated_classification_name"

    finally:
        crud.delete_workflow_classification(
            WorkflowClassificationOrm, id=classification_data["id"]
        )


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
        for classification_data in [
            classification1_data,
            classification2_data,
            classification3_data,
        ]:
            crud.delete_workflow_classification(
                WorkflowClassificationOrm, id=classification_data["id"]
            )


def test_get_single_workflow_classification_success(database, api_get, api_post):
    """Test getting a single workflow classification that exists"""
    classification_data = {
        "id": get_uuid(),
        "name": "Test Single Classification",
    }

    try:
        # Create the classification
        create_response = api_post(
            endpoint="/api/workflow/classifications", json=classification_data
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
        crud.delete_workflow_classification(
            WorkflowClassificationOrm, id=classification_data["id"]
        )
