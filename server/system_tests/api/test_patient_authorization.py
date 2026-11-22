import time

import pytest
from humps import camelize

import data.db_operations as crud
from data import orm_serializer
from models import (
    AssessmentOrm,
    FormSubmissionOrmV2,
    HealthFacilityOrm,
    PatientAssociationsOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
)

UNAUTHORIZED_PREGNANCY_ID = 602000001


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_associated_vht_can_access_patient(api_get):
    response = api_get(endpoint="/api/patients/49300028162/info")

    assert response.status_code == 200


@pytest.mark.parametrize(
    "credentials",
    [
        ("hcw@email.com", "cradle-hcw"),
        ("cho@email.com", "cradle-cho"),
    ],
    ids=["hcw", "cho"],
)
def test_hcw_and_cho_can_access_unassociated_patient(api_get):
    response = api_get(endpoint="/api/patients/49300028161/info")

    assert response.status_code == 200


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/patients/49300028161/info",
        "/api/patients/49300028161/pregnancies",
        "/api/patients/49300028161/medical_records",
        "/api/mobile/forms/49300028161/dt9",
    ],
    ids=["patient", "pregnancy", "medical-record", "mobile-form"],
)
def test_unassociated_vht_cannot_access_direct_patient_routes(api_get, endpoint):
    response = api_get(endpoint=endpoint)

    assert response.status_code == 403


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "method, suffix",
    [
        ("PUT", "info"),
        ("GET", "readings"),
        ("GET", "most_recent_reading"),
        ("GET", "referrals"),
        ("GET", "forms"),
        ("GET", "get_all_records"),
    ],
    ids=[
        "update-info",
        "readings",
        "most-recent-reading",
        "referrals",
        "forms",
        "all-records",
    ],
)
def test_unassociated_vht_cannot_access_patient_data(
    patient_factory, patient_info, api_get, api_put, method, suffix
):
    patient = patient_factory.create(**patient_info, last_edited=5)
    crud.db_session.refresh(patient)
    original_patient = orm_serializer.marshal(patient, shallow=True)
    endpoint = f"/api/patients/{patient.id}/{suffix}"

    if method == "PUT":
        response = api_put(
            endpoint=endpoint,
            json={**patient_info, "name": "Unauthorized change"},
        )
    else:
        response = api_get(endpoint=endpoint)

    assert response.status_code == 403
    if method == "PUT":
        crud.db_session.refresh(patient)
        assert orm_serializer.marshal(patient, shallow=True) == original_patient


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_vht_patient_list_matches_direct_access(api_get):
    response = api_get(endpoint="/api/patients?search=4930002816")

    assert response.status_code == 200
    patient_ids = {patient["id"] for patient in response.json()}
    assert "49300028162" in patient_ids
    assert "49300028161" not in patient_ids


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_unassociated_vht_cannot_create_pregnancy(api_post):
    try:
        response = api_post(
            endpoint="/api/patients/49300028161/pregnancies",
            json={
                "id": UNAUTHORIZED_PREGNANCY_ID,
                "patient_id": "49300028161",
                "start_date": 1500000000,
            },
        )

        assert response.status_code == 403
        assert crud.read(PregnancyOrm, id=UNAUTHORIZED_PREGNANCY_ID) is None
    finally:
        crud.delete_by(PregnancyOrm, id=UNAUTHORIZED_PREGNANCY_ID)


READING_ID = "sec08-reading"
REFERRAL_ID = "sec08-referral"
ASSESSMENT_ID = "sec08-assessment"
NEW_RECORD_ID = "sec08-new-record"
ASSOCIATED_PATIENT_ID = "49300028162"
OTHER_PATIENT_ID = "87356709249"
FACILITY_NAME = "H0000"


@pytest.fixture
def clinical_records(
    patient_factory,
    patient_info,
    reading_factory,
    referral_factory,
    followup_factory,
):
    patient = patient_factory.create(**patient_info)
    patient_factory.create(id=OTHER_PATIENT_ID)
    reading_factory.create(id=READING_ID, patient_id=patient.id)
    referral_factory.create(id=REFERRAL_ID, patient_id=patient.id)
    followup_factory.create(
        id=ASSESSMENT_ID, patient_id=patient.id, follow_up_needed=False
    )
    return patient


def _assessment_body(patient_id):
    return {
        "id": ASSESSMENT_ID,
        "patient_id": patient_id,
        "diagnosis": "Unauthorized change",
        "follow_up_needed": False,
        "healthcare_worker_id": 1,
    }


def _saved_record(model, record_id):
    crud.db_session.rollback()
    record = crud.read(model, id=record_id)
    return None if record is None else orm_serializer.marshal(record, shallow=True)


