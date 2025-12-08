from common.commonUtil import get_current_time, get_uuid
from models import (
    FormClassificationOrm,
    FormOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    UrineTestOrm,
)

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
        "name": "Test Workflow",
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
        "name": "Test Step",
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


def make_patient_orm(**overrides) -> PatientOrm:
    p = PatientOrm()

    p.id = overrides.pop("id", get_uuid())
    p.date_created = overrides.pop("date_created", TIMESTAMP_TODAY)
    p.last_edited = overrides.pop("last_edited", TIMESTAMP_TODAY)

    p.name = overrides.pop("name", "Test Patient")
    p.sex = overrides.pop("sex", None)
    p.is_pregnant = overrides.pop("is_pregnant", False)

    p.readings = overrides.pop("readings", [])
    p.referrals = overrides.pop("referrals", [])
    p.assessments = overrides.pop("assessments", [])

    for key, value in overrides.items():
        setattr(p, key, value)

    return p


def make_reading_orm(**overrides) -> ReadingOrm:
    r = ReadingOrm()

    r.id = overrides.pop("id", get_uuid())
    r.date_taken = overrides.pop("date_taken", TIMESTAMP_TODAY)
    r.date_retest_needed = overrides.pop("date_retest_needed", None)

    r.symptoms = overrides.pop("symptoms", "")

    r.urine_tests = overrides.pop("urine_tests", None)

    for key, value in overrides.items():
        setattr(r, key, value)

    return r


def make_urine_test_orm(**overrides) -> UrineTestOrm:
    u = UrineTestOrm()

    u.id = overrides.pop("id", 1)
    u.leukocytes = overrides.pop("leukocytes", None)
    u.nitrites = overrides.pop("nitrites", None)
    u.glucose = overrides.pop("glucose", None)
    u.protein = overrides.pop("protein", None)
    u.blood = overrides.pop("blood", None)

    u.reading = overrides.pop("reading", None)

    for key, value in overrides.items():
        setattr(u, key, value)

    return u


def make_pregnancy_orm(**overrides) -> PregnancyOrm:
    p = PregnancyOrm()

    p.id = overrides.pop("id", 1)
    p.patient_id = overrides.pop("patient_id", get_uuid())
    p.start_date = overrides.pop("start_date", TIMESTAMP_TODAY)
    p.end_date = overrides.pop("end_date", None)
    p.outcome = overrides.pop("outcome", None)
    p.last_edited = overrides.pop("last_edited", TIMESTAMP_TODAY)

    for key, value in overrides.items():
        setattr(p, key, value)

    return p


def make_medical_record_orm(**overrides) -> MedicalRecordOrm:
    mr = MedicalRecordOrm()

    mr.id = overrides.pop("id", None)
    mr.patient_id = overrides.pop("patient_id", get_uuid())
    mr.information = overrides.pop("information", "Test medical record")
    mr.is_drug_record = overrides.pop("is_drug_record", False)
    mr.date_created = overrides.pop("date_created", TIMESTAMP_TODAY)
    mr.last_edited = overrides.pop("last_edited", TIMESTAMP_TODAY)

    for key, value in overrides.items():
        setattr(mr, key, value)

    return mr


def make_form_classification_orm(**overrides) -> FormClassificationOrm:
    fc = FormClassificationOrm()
    fc.id = overrides.pop("id", get_uuid())
    fc.name = overrides.pop("name", "Test Classification")

    for key, value in overrides.items():
        setattr(fc, key, value)

    return fc


def make_form_orm(**overrides) -> FormOrm:
    f = FormOrm()

    f.id = overrides.pop("id", get_uuid())
    f.lang = overrides.pop("lang", "en")
    f.name = overrides.pop("name", "Test Form")
    f.category = overrides.pop("category", "testing")
    f.date_created = overrides.pop("date_created", TIMESTAMP_TODAY)
    f.last_edited = overrides.pop("last_edited", TIMESTAMP_TODAY)

    classification = overrides.pop("classification", None)
    if classification is None:
        classification = make_form_classification_orm()
    f.classification = classification

    # Relationships
    f.patient = overrides.pop("patient", None)
    f.questions = overrides.pop("questions", [])

    for key, value in overrides.items():
        setattr(f, key, value)

    return f
