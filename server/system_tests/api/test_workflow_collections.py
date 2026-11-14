import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from models import WorkflowClassificationOrm, WorkflowCollectionOrm


def test_workflow_collections_post(
    database, api_post, workflow_collection1, invalid_workflow_collection1
):
    try:
        started_at = get_current_time()
        response = api_post(
            endpoint="/api/workflow/collections",
            json={**workflow_collection1, "dateCreated": 1, "lastEdited": 2},
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 201
        assert response_body["id"] == workflow_collection1["id"]
        assert response_body["name"] == workflow_collection1["name"]
        stored_collection = crud.read(WorkflowCollectionOrm, id=response_body["id"])
        for field in ("date_created", "last_edited"):
            assert started_at <= response_body[field] <= get_current_time()
            assert getattr(stored_collection, field) == response_body[field]

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
        crud.delete_by(WorkflowClassificationOrm, id=invalid_workflow_collection1["id"])


def test_update_workflow_collection_preserves_metadata(
    database, api_put, workflow_collection1
):
    collection_id = workflow_collection1["id"]
    crud.create(
        WorkflowCollectionOrm(**workflow_collection1, date_created=100, last_edited=200)
    )
    payload = {"name": "Updated collection", "dateCreated": 1, "lastEdited": 2}

    try:
        started_at = get_current_time()
        response = api_put(
            endpoint=f"/api/workflow/collections/{collection_id}", json=payload
        )
        assert response.status_code == 200
        response_body = decamelize(response.json())
        assert response_body["id"] == collection_id
        assert response_body["name"] == payload["name"]
        assert response_body["date_created"] == 100
        assert started_at <= response_body["last_edited"] <= get_current_time()

        database.session.expire_all()
        stored_collection = crud.read(WorkflowCollectionOrm, id=collection_id)
        assert stored_collection.name == payload["name"]
        assert stored_collection.date_created == 100
        assert stored_collection.last_edited == response_body["last_edited"]
    finally:
        crud.delete_by(WorkflowCollectionOrm, id=collection_id)


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

        response = api_post(
            endpoint="/api/workflow/classifications", json=workflow_classification1
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_post(
            endpoint="/api/workflow/classifications", json=workflow_classification2
        )
        database.session.commit()
        assert response.status_code == 201

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
            response.status_code == 200 and len(response_body["classifications"]) == 2
        )

    finally:
        crud.delete_by(WorkflowCollectionOrm, id=workflow_collection1["id"])
        crud.delete_by(WorkflowClassificationOrm, id=workflow_classification1["id"])
        crud.delete_by(WorkflowClassificationOrm, id=workflow_classification2["id"])


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
