from common.commonUtil import get_current_time, get_uuid
from enums import TrafficLightEnum

TIMESTAMP_TODAY = get_current_time()
TIMESTAMP_TOMORROW = get_current_time() + 86400
TIMESTAMP_YESTERDAY = get_current_time() - 86400


def assert_is_recent_timestamp(timestamp: int):
    """
    Assert that the given timestamp is a time roughly around 'now'.
    Useful in tests to verify that a timestamp field is being set to the current time.
    """
    assert (
        TIMESTAMP_YESTERDAY < timestamp < TIMESTAMP_TOMORROW
    ), f"Expected timestamp near 'now', but got {timestamp}"


def make_workflow_template(**overrides):
    base = {
        "id": get_uuid(),
        "description": "This is a workflow template for testing.",
        "archived": False,
        "starting_step_id": None,
        "date_created": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TODAY,
        "version": "0",
        "steps": [],
    }
    return {**base, **overrides}


def make_workflow_template_step(**overrides):
    base = {
        "id": get_uuid(),
        "name": {"English": "Test Step"},
        "description": "This is a workflow template step for testing.",
        "workflow_template_id": None,
        "last_edited": TIMESTAMP_TODAY,
        "expected_completion": TIMESTAMP_TOMORROW,
        "form_id": None,
        "form": None,
        "branches": [],
    }
    return {**base, **overrides}


def make_workflow_template_branch(**overrides):
    base = {
        "id": get_uuid(),
        "target_step_id": None,
        "step_id": None,
        "condition_id": None,
        "condition": None,
    }
    return {**base, **overrides}


def make_workflow_instance(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Workflow",
        "description": "This is a workflow instance for testing.",
        "start_date": TIMESTAMP_TODAY,
        "current_step_id": None,
        "last_edited": TIMESTAMP_TODAY,
        "completion_date": TIMESTAMP_TOMORROW,
        "status": "Active",
        "workflow_template_id": None,
        "patient_id": None,
        "steps": [],
    }
    return {**base, **overrides}


def make_workflow_instance_step(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Step",
        "description": "This is a workflow instance step for testing.",
        "start_date": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TODAY,
        "assigned_to": None,
        "completion_date": TIMESTAMP_TOMORROW,
        "expected_completion": TIMESTAMP_TOMORROW,
        "status": "Active",
        "data": None,
        "form_id": None,
        "form": None,
        "workflow_instance_id": None,
    }
    return {**base, **overrides}


def make_question(**overrides) -> dict:
    base = {
        "id": get_uuid(),
        "question_index": 0,
        "question_text": "Q?",
        "question_type": "STRING",
        "visible_condition": None,
        "mc_options": [],
        "answers": None,
        "lang_versions": None,
    }
    return {**base, **overrides}


def make_question_lang_version(**overrides) -> dict:
    base = {
        "question_id": "q-abc",
        "lang": "en",
        "question_text": "Localized text",
        "mc_options": [],
    }
    return {**base, **overrides}


def make_form(**overrides) -> dict:
    base = {
        "id": get_uuid(),
        "lang": "en",
        "name": "Vitals",
        "category": "screening",
        "patient_id": "p-001",
        "last_edited": 1_600_000_000,
        "questions": [],
    }
    return {**base, **overrides}


def make_form_template(**overrides) -> dict:
    base = {
        "id": get_uuid(),
        "version": "v1",
        "archived": False,
        "form_classification_id": "fc-001",
        "questions": [],
    }
    return {**base, **overrides}


def make_patient(**overrides) -> dict:
    payload = {
        "id": get_uuid(),
        "name": "Mary Brown",
        "sex": "FEMALE",
        "is_pregnant": False,
        "medical_history": "Asthma",
        "drug_history": "Tylenol 300mg",
        "allergy": "Peanuts",
        "zone": "1",
        "date_of_birth": "1998-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "3",
        "household_number": "1",
        "date_created": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_YESTERDAY,
        "is_archived": False,
    }
    return {**payload, **overrides}


def make_pregnancy(**overrides):
    base = {
        "id": get_uuid(),
        "start_date": TIMESTAMP_TODAY,
        "end_date": None,
        "outcome": None,
        "patient_id": "pat-1",
        "last_edited": TIMESTAMP_TODAY,
    }
    return {**base, **overrides}


def make_reading(**overrides) -> dict:
    base = {
        "id": get_uuid(),
        "systolic_blood_pressure": 120,
        "diastolic_blood_pressure": 80,
        "heart_rate": 80,
        "symptoms": None,
        "traffic_light_status": TrafficLightEnum.GREEN,
        "date_taken": TIMESTAMP_TODAY,
        "date_retest_needed": None,
        "retest_of_previous_reading_ids": None,
        "is_flagged_for_follow_up": None,
        "last_edited": TIMESTAMP_TODAY,
        "user_id": 1,
        "patient_id": "p-001",
    }
    return {**base, **overrides}


def make_relay_phone_server_number(**overrides) -> dict:
    base = {
        "id": get_uuid(),
        "phone_number": "+15551234567",
        "description": "Nairobi triage line",
        "last_received": 1_699_999_999,
    }
    return {**base, **overrides}