def _clinical_row_counts(get_row_count):
    crud.db_session.rollback()
    facility = crud.read(HealthFacilityOrm, name=FACILITY_NAME)
    return {
        "readings": get_row_count(ReadingOrm),
        "referrals": get_row_count(ReferralOrm),
        "assessments": get_row_count(AssessmentOrm),
        "associations": get_row_count(PatientAssociationsOrm),
        "facility_new_referrals": facility.new_referrals,
    }


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "endpoint",
    [
        f"/api/readings/{READING_ID}",
        f"/api/referrals/{REFERRAL_ID}",
        f"/api/assessments/{ASSESSMENT_ID}",
    ],
    ids=["reading", "referral", "assessment"],
)
def test_unassociated_vht_cannot_read_clinical_record(
    clinical_records, api_get, endpoint
):
    response = api_get(endpoint=endpoint)

    assert response.status_code == 403


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "model, record_id, endpoint, body",
    [
        (ReferralOrm, REFERRAL_ID, f"/api/referrals/assess/{REFERRAL_ID}", None),
        (
            ReferralOrm,
            REFERRAL_ID,
            f"/api/referrals/cancel-status-switch/{REFERRAL_ID}",
            {"is_cancelled": True, "cancel_reason": "Unauthorized change"},
        ),
        (
            ReferralOrm,
            REFERRAL_ID,
            f"/api/referrals/not-attend/{REFERRAL_ID}",
            {"not_attend_reason": "Unauthorized change"},
        ),
        (AssessmentOrm, ASSESSMENT_ID, f"/api/assessments/{ASSESSMENT_ID}", "update"),
    ],
    ids=["assess-referral", "cancel-referral", "not-attend-referral", "assessment"],
)
def test_unassociated_vht_cannot_change_clinical_record(
    clinical_records, api_put, model, record_id, endpoint, body
):
    if body == "update":
        body = _assessment_body(clinical_records.id)
    original_record = _saved_record(model, record_id)

    response = api_put(endpoint=endpoint, json=body)

    assert response.status_code == 403
    assert _saved_record(model, record_id) == original_record


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "endpoint, body",
    [
        (
            "/api/readings",
            {
                "id": NEW_RECORD_ID,
                "systolic_blood_pressure": 110,
                "diastolic_blood_pressure": 80,
                "heart_rate": 70,
            },
        ),
        (
            "/api/readings",
            {
                "id": NEW_RECORD_ID,
                "systolic_blood_pressure": 110,
                "diastolic_blood_pressure": 80,
                "heart_rate": 70,
                "referral": {
                    "id": NEW_RECORD_ID,
                    "health_facility_name": FACILITY_NAME,
                },
            },
        ),
        (
            "/api/referrals",
            {"id": NEW_RECORD_ID, "health_facility_name": FACILITY_NAME},
        ),
        (
            "/api/assessments",
            {"id": NEW_RECORD_ID, "follow_up_needed": False},
        ),
    ],
    ids=["reading", "reading-with-referral", "referral", "assessment"],
)
def test_unassociated_vht_cannot_create_clinical_record(
    clinical_records, get_row_count, api_post, endpoint, body
):
    body = {**body, "patient_id": clinical_records.id}
    if "referral" in body:
        body["referral"] = {**body["referral"], "patient_id": clinical_records.id}
    original_counts = _clinical_row_counts(get_row_count)

    response = api_post(endpoint=endpoint, json=body)

    assert response.status_code == 403
    assert _clinical_row_counts(get_row_count) == original_counts


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_vht_assessment_list_is_scoped(clinical_records, followup_factory, api_get):
    followup_factory.create(
        id=NEW_RECORD_ID, patient_id=ASSOCIATED_PATIENT_ID, follow_up_needed=False
    )

    response = api_get(endpoint="/api/assessments")

    assert response.status_code == 200
    assessment_ids = {assessment["id"] for assessment in response.json()}
    assert NEW_RECORD_ID in assessment_ids
    assert ASSESSMENT_ID not in assessment_ids


def test_new_reading_referral_must_match_reading_patient(
    clinical_records, get_row_count, api_post
):
    original_counts = _clinical_row_counts(get_row_count)

    response = api_post(
        endpoint="/api/readings",
        json={
            "id": NEW_RECORD_ID,
            "patient_id": clinical_records.id,
            "systolic_blood_pressure": 110,
            "diastolic_blood_pressure": 80,
            "heart_rate": 70,
            "referral": {
                "id": NEW_RECORD_ID,
                "patient_id": OTHER_PATIENT_ID,
                "health_facility_name": FACILITY_NAME,
            },
        },
    )

    assert response.status_code == 400
    assert _clinical_row_counts(get_row_count) == original_counts


