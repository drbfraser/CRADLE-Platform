import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from common.print_utils import pretty_print
from models import WorkflowClassificationOrm, WorkflowCollectionOrm


def test_workflow_collections_post(
    database, api_post, workflow_collection1, invalid_workflow_collection1
):
    try:
        response = api_post(
            endpoint="/api/workflow/collections", json=workflow_collection1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 201

        """
        Attempting to upload a collection with the same name as an already existing template should return HTTP 409
        """
        response = api_post(
            endpoint="/api/workflow/collections", json=invalid_workflow_collection1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 409

    finally:
        crud.delete_by(WorkflowCollectionOrm, id=workflow_collection1["id"])
        crud.delete_by(WorkflowClassificationOrm,
                       id=invalid_workflow_collection1["id"])


def test_workflow_collections_get(
    database,
    api_get,
    api_post,
    workflow_collection1,
    workflow_classification1,
    workflow_classification2,
):
    try:
        workflow_classification1["collection_id"] = workflow_collection1["id"]
        workflow_classification2["collection_id"] = workflow_collection1["id"]

        response = api_post(
            endpoint="/api/workflow/collections", json=workflow_collection1
        )
        database.session.commit()

        api_post(
            endpoint="/api/workflow/classifications", json=workflow_classification1
        )
        database.session.commit()

        api_post(
            endpoint="/api/workflow/classifications", json=workflow_classification2
        )
        database.session.commit()

        """
        Test getting a specific workflow collection
        """
        response = api_get(
            endpoint=f"/api/workflow/collections/{workflow_collection1['id']}?with_workflows=False"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert (
            response.status_code == 200
            and response_body["id"] == workflow_collection1["id"]
        )

        """
        Test getting a specific workflow collection plus the classifications under it
        """
        response = api_get(
            endpoint=f"/api/workflow/collections/{workflow_collection1['id']}?with_workflows=True"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert (
            response.status_code == 200 and len(
                response_body["classifications"]) == 2
        )

    finally:
        crud.delete_by(WorkflowCollectionOrm, id=workflow_collection1["id"])
        crud.delete_by(WorkflowClassificationOrm,
                       id=workflow_classification1["id"])
        crud.delete_by(WorkflowClassificationOrm,
                       id=workflow_classification2["id"])


# ~~~~~~~~~~~~~~~~~~~~~~~ Example workflow collections for testing ~~~~~~~~~~~~~~~~~~~~~~~~~~ #
@pytest.fixture
def workflow_collection1():
    collection_id = get_uuid()

    return {"id": collection_id, "name": "Workflow Collection 1"}


@pytest.fixture
def invalid_workflow_collection1():
    collection_id = get_uuid()

    return {
        "id": collection_id,
        "name": "Workflow Collection 1",  # A collection already exists with this name
    }


# ~~~~~~~~~~~~~~~~~~~~~~~ Example workflow classifications for testing ~~~~~~~~~~~~~~~~~~~~~~~~~~ #


@pytest.fixture
def workflow_classification1():
    classification_id = get_uuid()

    return {"id": classification_id, "name": {"English": "Workflow Classification 1"}}


@pytest.fixture
def workflow_classification2():
    classification_id = get_uuid()

    return {"id": classification_id, "name": {"English": "Workflow Classification 2"}}
