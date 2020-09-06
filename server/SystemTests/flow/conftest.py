import pytest


@pytest.fixture
def single_facility_actors(user_factory, facility_factory):
    facility = facility_factory.create(healthFacilityName="SFT")
    admin = user_factory.create(
        email="admin@ft.a", password="ftest", healthFacilityName="SFT", role="ADMIN"
    )
    hcw = user_factory.create(
        email="hcw@ft.a", password="ftest", healthFacilityName="SFT", role="HCW"
    )
    cho = user_factory.create(
        email="cho@ft.a", password="ftest", healthFacilityName="SFT", role="CHO"
    )
    vht = user_factory.create(
        email="vht@ft.a", password="ftest", healthFacilityName="SFT", role="VHT"
    )

    yield facility, admin, hcw, cho, vht


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
            "patientId": patient_id,
            "patientName": "TEST",
            "patientSex": "FEMALE",
            "isPregnant": False,
            "zone": "1",
            "villageNumber": "1",
        }

        if reading_id:
            patient["readings"] = [
                {
                    "readingId": reading_id,
                    "patientId": patient_id,
                    "bpSystolic": 110,
                    "bpDiastolic": 80,
                    "heartRateBPM": 70,
                    "symptoms": [],
                    "dateTimeTaken": reading_timestamp
                    if reading_timestamp
                    else 1595118199,
                    "userId": created_by if created_by else 1,
                }
            ]

        if refer_to:
            if not reading_id:
                raise ValueError("cannot create patient with referral and no reading")

            patient["readings"][0]["referral"] = {
                "dateReferred": referral_timestamp
                if referral_timestamp
                else 1595118445,
                "comment": "A comment",
                "actionTaken": "An action",
                "userId": created_by if created_by else 1,
                "patientId": patient_id,
                "referralHealthFacilityName": refer_to,
                "readingId": reading_id,
                "isAssessed": is_assessed,
            }

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
            "dateAssessed": assessment_timestamp
            if assessment_timestamp
            else 1595118647,
            "healthcareWorkerId": assessed_by,
            "medicationPrescribed": "Some medication",
            "specialInvestigations": "Some investigations",
            "followupNeeded": False,
            "readingId": reading_id,
        }

    return __builder