def test_assessment_update_cannot_change_patient(clinical_records, api_put):
    original_assessment = _saved_record(AssessmentOrm, ASSESSMENT_ID)

    response = api_put(
        endpoint=f"/api/assessments/{ASSESSMENT_ID}",
        json=_assessment_body(OTHER_PATIENT_ID),
    )

    assert response.status_code == 400
    assert _saved_record(AssessmentOrm, ASSESSMENT_ID) == original_assessment


SYNCED_RECORD_ID = "sec09-synced-record"
MISSING_PATIENT_RECORD_ID = "sec09-missing-patient-record"
NEW_WORKFLOW_INSTANCE_ID = "sec09-workflow-instance"


def _sync_reading(record_id, patient_id):
    return {
        "id": record_id,
        "patient_id": patient_id,
        "systolic_blood_pressure": 110,
        "diastolic_blood_pressure": 80,
        "heart_rate": 70,
    }


def _sync_referral(record_id, patient_id):
    return {
        "id": record_id,
        "patient_id": patient_id,
        "health_facility_name": FACILITY_NAME,
    }


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "resource, model, make_record, error_id_key",
    [
        ("readings", ReadingOrm, _sync_reading, "readingId"),
        ("referrals", ReferralOrm, _sync_referral, "referralId"),
    ],
    ids=["readings", "referrals"],
)
def test_sync_reports_rejected_patient_uploads(
    clinical_records, api_post, resource, model, make_record, error_id_key
):
    endpoint = f"/api/sync/{resource}?since=0"
    accepted_record = make_record(SYNCED_RECORD_ID, ASSOCIATED_PATIENT_ID)
    try:
        response = api_post(
            endpoint=endpoint,
            json=[
                make_record(NEW_RECORD_ID, clinical_records.id),
                make_record(MISSING_PATIENT_RECORD_ID, "00000000000"),
                accepted_record,
            ],
        )

        assert response.status_code == 207
        result = response.json()
        assert result["errors"] == [
            {
                error_id_key: record_id,
                "errors": "Patient is missing or you do not have access.",
            }
            for record_id in (NEW_RECORD_ID, MISSING_PATIENT_RECORD_ID)
        ]
        assert SYNCED_RECORD_ID in {record["id"] for record in result[resource]}
        assert _saved_record(model, NEW_RECORD_ID) is None
        assert _saved_record(model, MISSING_PATIENT_RECORD_ID) is None
        assert _saved_record(model, SYNCED_RECORD_ID) is not None

        response = api_post(endpoint=endpoint, json=[accepted_record])

        assert response.status_code == 200
        assert response.json().keys() == {resource}
    finally:
        crud.delete_by(model, id=NEW_RECORD_ID)
        crud.delete_by(model, id=MISSING_PATIENT_RECORD_ID)
        crud.delete_by(model, id=SYNCED_RECORD_ID)


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_reading_sync_cannot_update_another_patient_reading(clinical_records, api_post):
    original_reading = _saved_record(ReadingOrm, READING_ID)
    since = int(time.time()) + 60

    response = api_post(
        endpoint=f"/api/sync/readings?since={since}",
        json=[
            {
                **_sync_reading(READING_ID, ASSOCIATED_PATIENT_ID),
                "date_retest_needed": 1700000000,
            }
        ],
    )

    assert response.status_code == 207
    result = response.json()
    assert result["errors"] == [
        {
            "readingId": READING_ID,
            "errors": "This reading cannot be synced for this patient.",
        }
    ]
    assert result["readings"] == []
    assert _saved_record(ReadingOrm, READING_ID) == original_reading


def _new_workflow_instance_upload(instance):
    return {**instance.model_dump(), "id": NEW_WORKFLOW_INSTANCE_ID, "steps": []}


def _patient_change_upload(instance):
    return {**instance.model_dump(), "patient_id": OTHER_PATIENT_ID}


def _foreign_step_upload(instance):
    step = {
        **instance.steps[0].model_dump(),
        "workflow_instance_id": NEW_WORKFLOW_INSTANCE_ID,
    }
    return {**instance.model_dump(), "id": NEW_WORKFLOW_INSTANCE_ID, "steps": [step]}


def _foreign_current_step_upload(instance):
    return {
        **_new_workflow_instance_upload(instance),
        "current_step_id": instance.steps[0].id,
    }


