import uuid

from humps import decamelize


def test_stats_export_includes_patient_number(
    database, patient_factory, reading_factory, referral_factory, api_get
):
    patient_id = str(uuid.uuid4())
    patient_factory.create(id=patient_id, patient_number="IDN-EXPORT")
    reading_factory.create(id=str(uuid.uuid4()), patient_id=patient_id, user_id=1)
    referral_factory.create(patient_id=patient_id, user_id=1)
    database.session.commit()

    response = api_get(endpoint="/api/stats/export/1")

    assert response.status_code == 200
    rows = [
        row for row in decamelize(response.json()) if row["patient_id"] == patient_id
    ]
    assert rows
    assert all(row["patient_number"] == "IDN-EXPORT" for row in rows)
