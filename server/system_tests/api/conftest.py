from types import SimpleNamespace

import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from enums import QuestionTypeEnum, SexEnum
from models import (
    FormAnswerOrmV2,
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormOrm,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrm,
    FormTemplateOrmV2,
    LangVersionOrmV2,
    WorkflowInstanceOrm,
    WorkflowTemplateOrm,
)
from service.workflow.workflow_service import WorkflowService
from service.workflow.workflow_view import WorkflowView
from tests import helpers
from validation.workflow_models import WorkflowInstanceModel, WorkflowTemplateModel


@pytest.fixture
def vht_user_id():
    # id of "Test VHT" (require seed_test_data)
    return 3


@pytest.fixture
def patient_id():
    return "87356709248"


@pytest.fixture
def patient_info(patient_id):
    return {
        "id": patient_id,
        "name": "Mary Brown",
        "sex": SexEnum.FEMALE.value,
        "date_of_birth": "1998-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "1001",
        "is_archived": False,
    }


@pytest.fixture
def create_patient(database, patient_factory, patient_info):
    def f():
        patient_factory.create(**patient_info)
        database.session.commit()

    return f


@pytest.fixture
def reading_id():
    return "4d74a69b-e638-47e8-b17f-644ec564b6ea"


@pytest.fixture
def reading(reading_id, patient_id):
    # Invariant - trafficLightStatus: YELLOW_UP
    return {
        "id": reading_id,
        "patient_id": patient_id,
        "systolic_blood_pressure": 142,
        "diastolic_blood_pressure": 91,
        "heart_rate": 63,
        "symptoms": [],
    }


@pytest.fixture
def create_reading_with_referral(
    patient_id,
    reading_id,
    reading,
    referral_factory,
    reading_factory,
    facility_factory,
    user_factory,
):
    def f(
        reading_id=reading_id,
        facility_name="H6000",
        user_id=4000,
        date_referred=1620000000,
        is_assessed=False,
    ):
        facility_factory.create(name=facility_name)
        user_factory.create(id=user_id, username=f"user_{user_id}")

        reading.update({"id": reading_id, "user_id": user_id})
        reading_factory.create(**reading)
        referral_factory.create(
            patient_id=patient_id,
            user_id=user_id,
            date_referred=date_referred,
            health_facility_name=facility_name,
            is_assessed=is_assessed,
        )

    return f


@pytest.fixture
def pregnancy_earlier(patient_id):
    return {
        "id": 60360714,
        "patient_id": patient_id,
        "start_date": 1561011126,
        "end_date": 1584684726,
        "outcome": "Baby born at 9 months - spontaneous vaginal delivery. Baby weighed 3kg.",
    }


@pytest.fixture
def pregnancy_later(patient_id):
    return {
        "id": 60360715,
        "patient_id": patient_id,
        "start_date": 1600150326,
    }


@pytest.fixture
def medical_record(patient_id):
    return {
        "id": 60360716,
        "patient_id": patient_id,
        "information": "Pregnancy induced hypertension - onset 5 months.",
        "is_drug_record": False,
    }


@pytest.fixture
def drug_record(patient_id):
    return {
        "id": 60360717,
        "patient_id": patient_id,
        "information": "Labetalol 300mg three times daily.",
        "is_drug_record": True,
    }


@pytest.fixture
def form_classification(database):
    fc_id = get_uuid()
    payload = {"id": fc_id, "name": fc_id}
    try:
        yield payload
    finally:
        crud.delete_all(FormClassificationOrm, id=fc_id)
        crud.delete_all(FormClassificationOrm, name=fc_id)
        database.session.commit()


@pytest.fixture
def form_template(database, form_classification):
    ft_id = get_uuid()
    payload = {
        "classification": form_classification,
        "id": ft_id,
        "version": "V1",
        "questions": [],
    }
    try:
        yield payload
    finally:
        crud.delete_all(FormOrm, form_template_id=ft_id)
        crud.delete_all(FormTemplateOrm, id=ft_id)
        database.session.commit()