@pytest.mark.parametrize(
    "credentials, make_upload",
    [
        (("vht@email.com", "cradle-vht"), _new_workflow_instance_upload),
        (("admin@email.com", "cradle-admin"), _patient_change_upload),
        (("admin@email.com", "cradle-admin"), _foreign_step_upload),
        (("admin@email.com", "cradle-admin"), _foreign_current_step_upload),
    ],
    ids=[
        "unassociated-vht",
        "patient-change",
        "step-from-other-instance",
        "current-step-from-other-instance",
    ],
)
def test_workflow_instance_sync_rejects_unauthorized_upload(
    clinical_records, sequential_workflow_view_with_db, api_post, make_upload
):
    instance = sequential_workflow_view_with_db.instance
    step_id = instance.steps[0].id
    original_instance = _saved_record(WorkflowInstanceOrm, instance.id)
    original_step = _saved_record(WorkflowInstanceStepOrm, step_id)
    upload = make_upload(instance)

    try:
        response = api_post(
            endpoint="/api/sync/workflow_instances?since=0", json=[upload]
        )

        assert response.status_code == 207
        errors = response.json()["errors"]
        assert [error["workflowInstanceId"] for error in errors] == [upload["id"]]
        assert _saved_record(WorkflowInstanceOrm, NEW_WORKFLOW_INSTANCE_ID) is None
        assert _saved_record(WorkflowInstanceOrm, instance.id) == original_instance
        assert _saved_record(WorkflowInstanceStepOrm, step_id) == original_step
    finally:
        crud.delete_workflow(m=WorkflowInstanceOrm, id=NEW_WORKFLOW_INSTANCE_ID)


def test_sync_workflow_progress_preserves_saved_fields(
    clinical_records, sequential_workflow_view_with_db, form_v2_resources, api_post
):
    instance = sequential_workflow_view_with_db.instance
    step = instance.steps[0]
    template = form_v2_resources.create_template()
    form = form_v2_resources.create_submission(template, patient_id=instance.patient_id)
    start_date = int(time.time()) - 60
    completion_date = start_date + 30
    saved = crud.read(WorkflowInstanceOrm, id=instance.id)
    saved.start_date = start_date
    saved.status = "Active"
    saved.current_step_id = step.id
    saved.last_edited = start_date
    saved.steps[0].start_date = start_date
    saved.steps[0].status = "Active"
    saved.steps[0].form_id = form["id"]
    crud.db_session.commit()
    upload = camelize(
        instance.model_dump(exclude={"steps", "last_edited", "pregnancy_id", "lang"})
    )
    upload.update(
        status="Completed",
        startDate=start_date - 1,
        completionDate=completion_date,
        currentStepId=step.id,
        steps=[
            {
                "id": step.id,
                "workflowInstanceId": instance.id,
                "workflowTemplateStepId": step.workflow_template_step_id,
                "name": step.name,
                "description": step.description,
                "status": "Completed",
                "startDate": start_date - 1,
                "completionDate": completion_date,
            }
        ],
    )

    endpoint = f"/api/sync/workflow_instances?since={start_date}"
    response = api_post(
        endpoint=endpoint, json=[{**upload, "status": "Active", "completionDate": None}]
    )
    assert response.status_code == 200
    synced = next(
        (
            workflow
            for workflow in response.json()["workflowInstances"]
            if workflow["id"] == instance.id
        ),
        None,
    )
    assert synced is not None
    assert synced["steps"][0]["completionDate"] == completion_date

    response = api_post(endpoint=endpoint, json=[upload])
    assert response.status_code == 200
    crud.db_session.rollback()
    assert saved.start_date == saved.steps[0].start_date == start_date
    assert saved.completion_date == saved.steps[0].completion_date == completion_date
    assert saved.steps[0].form_id == form["id"]

    response = api_post(
        endpoint=endpoint, json=[{**upload, "status": "Active"}, upload]
    )
    assert response.status_code == 207
    assert len(response.json()["errors"]) == 1
    crud.db_session.rollback()
    assert saved.status == "Completed"


@pytest.mark.parametrize("form_field", ["form", "form_id"])
def test_workflow_sync_rejects_form_writes(
    clinical_records,
    sequential_workflow_view_with_db,
    form_v2_resources,
    api_post,
    form_field,
):
    instance = sequential_workflow_view_with_db.instance
    template = form_v2_resources.create_template()
    form = form_v2_resources.create_submission(template, patient_id=instance.patient_id)
    step_id = instance.steps[0].id
    original_step = _saved_record(WorkflowInstanceStepOrm, step_id)
    original_form = _saved_record(FormSubmissionOrmV2, form["id"])
    upload = instance.model_dump()
    upload["steps"][0][form_field] = (
        form["id"] if form_field == "form_id" else {**original_form, "lang": "French"}
    )

    response = api_post(endpoint="/api/sync/workflow_instances?since=0", json=[upload])

    assert response.status_code == 207
    assert _saved_record(WorkflowInstanceStepOrm, step_id) == original_step
    assert _saved_record(FormSubmissionOrmV2, form["id"]) == original_form


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_vht_global_search_is_scoped(api_get):
    response = api_get(endpoint="/api/patients/global/4930002816")

    assert response.status_code == 200
    patient_ids = {patient["id"] for patient in response.json()}
    assert "49300028162" in patient_ids
    assert "49300028161" not in patient_ids
