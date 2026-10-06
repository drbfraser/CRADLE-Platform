from humps import decamelize

import data.db_operations as crud
from models import ReferralOrm


def test_get_referral_list(
    create_patient,
    create_reading_with_referral,
    api_get,
):
    create_patient()

    facility1 = "H6503"
    user1 = 4706
    date1 = 1610530025
    referral1 = {
        "reading_id": "inujmpkdvjgl9zchcc1k",
        "facility_name": facility1,
        "user_id": user1,
        "date_referred": date1,
        "is_assessed": True,
    }
    create_reading_with_referral(**referral1)

    facility2 = "H6504"
    user2 = 4707
    date2 = 1621434159
    referral2 = {
        "reading_id": "w3d0aklrs4wenm6hk5zc",
        "facility_name": facility2,
        "user_id": user2,
        "date_referred": date2,
        "is_assessed": False,
    }
    create_reading_with_referral(**referral2)

    response = api_get(endpoint="/api/referrals?limit=10000")
    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert any(r["date_referred"] == date2 for r in response_body)

    response = api_get(
        endpoint=f"/api/referrals?limit=10000&health_facilities={facility1}"
    )
    response_body = decamelize(response.json())

    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert not any(r["date_referred"] == date2 for r in response_body)

    response = api_get(
        endpoint=f"/api/referrals?health_facilities={facility1}&health_facilities={facility2}",
    )
    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert any(r["date_referred"] == date2 for r in response_body)

    response = api_get(endpoint=f"/api/referrals??limit=10000&referrers={user1}")

    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert not any(r["date_referred"] == date2 for r in response_body)

    response = api_get(endpoint=f"/api/referrals??limit=10000&date_range=0:{date1}")

    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert not any(r["date_referred"] == date2 for r in response_body)

    response = api_get(endpoint="/api/referrals??limit=10000&is_assessed=1")

    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert any(r["date_referred"] == date1 for r in response_body)
    assert not any(r["date_referred"] == date2 for r in response_body)

    response = api_get(endpoint="/api/referrals??limit=10000&is_pregnant=1")

    response_body = decamelize(response.json())
    assert response.status_code == 200
    assert not any(r["date_referred"] == date1 for r in response_body)
    assert not any(r["date_referred"] == date2 for r in response_body)

    # TODO: Not working.
    # response = api_get(
    #     endpoint=f"/api/referrals?vital_signs={TrafficLightEnum.NONE.value}",
    # )
    # response_body = decamelize(response.json())
    # assert response.status_code == 200
    # assert any(r["date_referred"] == date1 for r in response_body)
    # assert any(r["date_referred"] == date2 for r in response_body)


def test_sync_referrals_returns_unassessed_referral(
    patient_factory, referral_factory, api_post
):
    patient_id = "8732015"
    patient_factory.create(id=patient_id)
    referral = referral_factory.create(patient_id=patient_id)
    assert not referral.is_assessed

    # Ask for everything edited after just before this referral was created,
    # without uploading any referrals.
    response = api_post(
        endpoint=f"/api/sync/referrals?since={referral.last_edited - 1}", json=[]
    )
    assert response.status_code == 200
    referral_ids = [r["id"] for r in response.json()["referrals"]]
    assert referral.id in referral_ids


def test_create_referral_to_new_facility_returns_referral(
    patient_factory, facility_factory, api_post
):
    patient_id = "8732016"
    facility_name = "H8732"
    patient_factory.create(id=patient_id)
    # A fresh facility guarantees the patient is not yet associated with it, so
    # creating the referral also creates the association (which commits).
    facility_factory.create(name=facility_name)

    referral_json = {
        "patient_id": patient_id,
        "health_facility_name": facility_name,
        "comment": "test referral",
    }
    response = api_post(endpoint="/api/referrals", json=referral_json)
    response_body = decamelize(response.json())

    try:
        assert response.status_code == 201
        assert response_body["id"] is not None
        assert response_body["patient_id"] == patient_id
        assert response_body["health_facility_name"] == facility_name
    finally:
        if response_body.get("id") is not None:
            crud.delete_by(ReferralOrm, id=response_body["id"])
        else:
            crud.delete_by(ReferralOrm, patient_id=patient_id)