@pytest.fixture
def form(patient_id, form_template, form_classification):
    return {
        "id": "f9",
        "lang": "english",
        "form_template_id": form_template["id"],
        "form_classification_id": form_classification["id"],
        "patient_id": patient_id,
        "date_created": 1561011126,
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
                "id": None,
                "category_index": None,
                "question_index": 1,
                "question_text": "Info",
                "question_type": "CATEGORY",
                "required": True,
            },
        ],
    }


@pytest.fixture
def form_template_v2_payload():
    def _make(extra_questions=None, overrides=None):
        base = {
            "version": 1,
            "classification": {
                "name": {"english": "Vitals Form"},
            },
            "questions": [
                {
                    "question_type": QuestionTypeEnum.CATEGORY.value,
                    "order": 0,
                    "required": False,
                    "question_text": {"english": "Vitals"},
                    "mc_options": [],
                },
                {
                    "question_type": QuestionTypeEnum.INTEGER.value,
                    "order": 1,
                    "required": True,
                    "question_text": {"english": "Heart rate"},
                    "num_min": 0,
                    "num_max": 300,
                    "category_index": 0,
                    "user_question_id": "heart_rate",
                    "mc_options": [],
                },
            ],
        }

        # Add new questions if provided
        if extra_questions:
            base["questions"].extend(extra_questions)

        # Apply overrides to any top-level field
        if overrides:
            base.update(overrides)

        return base

    return _make


@pytest.fixture
def form_submission_v2(patient_id, vht_user_id):
    def _make(template_id, template_question_id, extra_answers=None):
        base = {
            "patient_id": patient_id,
            "user_id": vht_user_id,
            "lang": "English",
            "form_template_id": template_id,
            "answers": [
                {
                    "question_id": template_question_id,
                    "answer": {"number": 90},
                }
            ],
        }

        # Add new answers if provided
        if extra_answers:
            base["answers"].extend(extra_answers)

        return base

    return _make


def _bundle_from_template_response(database, response, payload=None):
    assert response.status_code == 201

    database.session.flush()
    database.session.commit()

    body = decamelize(response.json())
    classification = crud.read(
        FormClassificationOrmV2, id=body["form_classification_id"]
    )
    template = crud.read(FormTemplateOrmV2, id=body["id"])

    return {
        "body": body,
        "payload": payload,
        "classification": classification,
        "template": template,
        "lang_ids": _collect_form_v2_lang_version_ids(classification, template),
    }


def _collect_form_v2_lang_version_ids(classification, template):
    lang_ids = [classification.name_string_id]
    for question in template.questions:
        lang_ids.append(question.question_string_id)
    return lang_ids


def _cleanup_form_v2_resources(
    *,
    template_ids=None,
    classification_ids=None,
    lang_ids=None,
    submission_ids=None,
):
    for submission_id in submission_ids or []:
        crud.delete_all(FormAnswerOrmV2, form_submission_id=submission_id)
        crud.delete_all(FormSubmissionOrmV2, id=submission_id)

    for template_id in template_ids or []:
        crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=template_id)
        crud.delete_all(FormTemplateOrmV2, id=template_id)

    for classification_id in classification_ids or []:
        crud.delete_all(FormClassificationOrmV2, id=classification_id)

    for string_id in lang_ids or []:
        crud.delete_all(LangVersionOrmV2, string_id=string_id)


def _create_form_template_v2(
    database,
    api_post,
    form_template_v2_payload,
    **payload_kwargs,
):
    payload = form_template_v2_payload(**payload_kwargs)
    response = api_post(endpoint="/api/forms/v2/templates/body", json=payload)
    assert response.status_code == 201

    database.session.flush()
    database.session.commit()

    body = decamelize(response.json())
    classification = crud.read(
        FormClassificationOrmV2, id=body["form_classification_id"]
    )
    template = crud.read(FormTemplateOrmV2, id=body["id"])

    return {
        "body": body,
        "payload": payload,
        "classification": classification,
        "template": template,
        "lang_ids": _collect_form_v2_lang_version_ids(classification, template),
    }


