import pytest


@pytest.fixture
def patient_id():
    return "87356709248"


@pytest.fixture
def patient_info(patient_id):
    return {
        "patientId": patient_id,
        "patientName": "Mary Brown",
        "patientSex": "FEMALE",
        "dob": "1998-01-01",
        "isExactDob": False,
    }


@pytest.fixture
def create_patient(database, patient_factory, patient_info):
    def f():
        database.session.commit()
        patient_factory.create(**patient_info)

    return f


@pytest.fixture
def create_referral(
    patient_id, referral_factory, reading_factory, facility_factory, user_factory
):
    def f(reading_id, facility_name, user_id, date_referred, is_assessed):
        reading_factory.create(readingId=reading_id, patientId=patient_id)
        facility_factory.create(healthFacilityName=facility_name)
        user_factory.create(id=user_id)
        referral_factory.create(
            patientId=patient_id,
            readingId=reading_id,
            userId=user_id,
            dateReferred=date_referred,
            referralHealthFacilityName=facility_name,
            isAssessed=is_assessed,
        )

    return f


@pytest.fixture
def pregnancy_earlier(patient_id):
    return {
        "id": 60360714,
        "patientId": patient_id,
        "startDate": 1561011126,
        "defaultTimeUnit": "MONTHS",
        "endDate": 1584684726,
        "outcome": "Baby born at 9 months - spontaneous vaginal delivery. Baby weighed 3kg.",
    }


@pytest.fixture
def pregnancy_later(patient_id):
    return {
        "id": 60360715,
        "patientId": patient_id,
        "startDate": 1600150326,
        "defaultTimeUnit": "WEEKS",
    }


@pytest.fixture
def medical_record(patient_id):
    return {
        "id": 60360716,
        "patientId": patient_id,
        "information": "Pregnancy induced hypertension - onset 5 months.",
        "isDrugRecord": False,
    }


@pytest.fixture
def drug_record(patient_id):
    return {
        "id": 60360717,
        "patientId": patient_id,
        "information": "Labetalol 300mg three times daily.",
        "isDrugRecord": True,
    }
