import pytest

from enums import SexEnum


@pytest.fixture
def vht_user_id():
    # id of "Test VHT" (require seed_test_data)
    return 3


@pytest.fixture
def patient_id():
    return "87356709248"


@pytest.fixture
def patient_info(patient_id):
    return {
        "id": patient_id,
        "name": "Mary Brown",
        "sex": SexEnum.FEMALE.value,
        "date_of_birth": "1998-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "1001",
        "is_archived": False,
    }


@pytest.fixture
def create_patient(database, patient_factory, patient_info):
    def f():
        patient_factory.create(**patient_info)
        database.session.commit()

    return f


@pytest.fixture
def reading_id():
    return "4d74a69b-e638-47e8-b17f-644ec564b6ea"


@pytest.fixture
def reading(reading_id, patient_id):
    # Invariant - trafficLightStatus: YELLOW_UP
    return {
        "id": reading_id,
        "patient_id": patient_id,
        "systolic_blood_pressure": 142,
        "diastolic_blood_pressure": 91,
        "heart_rate": 63,
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
        facility_factory.create(name=facility_name)
        user_factory.create(id=user_id, username=f"user_{user_id}")

        reading.update({"id": reading_id, "user_id": user_id})
        reading_factory.create(**reading)
        referral_factory.create(
            patient_id=patient_id,
            user_id=user_id,
            date_referred=date_referred,
            health_facility_name=facility_name,
            is_assessed=is_assessed,
        )

    return f


@pytest.fixture
def pregnancy_earlier(patient_id):
    return {
        "id": 60360714,
        "patient_id": patient_id,
        "start_date": 1561011126,
        "end_date": 1584684726,
        "outcome": "Baby born at 9 months - spontaneous vaginal delivery. Baby weighed 3kg.",
    }


@pytest.fixture
def pregnancy_later(patient_id):
    return {
        "id": 60360715,
        "patient_id": patient_id,
        "start_date": 1600150326,
    }


@pytest.fixture
def medical_record(patient_id):
    return {
        "id": 60360716,
        "patient_id": patient_id,
        "information": "Pregnancy induced hypertension - onset 5 months.",
        "is_drug_record": False,
    }


@pytest.fixture
def drug_record(patient_id):
    return {
        "id": 60360717,
        "patient_id": patient_id,
        "information": "Labetalol 300mg three times daily.",
        "is_drug_record": True,
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
        "form_template_id": "ft9",
        "form_classification_id": "fc9",
        "patient_id": patient_id,
        "date_created": 1561011126,
        "questions": [
            {
                "id": "referred-by-name",
                "category_index": None,
                "question_index": 0,
                "question_text": "How the patient's condition?",
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [
                    {
                        "question_index": 0,
                        "relation": "EQUAL_TO",
                        "answers": {"number": 4.0},
                    },
                ],
                "mc_options": [
                    {
                        "mc_id": 0,
                        "opt": "Decent",
                    },
                    {
                        "mc_id": 1,
                        "opt": "French",
                    },
                ],
                "answers": {"mc_id_array": [0]},
            },
            {
                "id": None,
                "category_index": None,
                "question_index": 1,
                "question_text": "Info",
                "question_type": "CATEGORY",
                "required": True,
            },
        ],
    }