def _track_form_template_v2(state, template_bundle):
    body = template_bundle["body"]
    state["template_ids"].append(body["id"])
    if body["form_classification_id"] not in state["classification_ids"]:
        state["classification_ids"].append(body["form_classification_id"])
    for lang_id in template_bundle["lang_ids"]:
        if lang_id not in state["lang_ids"]:
            state["lang_ids"].append(lang_id)


def _create_form_submission_v2_record(
    database,
    api_post,
    form_submission_v2,
    template_bundle,
    *,
    extra_answers=None,
    submission_id=None,
    patient_id=None,
    template_question_id=None,
):
    template = template_bundle["template"]
    question_id = template_question_id or next(
        question.id for question in template.questions if question.order == 1
    )
    submission_payload = form_submission_v2(
        template_id=template_bundle["body"]["id"],
        template_question_id=question_id,
        extra_answers=extra_answers,
    )
    if submission_id is not None:
        submission_payload["id"] = submission_id
    if patient_id is not None:
        submission_payload["patient_id"] = patient_id

    response = api_post(endpoint="/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 201

    database.session.flush()
    database.session.commit()

    return decamelize(response.json())


@pytest.fixture
def form_v2_resources(database, api_post, form_template_v2_payload, form_submission_v2):
    """
    Factory fixture for form v2 templates and submissions with guaranteed teardown.

    Usage:
        bundle = form_v2_resources.create_template(extra_questions=[...])
        submission = form_v2_resources.create_submission(bundle)
    """
    state = {
        "template_ids": [],
        "classification_ids": [],
        "lang_ids": [],
        "submission_ids": [],
    }

    def create_template(**payload_kwargs):
        template_bundle = _create_form_template_v2(
            database,
            api_post,
            form_template_v2_payload,
            **payload_kwargs,
        )
        _track_form_template_v2(state, template_bundle)
        return template_bundle

    def create_template_from_payload(payload):
        response = api_post(endpoint="/api/forms/v2/templates/body", json=payload)
        template_bundle = _bundle_from_template_response(database, response, payload)
        _track_form_template_v2(state, template_bundle)
        return template_bundle

    def create_template_version(template_bundle, *, version, **payload_kwargs):
        v1 = template_bundle
        overrides = {
            "id": v1["body"]["id"],
            "version": version,
            "classification": {
                "id": v1["body"]["form_classification_id"],
                "name": v1["payload"]["classification"]["name"],
            },
        }
        if "overrides" in payload_kwargs:
            overrides.update(payload_kwargs.pop("overrides"))
        return create_template(overrides=overrides, **payload_kwargs)

    def create_submission(
        template_bundle,
        *,
        extra_answers=None,
        submission_id=None,
        patient_id=None,
        template_question_id=None,
    ):
        submission = _create_form_submission_v2_record(
            database,
            api_post,
            form_submission_v2,
            template_bundle,
            extra_answers=extra_answers,
            submission_id=submission_id,
            patient_id=patient_id,
            template_question_id=template_question_id,
        )
        state["submission_ids"].append(submission["id"])
        return submission

    def track_submission(submission_id):
        state["submission_ids"].append(submission_id)

    yield SimpleNamespace(
        create_template=create_template,
        create_template_from_payload=create_template_from_payload,
        create_template_version=create_template_version,
        create_submission=create_submission,
        track_submission=track_submission,
        state=state,
    )

    _cleanup_form_v2_resources(
        template_ids=state["template_ids"],
        classification_ids=state["classification_ids"],
        lang_ids=state["lang_ids"],
        submission_ids=state["submission_ids"],
    )


@pytest.fixture
def form_classification_v2_resources(database, api_post):
    """Factory fixture for form v2 classifications with guaranteed teardown."""
    state = {
        "classification_ids": [],
        "lang_ids": [],
    }

    def create(payload):
        response = api_post(endpoint="/api/forms/v2/classifications", json=payload)
        assert response.status_code == 201
        database.session.commit()
        body = decamelize(response.json())
        state["classification_ids"].append(body["id"])
        state["lang_ids"].append(body["name_string_id"])
        return body

    yield SimpleNamespace(create=create, state=state)

    _cleanup_form_v2_resources(
        classification_ids=state["classification_ids"],
        lang_ids=state["lang_ids"],
    )


# TODO: Same as fixture in tests/service/workflow/conftest.py. May want to put unit tests
#       and system tests under a common "tests" folder so fixtures like this can be shared
#       inside a common conftest.py file instead of duplicated.
@pytest.fixture
def sequential_workflow_template() -> WorkflowTemplateModel:
    step_template_1_id = "st-1"
    step_template_2_id = "st-2"
    workflow_template_id = "wt-1"

    template_step_1 = helpers.make_workflow_template_step(
        id=step_template_1_id,
        workflow_template_id=workflow_template_id,
        branches=[
            helpers.make_workflow_template_branch(
                id="b-1", step_id=step_template_1_id, target_step_id=step_template_2_id
            )
        ],
    )
    template_step_2 = helpers.make_workflow_template_step(
        id=step_template_2_id,
        workflow_template_id=workflow_template_id,
    )
    template_workflow = helpers.make_workflow_template(
        id=workflow_template_id,
        starting_step_id=step_template_1_id,
        steps=[template_step_1, template_step_2],
    )
    return WorkflowTemplateModel(**template_workflow)


@pytest.fixture
def sequential_workflow_instance(sequential_workflow_template) -> WorkflowInstanceModel:
    """Initial workflow instance"""
    workflow_instance = WorkflowService.generate_workflow_instance(
        sequential_workflow_template
    )

    workflow_instance.steps[0].id = "si-1"

    return workflow_instance


@pytest.fixture
def sequential_workflow_view(
    sequential_workflow_template, sequential_workflow_instance
) -> WorkflowView:
    return WorkflowView(sequential_workflow_template, sequential_workflow_instance)


@pytest.fixture
def sequential_workflow_view_with_db(sequential_workflow_view, patient_id):
    """
    Fixture that takes the sequential_workflow_view, inserts it into the DB,
    and cleans up after the test.
    """
    # NOTE: This workflow template and instance use hardcoded IDs. Easy to reference
    #       step IDs in the test, but can make test cleanup more fragile. Consider
    #       using randomly generated IDs?
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = patient_id

    # Setup
    WorkflowService.upsert_workflow_template(workflow_view.template)
    WorkflowService.upsert_workflow_instance(workflow_view.instance)

    yield workflow_view

    # Teardown
    crud.delete_workflow(
        m=WorkflowTemplateOrm,
        delete_classification=True,
        id=workflow_view.template.id,
    )
    crud.delete_workflow(
        m=WorkflowInstanceOrm,
        id=workflow_view.instance.id,
    )


@pytest.fixture
def form_with_db(database, api_post, form_template_v2_payload, form_submission_v2):
    template_bundle = _create_form_template_v2(
        database, api_post, form_template_v2_payload
    )
    body = template_bundle["body"]

    submission = _create_form_submission_v2_record(
        database,
        api_post,
        form_submission_v2,
        template_bundle,
    )
    submission_id = submission["id"]

    yield submission

    _cleanup_form_v2_resources(
        template_ids=[body["id"]],
        classification_ids=[body["form_classification_id"]],
        lang_ids=template_bundle["lang_ids"],
        submission_ids=[submission_id],
    )


@pytest.fixture
def form_template_with_db(database, api_post, form_template_v2_payload):
    template_bundle = _create_form_template_v2(
        database, api_post, form_template_v2_payload
    )
    body = template_bundle["body"]

    yield body

    _cleanup_form_v2_resources(
        template_ids=[body["id"]],
        classification_ids=[body["form_classification_id"]],
        lang_ids=template_bundle["lang_ids"],
    )
