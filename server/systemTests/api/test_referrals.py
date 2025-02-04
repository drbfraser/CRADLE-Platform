from humps import decamelize


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
