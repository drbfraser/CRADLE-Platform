from models import TrafficLightEnum


def test_get_referral_list(
    create_patient,
    create_reading_with_referral,
    pregnancy_factory,
    pregnancy_later,
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

    response = api_get(endpoint="/api/referrals")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(endpoint=f"/api/referrals?healthFacility={facility1}")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert not any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(
        endpoint=f"/api/referrals?healthFacility={facility1}&healthFacility={facility2}"
    )

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(endpoint=f"/api/referrals?referrer={user1}")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert not any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(endpoint=f"/api/referrals?dateRange=0:{date1}")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert not any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(endpoint="/api/referrals?isAssessed=1")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert not any(r["dateReferred"] == date2 for r in response.json())

    response = api_get(endpoint="/api/referrals?isPregnant=1")

    assert response.status_code == 200
    assert not any(r["dateReferred"] == date1 for r in response.json())
    assert not any(r["dateReferred"] == date2 for r in response.json())

    pregnancy_factory.create(**pregnancy_later)
    response = api_get(endpoint="/api/referrals?isPregnant=1")

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert any(r["dateReferred"] == date2 for r in response.json())

    pregnancy_factory.create(**pregnancy_later)
    response = api_get(
        endpoint=f"/api/referrals?vitalSigns={TrafficLightEnum.YELLOW_UP.value}"
    )

    assert response.status_code == 200
    assert any(r["dateReferred"] == date1 for r in response.json())
    assert any(r["dateReferred"] == date2 for r in response.json())
