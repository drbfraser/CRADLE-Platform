import pytest

from enums import SexEnum, GestationalAgeUnitEnum
from flask_limiter import Limiter
from config import app


def remove_limiter_middleware(app):
    for middleware in app.wsgi_app.middleware:
        if isinstance(middleware, Limiter):
            app.wsgi_app.middleware.remove(middleware)


@pytest.fixture(autouse=True)
def disable_limiter(app):
    remove_limiter_middleware(app)


@pytest.fixture
def vht_user_id():
    # id of "TestVHT" (require seed_test_data)
    return 3


@pytest.fixture
def patient_id():
    return "87356709248"


@pytest.fixture
def patient_info(patient_id):
    return {
        "patientId": patient_id,
        "patientName": "Mary Brown",
        "patientSex": SexEnum.FEMALE.value,
        "dob": "1998-01-01",
        "isExactDob": False,
        "villageNumber": "1001",
        "isArchived": False,
    }


@pytest.fixture
def create_patient(database, patient_factory, patient_info):
    def f():
        database.session.commit()
        patient_factory.create(**patient_info)

    return f


@pytest.fixture
def reading_id():
    return "4d74a69b-e638-47e8-b17f-644ec564b6ea"


@pytest.fixture
def reading(reading_id, patient_id):
    # Invariant - trafficLightStatus: YELLOW_UP
    return {
        "readingId": reading_id,
        "patientId": patient_id,
        "bpSystolic": 142,
        "bpDiastolic": 91,
        "heartRateBPM": 63,
        "symptoms": [],
    }


@pytest.fixture
def create_reading_with_referral(
    patient_id,
    reading_id,
    reading,
    referral_factory,
    reading_factory,
    facility_factory,
    user_factory,
):
    def f(
        reading_id=reading_id,
        facility_name="H6000",
        user_id=4000,
        date_referred=1620000000,
        is_assessed=False,
    ):
        facility_factory.create(healthFacilityName=facility_name)
        user_factory.create(id=user_id)

        reading.update({"readingId": reading_id, "userId": user_id})
        reading_factory.create(**reading)
        referral_factory.create(
            patientId=patient_id,
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
        "defaultTimeUnit": GestationalAgeUnitEnum.MONTHS.value,
        "endDate": 1584684726,
        "outcome": "Baby born at 9 months - spontaneous vaginal delivery. Baby weighed 3kg.",
    }


@pytest.fixture
def pregnancy_later(patient_id):
    return {
        "id": 60360715,
        "patientId": patient_id,
        "startDate": 1600150326,
        "defaultTimeUnit": GestationalAgeUnitEnum.WEEKS.value,
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


@pytest.fixture
def form_classification():
    return {
        "id": "fc9",
        "name": "fc9",
    }


@pytest.fixture
def form_template():
    return {
        "classification": {"name": "fc9"},
        "id": "ft9",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form(patient_id):
    return {
        "id": "f9",
        "lang": "english",
        "formTemplateId": "ft9",
        "formClassificationId": "fc9",
        "patientId": patient_id,
        "questions": [
            {
                "questionId": "referred-by-name",
                "categoryIndex": None,
                "questionIndex": 0,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qidx": 0, "relation": "EQUAL_TO", "answers": {"number": 4.0}}
                ],
                "mcOptions": [
                    {
                        "mcid": 0,
                        "opt": "Decent",
                    },
                    {
                        "mcid": 1,
                        "opt": "French",
                    },
                ],
                "answers": {"mcidArray": [0]},
            },
            {
                "questionId": None,
                "categoryIndex": None,
                "questionIndex": 1,
                "questionText": "Info",
                "questionType": "CATEGORY",
                "required": True,
            },
        ],
    }
