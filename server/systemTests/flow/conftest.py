import pytest


@pytest.fixture
def single_facility_actors(user_factory, facility_factory):
    facility = facility_factory.create(health_facility_name="SFT")
    admin = user_factory.create(
        email="admin@ft.a",
        password="Test_Password",
        health_facility_name="SFT",
        role="ADMIN",
    )
    hcw = user_factory.create(
        email="hcw@ft.a",
        password="Test_Password",
        health_facility_name="SFT",
        role="HCW",
    )
    cho = user_factory.create(
        email="cho@ft.a",
        password="Test_Password",
        health_facility_name="SFT",
        role="CHO",
    )
    vht = user_factory.create(
        email="vht@ft.a",
        password="Test_Password",
        health_facility_name="SFT",
        role="VHT",
    )

    return facility, admin, hcw, cho, vht


@pytest.fixture
def make_patient(make_assessment):
    def __builder(
        patient_id: str,
        reading_id: str = None,
        refer_to: str = None,
        is_assessed: bool = False,
        reading_timestamp: int = None,
        referral_timestamp: int = None,
        assessed_by: int = 2,
        assessment_timestamp: int = None,
        created_by: int = None,
    ):
        patient: dict = {
            "id": patient_id,
            "name": "TEST",
            "sex": "FEMALE",
            "is_pregnant": False,
            "zone": "1",
            "village_number": "1",
            "date_of_birth": "2004-01-01",
            "is_exact_date_of_birth": "false",
        }

        if reading_id:
            patient["readings"] = [
                {
                    "reading_id": reading_id,
                    "patient_id": patient_id,
                    "systolic_blood_pressure": 110,
                    "diastolic_blood_pressure": 80,
                    "heart_rate": 70,
                    "symptoms": [],
                    "date_taken": (
                        reading_timestamp if reading_timestamp else 1595118199
                    ),
                    "user_id": created_by if created_by else 1,
                },
            ]

        if refer_to:
            patient["referrals"] = [
                {
                    "date_referred": (
                        referral_timestamp if referral_timestamp else 1595118445
                    ),
                    "comment": "A comment",
                    "action_taken": "An action",
                    "user_id": created_by if created_by else 1,
                    "patient_id": patient_id,
                    "health_facility_name": refer_to,
                    "is_assessed": is_assessed,
                },
            ]

        if is_assessed:
            if not reading_id:
                raise ValueError("cannot create patient with assessment and no reading")

            assessment = make_assessment(reading_id, assessed_by, assessment_timestamp)
            patient["readings"][0]["followup"] = assessment

        return patient

    return __builder


@pytest.fixture
def make_assessment():
    def __builder(
        reading_id: str,
        assessed_by: int = 2,
        assessment_timestamp: int = None,
    ):
        return {
            "diagnosis": "A diagnosis",
            "treatment": "A treatment",
            "date_assessed": (
                assessment_timestamp if assessment_timestamp else 1595118647
            ),
            "healthcare_worker_id": assessed_by,
            "medication_prescribed": "Some medication",
            "special_investigations": "Some investigations",
            "follow_up_needed": False,
            "reading_id": reading_id,
        }

    return __builder
