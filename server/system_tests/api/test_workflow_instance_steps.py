import pytest
from humps import decamelize

from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from data import crud
from models import (
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    FormClassificationOrm, 
    FormOrm, 
    FormTemplateOrm, 
    QuestionOrm,
)


def test_create_workflow_instance_step(
    database,
    form,
    form_template,
    form_classification,
    workflow_template1,
    workflow_instance1,
    api_post,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        minimal_workflow_instance_step = {
            "id": get_uuid(),
            "name": "Test Step 1",
            "description": "Test Step 1",
            "start_date": get_current_time(),
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
        }

        # Test creating workflow instance step
        response = api_post(
            endpoint="/api/workflow/instance/steps", json=minimal_workflow_instance_step
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create a form classification
        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Upload form template via request body
        response = api_post(endpoint="/api/forms/templates/body", json=form_template)
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create form 
        response = api_post(endpoint="/api/forms/responses", json=form)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Test creating workflow instance step with form
        workflow_instance_step_with_form = {
            "id": get_uuid(),
            "name": "Test Step with Form",
            "description": "Test Step with Form",
            "start_date": get_current_time(),
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
            "form_id": form["id"],
            "form": form,
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps", json=workflow_instance_step_with_form
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201
        assert response_body["form"] is not None
        assert response_body["form"]["id"] == form["id"]
        assert response_body["name"] == "Test Step with Form"
        assert response_body["status"] == "Active"
        assert response_body["workflow_instance_id"] == workflow_instance1["id"]

        # Verify the step was created in the database
        created_step = crud.read(
            WorkflowInstanceStepOrm, id=workflow_instance_step_with_form["id"]
        )
        assert created_step is not None
        assert created_step.form_id == form["id"]
        assert created_step.name == "Test Step with Form"

    finally:
        crud.delete_all(
            WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance1["id"]
        )
        crud.delete_all(WorkflowInstanceOrm, id=workflow_instance1["id"])
        crud.delete_all(WorkflowTemplateOrm, id=workflow_template1["id"])
        crud.delete_all(FormOrm, id="wissf")
        crud.delete_all(FormTemplateOrm, id="wissft")
        crud.delete_all(FormClassificationOrm, name="wissfc")


def test_get_workflow_instance_steps(
    database,
    form,
    form_template,
    form_classification,
    workflow_template1,
    workflow_instance1,
    api_post,
    api_get,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create first workflow instance step
        minimal_workflow_instance_step1 = {
            "id": get_uuid(),
            "name": "Test Step 1",
            "description": "Test Step 1",
            "start_date": get_current_time(),
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps",
            json=minimal_workflow_instance_step1,
        )
        database.session.commit()
        assert response.status_code == 201

        # Create a form classification
        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification
        )
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Upload form template via request body
        response = api_post(endpoint="/api/forms/templates/body", json=form_template)
        database.session.commit()

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create form 
        response = api_post(endpoint="/api/forms/responses", json=form)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Test creating workflow instance step with form
        workflow_instance_step_with_form = {
            "id": get_uuid(),
            "name": "Test Step with Form",
            "description": "Test Step with Form",
            "start_date": get_current_time() + 44345,
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
            "form_id": form["id"],
            "form": form,
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps",
            json=workflow_instance_step_with_form,
        )
        database.session.commit()

        assert response.status_code == 201

        # Test getting workflow instance steps with workflow_instance_id filter
        response = api_get(
            endpoint=f"/api/workflow/instance/steps?workflow_instance_id={workflow_instance1['id']}"
        )

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 2

        # Verify the steps are returned correctly
        step_names = [step["name"] for step in response_body["items"]]
        assert "Test Step 1" in step_names
        assert "Test Step with Form" in step_names

        # Test getting all workflow instance steps without filter
        response = api_get(endpoint="/api/workflow/instance/steps")

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) >= 2

    finally:
        crud.delete_all(
            WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance1["id"]
        )
        crud.delete_all(WorkflowInstanceOrm, id=workflow_instance1["id"])
        crud.delete_all(WorkflowTemplateOrm, id=workflow_template1["id"])
        crud.delete_all(FormOrm, id="wissf")
        crud.delete_all(FormTemplateOrm, id="wissft")
        crud.delete_all(FormClassificationOrm, name="wissfc")


def test_complete_workflow_instance_step(
    database,
    workflow_template1,
    workflow_instance1,
    api_post,
    api_patch,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance step
        start_time = get_current_time()
        minimal_workflow_instance_step = {
            "id": get_uuid(),
            "name": "Test Step to Complete",
            "description": "Test Step to Complete",
            "start_date": start_time,
            "last_edited": start_time + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps", json=minimal_workflow_instance_step
        )
        database.session.commit()
        assert response.status_code == 201

        step_id = minimal_workflow_instance_step["id"]

        # Test completing the workflow instance step
        response = api_patch(
            endpoint=f"/api/workflow/instance/steps/{step_id}/complete"
        )

        if response.status_code != 200:
            print(f"Error response status: {response.status_code}")
            print(f"Error response text: {response.text}")

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200

        # Verify the step was marked as completed
        assert response_body["status"] == "Completed"
        assert response_body["completion_date"] is not None
        assert response_body["last_edited"] is not None
        assert response_body["id"] == step_id
        assert response_body["name"] == "Test Step to Complete"

    finally:
        crud.delete_all(
            WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance1["id"]
        )
        crud.delete_all(WorkflowInstanceOrm, id=workflow_instance1["id"])
        crud.delete_all(WorkflowTemplateOrm, id=workflow_template1["id"])


@pytest.fixture
def workflow_template1(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "workflow_example1",
        "description": "workflow_example1",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "version": "0",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "rule": '{"and": [{"<": [{"var": "$patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": '["$patient.age"]',
        },
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification example 1",
        },
        "steps": [],
    }


@pytest.fixture
def workflow_instance1(vht_user_id, patient_id, workflow_template1):
    instance_id = get_uuid()
    return {
        "id": instance_id,
        "name": "workflow_instance1",
        "description": "Workflow Instance 1",
        "status": "Active",
        "start_date": get_current_time(),
        "current_step_id": None,
        "last_edited": get_current_time() + 44345,
        "completion_date": None,
        "patient_id": patient_id,
        "workflow_template_id": workflow_template1["id"],
        "steps": [],
    }


@pytest.fixture
def patient_id(create_patient, patient_info):
    """Create a patient and return its ID"""
    create_patient()
    return patient_info["id"]


@pytest.fixture
def form_classification():
    return {
        "id": "wissfc",
        "name": "wissfc",
    }


@pytest.fixture
def form_template():
    return {
        "classification": {"id": "wissfc", "name": "wissfc"},
        "id": "wissft",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form(patient_id):
    return {
        "id": "wissf2",
        "lang": "english",
        "form_template_id": "wissft",
        "form_classification_id": "wissfc",
        "patient_id": patient_id,
        "date_created": 1561011126,
        "archived": False, 
        "questions": [
            {
                "id": "test-question-01",
                "category_index": None,
                "question_index": 0,
                "question_text": "How the patient's condition?",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [
                    {
                        "question_index": 0,
                        "relation": "EQUAL_TO",
                        "answers": {"number": 4.0},
                    },
                ],
                "mc_options": [
                    {
                        "mc_id": 0,
                        "opt": "Decent",
                    },
                    {
                        "mc_id": 1,
                        "opt": "French",
                    },
                ],
                "answers": {"mc_id_array": [0]},
            },
            {
                "id": "test-question-02",  
                "category_index": None,
                "question_index": 1,
                "question_text": "Info",
                "question_type": "CATEGORY",
                "required": True,
                "answers": {}, 
            },
        ],
    }
