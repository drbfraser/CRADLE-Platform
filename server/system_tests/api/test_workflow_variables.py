import pytest


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "is_associated_patient, expected_status", [(True, 200), (False, 403)]
)
def test_resolve_workflow_variables_requires_patient_access(
    create_patient, patient_id, api_post, is_associated_patient, expected_status
):
    create_patient()
    target_patient_id = "49300028162" if is_associated_patient else patient_id

    response = api_post(
        endpoint="/api/workflow/variables/resolve",
        json={
            "rule": '{"<=": [{"var": "patient.age"}, 30]}',
            "patient_id": target_patient_id,
        },
    )

    assert response.status_code == expected_status
