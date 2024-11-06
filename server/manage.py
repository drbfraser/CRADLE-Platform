import datetime
import json
import os
import random
import string
import time
import uuid
from random import choice, randint, randrange
from string import ascii_lowercase, digits

import click
import numpy as np
from flask.cli import FlaskGroup

import models
from api.util import create_secret_key_for_user
from data import crud, marshal
from enums import RoleEnum
from models import db
from seed_users import clear_user_pool as empty_user_pool
from seed_users import populate_test_users, seed_facilities

# cli = FlaskGroup(app)
cli = FlaskGroup()


# USAGE: python manage.py reset_db
@cli.command("reset_db")
def reset_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


# USAGE: python manage.py drop_all_tables
@cli.command("drop_all_tables")
def drop_all_tables():
    db.drop_all()
    db.session.commit()

# USAGE: python manage.py seed_user_pool
@cli.command("seed_users")
def seed_users():
    seed_facilities()
    populate_test_users()

# USAGE: python manage.py seed_facilities
@cli.command("seed_facilities")
def seed_health_facilities():
    seed_facilities()

# USAGE: python manage.py clear_user_pool
@cli.command("clear_user_pool")
def clear_user_pool():
    empty_user_pool()

# Extracts a username from the email address of a user - Only used in manage.py to generate seed test data
def get_username_from_email(email):
    try:
        username = email.split("@")[0]
        return username
    except IndexError:
        # If the email is invalid and does not contain "@"
        # Return None or raise an exception as per your requirement
        return None


# USAGE: python manage.py seed_minimal
@cli.command("seed_minimal")
def seed_minimal(
    email="admin@admin.com",
    password="Admin_123",

):
    """
    Seeds the database with the minimum amount of data required for it to be functional.

    The default data inserted into the database is deterministic so it is suitable for testing
    off of.

    The minimal set of data is as follows:
     - A single health facility (default name 'H0000')
     - A single admin user      (default email 'admin123@admin.com')

    Defaults can be overridden, such as:
       python ./manage.py seed_minimal --email="abc@test.com" --password="TeyHo5@e!0B" --facility_name="Sunny Creek"
    """
    print("Seeding health facility...")
    facility_name = "H0000"
    create_health_facility(facility_name=facility_name, phone_number="555-555-0000")

    print("Creating admin user...")
    create_user(
        email,
        "Admin",
        password,
        facility_name,
        RoleEnum.ADMIN.value,
        ["+1-888-456-7890", "+1-098-765-4321", os.environ.get("EMULATOR_PHONE_NUMBER")],
        1,
    )

    print("Finished seeding minimal data set")


# USAGE: python manage.py seed_test_data
@cli.command("seed_test_data")
@click.pass_context
def seed_test_data(ctx):
    """
    Seeds data for testing.

    The data inserted here should be deterministically generated to ease testing.
    """
    # Start with a minimal setup.
    ctx.invoke(seed_minimal)

    # Add the rest of the users.
    print("Creating test health facilities and users...")
    create_health_facility("H1000", phone_number="555-555-1000")
    create_health_facility("H2000", phone_number="555-555-2000")
    create_user(
        "brian@admin.com",
        "Brian",
        "brian123",
        "H0000",
        RoleEnum.ADMIN.value,
        ["+1-604-123-4567", "+1-604-123-4568"],
        2,
    )
    create_user(
        "vht@vht.com",
        "TestVHT",
        "vht123",
        "H0000",
        RoleEnum.VHT.value,
        ["555-555-5555", "666-666-6666", "777-777-7777"],
        3,
    )
    create_user(
        "vht2@vht.com",
        "TestVHT2",
        "vht123",
        "H1000",
        RoleEnum.VHT.value,
        ["+256-415-123456", "+256-415-123457", "+256-415-123458", "+256-415-123459"],
        4,
    )
    create_user(
        "hcw@hcw.com",
        "TestHCW",
        "hcw123",
        "H0000",
        RoleEnum.HCW.value,
        ["+256-416-123456"],
        5,
    )
    create_user(
        "cho@cho.com",
        "TestCHO",
        "cho123",
        "H0000",
        RoleEnum.CHO.value,
        ["+256-417-123456"],
        6,
    )

    print("Creating test patients, readings, referrals, and records...")
    create_patient_reading_referral_pregnancy(
        "49300028161",
        "00000000-d974-4059-a0a2-4b0a9c8e3a10",
        4,
        "BB",
        "1994-01-01",
        "MALE",
        "1001",
        1605566021,
        "H0000",
        True,
    )
    create_patient_reading_referral_pregnancy(
        "49300028162",
        "11111111-d974-4059-a0a2-4b0a9c8e3a10",
        3,
        "AA",
        "1992-01-01",
        "FEMALE",
        "1002",
        1621204421,
        "H0000",
        False,
        True,
        1610925778,
    )
    create_patient_reading_referral_pregnancy(
        "49300028163",
        "22222222-d974-4059-a0a2-4b0a9c8e3a10",
        3,
        "AB",
        "1998-01-01",
        "FEMALE",
        "1002",
        1610836421,
        "H1000",
        False,
    )
    create_pregnancy("49300028162", 1547341217, 1570928417)
    create_medical_record(
        "49300028162",
        "Pregnancy induced hypertension\nStarted on Labetalol 200mg three times daily two weeks ago",
        False,
    )
    create_medical_record(
        "49300028162",
        "Aspirin 75mg\nLabetalol 200mg three times daily",
        True,
    )
    create_patient_association("49300028162", 3)
    create_patient_association("49300028163", 4)

    print("Creating form template, form classification, and forms...")
    create_form_classification()
    create_form_template()
    create_form("49300028162", "Anna", "Bee", 31)
    create_form("49300028163", "Dianna", "Ele", 25)

    print("Adding relay server numbers to admin page...")
    create_relay_nums()

    print("Finished seeding test data")


# USAGE: python manage.py seed_test_patient
@cli.command("seed_test_patient")
def seed_test_patient():
    create_patient_reading_referral_pregnancy(
        "4930004967",
        "76a84c2c-d974-4059-a0a2-4b0a9c8e3a10",
        3,
        "Abena Adegoke",
        "1993-01-01",
        "FEMALE",
        "1002",
        1620640628,
        "H0000",
        True,
    )
    create_medical_record(
        "4930004967",
        "No known drug allergies; Aspirin 75mg; Labetalol 400mg three times daily",
        True,
        1622023028,
    )
    create_medical_record(
        "4930004967",
        "No known drug allergies; Aspirin 75mg; Labetalol 300mg three times daily",
        True,
        1621936628,
    )
    create_medical_record(
        "4930004967",
        "No known drug allergies; Aspirin 75mg; Labetalol 200mg three times daily",
        True,
        1620640628,
    )
    create_medical_record(
        "4930004967",
        "Frequent headache; Pregnancy induced hypertension - onset 5 months",
        False,
        1620640628,
    )
    create_pregnancy("4930004967", 1609840628)
    create_pregnancy("4930004967", 1549015028, 1573379828, "SVD. Baby weighed 3kg.")


# USAGE: python manage.py seed
@cli.command("seed")
@click.pass_context
def seed(ctx):
    start = time.time()

    # SEED villages
    print("Seeding Villages...")
    village_schema = models.VillageSchema()
    for village in village_list:
        v_schema = {"village_number": village}
        db.session.add(village_schema.load(v_schema))

    # SEED health facilities
    print("Seeding health facilities...")

    health_facility_schema = models.HealthFacilitySchema()
    for index, hf in enumerate(facility_locations):
        hf_schema = {
            "name": get_facility_name(index),
            "phone_number": get_facility_phone_number(hf["areaCode"]),
            "type": get_facility_type(),
            "about": get_facility_about(),
            "location": hf["city"],
            "new_referrals": str(round(time.time() * 1000)),
        }
        db.session.add(health_facility_schema.load(hf_schema))

    ctx.invoke(seed_test_data)

    print("Seeding Patients with readings and referrals...")
    # seed patients with readings and referrals
    patient_schema = models.PatientSchema()
    models.ReadingSchema()
    referral_schema = models.ReferralSchema()

    first_names, last_names = get_names()
    generated_names = set()
    for count, patient_id in enumerate(patient_list):
        # get random patient
        person = random.choice(first_names)
        name, sex = person["name"], person["sex"]
        last_name = random.choice(last_names)

        while name + last_name in generated_names:
            person = random.choice(first_names)
            name, sex = person["name"], person["sex"]
            last_name = random.choice(last_names)

        generated_names.add(name + last_name)

        if sex == models.SexEnum.MALE.value:
            pregnant = False
        else:
            pregnant = bool(random.getrandbits(1))


        gestational_timestamp = None

        if sex == models.SexEnum.FEMALE.value and pregnant:
            gestational_timestamp = get_random_pregnancy_date()

        patient_1 = {
            "id": patient_id,
            "name": name + " " + last_name,
            "gestational_timestamp": gestational_timestamp,
            "village_number": get_random_village(),
            "sex": sex,
            "is_pregnant": pregnant,
            "date_of_birth": get_random_DOB(),
            "is_exact_date_of_birth": bool(random.getrandbits(1)),
            "is_archived": False,
        }

        db.session.add(patient_schema.load(patient_1))
        db.session.commit()

        if pregnant:
            pregnancy_schema = models.PregnancySchema()
            pregnancy_record = {
                "patient_id": patient_id,
                "start_date": gestational_timestamp,
            }
            db.session.add(pregnancy_schema.load(pregnancy_record))
            db.session.commit()

        num_of_readings = random.randint(1, 5)
        date_list = [get_random_date() for i in range(num_of_readings)]
        date_list.sort()

        user_id = get_random_user()
        for i in range(num_of_readings):
            reading_id = str(uuid.uuid4())
            health_facility_name = get_random_health_facility_name()

            # get random reading(s) for patient
            reading_1 = {
                "user_id": user_id,
                "patient_Id": patient_id,
                "date_time_taken": date_list[i],
                "reading_id": reading_id,
                "systolic_blood_pressure": get_random_systolic_bp(),
                "diastolic_blood_pressure": get_random_diastolic_bp(),
                "heart_rate_BPM": get_random_heart_rate_BPM(),
                "symptoms": get_random_symptoms(),
            }

            reading_1_model = marshal.unmarshal(models.ReadingOrm, reading_1)
            crud.create(reading_1_model, refresh=True)

            referral_comments = [
                " needs help!",
                " is doing fine!",
                " is seeking urgent care!",
            ]
            if random.choice([True, False]):
                # Cap the referral date at today, if it goes into future
                refer_date = min(
                    reading_1["date_time_taken"]
                    + int(datetime.timedelta(days=10).total_seconds()),
                    int(datetime.datetime.now().timestamp()),
                )
                referral_1 = {
                    "user_id": get_random_user(),
                    "patient_id": patient_id,
                    "date_referred": refer_date,
                    "health_facility_name": health_facility_name,
                    "comment": name + random.choice(referral_comments),
                }
                db.session.add(referral_schema.load(referral_1))
                db.session.commit()

        if count > 0 and count % 25 == 0:
            print(f"{count}/{len(patient_list)} Patients have been seeded")

    print(f"{count + 1}/{len(patient_list)} Patients have been seeded")
    print("Complete!")

    end = time.time()
    print(f"The seed script took: {round(end - start, 3)} seconds")


# Creates a user and adds it to the database
def create_user(email, name, password, health_facility_name, role, phone_numbers, user_id):
    # Check if the email already exists
    existing_user = models.UserOrm.query.filter_by(username=name).first()
    if existing_user:
        print(f"User with username '{name}' already exists.")
        return None

    # Create a new User instance
    new_user = models.UserOrm(
        id=user_id,
        name=name,
        email=email,
        username=get_username_from_email(email),
        health_facility_name=health_facility_name,
        role=role,
    )

    new_phone_numbers = []
    for phone_number in phone_numbers:
        # Check if the phone number already exists
        existing_phone = models.UserPhoneNumberOrm.query.filter_by(
            number=phone_number,
        ).first()
        if existing_phone:
            print(
                f"Phone number '{phone_number}' is already associated with another user.",
            )
            return None

        # Create a new UserPhoneNumber instance and associate it with the user
        new_phone_numbers.append(
            models.UserPhoneNumberOrm(number=phone_number, user=new_user),
        )

    try:
        # Add the new user and phone numbers to the database
        db.session.add(new_user)
        db.session.add_all(new_phone_numbers)
        db.session.commit()
        create_secret_key_for_user(user_id)
        print(f"User '{name}' created successfully.")
        return new_user
    except Exception as e:
        db.session.rollback()
        print(f"Failed to create user: {e}")
        return None


def create_health_facility(
    facility_name,
    phone_number,
    facility_type="HOSPITAL",
    location="Sample Location",
    about="Sample health centre",
):
    facility = {
        "name": facility_name,
        "type": facility_type,
        "phone_number": phone_number,
        "location": location,
        "about": about,
        "new_referrals": str(round(time.time() * 1000)),
    }
    schema = models.HealthFacilitySchema()
    db.session.add(schema.load(facility))
    db.session.commit()


def create_patient_reading_referral_pregnancy(
    patient_id,
    reading_id,
    user_id,
    patient_name,
    date_of_birth,
    sex,
    village_number,
    date_referred,
    health_facility_name,
    is_assessed,
    is_pregnant=False,
    gestational_timestamp=None,
):
    """
    Creates a patient in the database.
    """
    if is_pregnant:
        patient = {
            "id": patient_id,
            "name": patient_name,
            "gestational_timestamp": gestational_timestamp,
            "village_number": village_number,
            "sex": sex,
            "is_pregnant": "true",
            "date_of_birth": date_of_birth,
            "is_exact_date_of_birth": False,
            "is_archived": False,
        }
        pregnancy = {
            "patient_id": patient_id,
            "start_date": gestational_timestamp,
        }
    else:
        patient = {
            "id": patient_id,
            "name": patient_name,
            "village_number": village_number,
            "sex": sex,
            "is_pregnant": "false",
            "date_of_birth": date_of_birth,
            "is_exact_date_of_birth": False,
            "is_archived": False,
        }
        pregnancy = None

    reading = {
        "id": reading_id,
        "user_id": user_id,
        "patient_id": patient_id,
        "date_taken": date_referred,
        "systolic_blood_pressure": 50,
        "diastolic_blood_pressure": 60,
        "heart_rate_BPM": 70,
        "traffic_light_status": "YELLOW_DOWN",
        "symptoms": "FEVERISH",
    }

    # health facility name based on one defined in seed_minimal()
    referral = {
        "patient_id": patient_id,
        "user_id": user_id,
        "date_referred": date_referred,
        "health_facility_name": health_facility_name,
        "is_assessed": is_assessed,
    }

    patient_schema = models.PatientSchema()
    db.session.add(patient_schema.load(patient))
    db.session.commit()

    readingModel = marshal.unmarshal(models.ReadingOrm, reading)
    crud.create(readingModel, refresh=True)

    referral_schema = models.ReferralSchema()
    db.session.add(referral_schema.load(referral))
    db.session.commit()

    if pregnancy:
        pregnancy_schema = models.PregnancySchema()
        db.session.add(pregnancy_schema.load(pregnancy))
        db.session.commit()


def create_pregnancy(
    patient_id,
    start_date,
    end_date=None,
    outcome=None,
):
    pregnancy = {
        "patient_id": patient_id,
        "start_date": start_date,
        "end_date": end_date,
        "outcome": outcome,
    }
    schema = models.PregnancySchema()
    db.session.add(schema.load(pregnancy))
    db.session.commit()


def create_medical_record(patient_id, info, is_drug_record, date_created=1622541428):
    record = {
        "patient_id": patient_id,
        "information": info,
        "is_drug_record": is_drug_record,
        "date_created": date_created,
    }
    schema = models.MedicalRecordSchema()
    db.session.add(schema.load(record))
    db.session.commit()


def create_patient_association(patient_id, user_id):
    association = {"patientId": patient_id, "user_id": user_id}
    schema = models.PatientAssociationsSchema()
    db.session.add(schema.load(association))
    db.session.commit()


def create_form_classification():
    form_classification = {
        "id": "dc9",
        "name": "Personal Intake Form",
    }
    form_classification_schema = models.FormClassificationSchema()
    db.session.add(form_classification_schema.load(form_classification))
    db.session.commit()


def create_form_template():
    form_template = {
        "classification": {"name": "Personal Intake Form", "id": "dc9"},
        "id": "dt9",
        "version": "V1",
        "questions": [
            {
                "id": "cat1_seed_test_data",
                "form_template_id": "dt9",
                "category_index": None,
                "question_index": 0,
                "is_blank": True,
                "question_type": "CATEGORY",
                "required": False,
                "allow_future_dates": True,
                "allow_past_dates": True,
                "num_min": None,
                "num_max": None,
                "string_max_length": None,
                "units": None,
                "visible_condition": "[]",
                "string_max_lines": None,
            },
            {
                "id": "fname_seed_test_data",
                "form_template_id": "dt9",
                "category_index": 0,
                "question_id": "",
                "question_index": 1,
                "is_blank": True,
                "question_type": "STRING",
                "required": False,
                "allow_future_dates": True,
                "allow_past_dates": True,
                "num_min": None,
                "num_max": None,
                "string_max_length": None,
                "units": None,
                "visible_condition": "[]",
                "string_max_lines": None,
            },
            {
                "id": "lname_seed_test_data",
                "form_template_id": "dt9",
                "category_index": 0,
                "question_id": "",
                "question_index": 2,
                "is_blank": True,
                "question_type": "STRING",
                "required": False,
                "allow_future_dates": True,
                "allow_past_dates": True,
                "num_min": None,
                "num_max": None,
                "string_max_length": None,
                "units": None,
                "visible_condition": "[]",
                "string_max_lines": None,
            },
            {
                "id": "age_seed_test_data",
                "form_template_id": "dt9",
                "category_index": 0,
                "question_id": "",
                "question_index": 3,
                "is_blank": True,
                "question_type": "INTEGER",
                "required": False,
                "allow_future_dates": True,
                "allow_past_dates": True,
                "num_min": None,
                "num_max": None,
                "string_max_length": None,
                "units": None,
                "visible_condition": "[]",
                "string_max_lines": None,
            },
        ],
    }

    form_template_schema = models.FormTemplateSchema()
    db.session.add(form_template_schema.load(form_template))
    db.session.commit()

    lang_versions = [
        {
            "id": 100,
            "lang": "English",
            "question_text": "Personal Information",
            "question_id": "cat1_seed_test_data",
        },
        {
            "id": 101,
            "lang": "English",
            "question_text": "First Name",
            "question_id": "fname_seed_test_data",
        },
        {
            "id": 102,
            "lang": "English",
            "question_text": "Last Name",
            "question_id": "lname_seed_test_data",
        },
        {
            "id": 103,
            "lang": "English",
            "question_text": "Approximate Age",
            "question_id": "age_seed_test_data",
        },
    ]

    for curr_q in lang_versions:
        ques_lang_schema = models.QuestionLangVersionSchema()
        db.session.add(ques_lang_schema.load(curr_q))
        db.session.commit()


def create_form(patient_id, fname, lname, age):
    form = {
        "id": patient_id,
        "lang": "English",
        "patient_id": patient_id,
        "form_template_id": "dt9",
        "form_classification_id": "dc9",
        "questions": [
            {
                "id": "cat1_seed_test_data" + patient_id,
                "has_comment_attached": False,
                "required": False,
                "form_id": patient_id,
                "visible_condition": "[]",
                "is_blank": False,
                "mc_options": "[]",
                "category_index": None,
                "question_index": 0,
                "question_text": "Personal Information",
                "question_type": "CATEGORY",
            },
            {
                "has_comment_attached": False,
                "required": False,
                "id": "fname_seed_test_data" + patient_id,
                "form_id": patient_id,
                "visible_condition": "[]",
                "is_blank": False,
                "answers": f'{{"text": "{fname}"}}',
                "mc_options": "[]",
                "category_index": 0,
                "question_index": 1,
                "question_id": "",
                "question_text": "First Name",
                "question_type": "STRING",
            },
            {
                "has_comment_attached": False,
                "required": False,
                "id": "lname_seed_test_data" + patient_id,
                "form_id": patient_id,
                "visible_condition": "[]",
                "is_blank": False,
                "answers": f'{{"text": "{lname}"}}',
                "mc_options": "[]",
                "category_index": 0,
                "question_index": 2,
                "question_id": "",
                "question_text": "Last Name",
                "question_type": "STRING",
            },
            {
                "has_comment_attached": False,
                "required": False,
                "id": "age_seed_test_data" + patient_id,
                "form_id": patient_id,
                "visible_condition": "[]",
                "is_blank": False,
                "answers": f'{{"number": {age}}}',
                "mc_options": "[]",
                "category_index": 0,
                "question_index": 3,
                "question_id": "",
                "question_text": "Approximate Age",
                "question_type": "INTEGER",
            },
        ],
    }

    form_schema = models.FormSchema()
    db.session.add(form_schema.load(form))
    db.session.commit()


def create_relay_nums():
    relay_nums = [
        {
            "id": "num1_seed_test_data",
            "last_received": 1702801536,
            "description": "Main Server",
            "phone_number": "+232 301 3425",
        },
        {
            "id": "num2_seed_test_data",
            "last_received": 1702788502,
            "description": "Hospital H000",
            "phone_number": "+232 221 5555",
        },
        {
            "id": "num3_seed_test_data",
            "last_received": 1667356312,
            "description": "Backup Server",
            "phone_number": "+232 865 1245",
        },
    ]

    for curr_num in relay_nums:
        relay_schema = models.RelayServerPhoneNumberSchema()
        db.session.add(relay_schema.load(curr_num))
        db.session.commit()


def get_random_initials():
    return (
        random.choice(string.ascii_letters) + random.choice(string.ascii_letters)
    ).upper()


def get_random_village():
    return random.choice(village_list)


def get_random_systolic_bp():
    return random.choice(bp_systolic_list)


def get_random_diastolic_bp():
    return random.choice(bp_diastolic_list)


def get_random_heart_rate_BPM():
    return random.choice(heart_rate_list)


def get_random_health_facility_name():
    return random.choice(health_facility_list)


def get_random_user():
    return random.choice(users_list)


def get_random_symptoms():
    numOfSymptoms = random.randint(0, 4)
    if numOfSymptoms == 0:
        return ""

    symptoms = random.sample(population=symptoms_list, k=numOfSymptoms)
    return ", ".join(symptoms)


def get_random_date():
    """
    This function will return a random datetime between two datetime
    objects.
    """
    start = date_1
    end = date_2
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    new_date = start + datetime.timedelta(seconds=random_second)
    return int(new_date.strftime("%s"))


def get_random_pregnancy_date():
    max_preg = randint(1, 273)
    date = datetime.datetime.today() - datetime.timedelta(max_preg)
    return int(date.strftime("%s"))


def generate_random_reading_id():
    pool = ascii_lowercase + digits
    reading_id = (
        "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(4)])
    )
    return reading_id


def get_names():
    with open("./data/seed_data/seed.json") as f:
        names = json.load(f)
        return names["firstNames"], names["lastNames"]


def get_date_time(dateStr):
    return datetime.datetime.strptime(dateStr, "%Y-%m-%dT%H:%M:%S")


def generate_phone_numbers():
    prefix = "+256"

    area_codes = [loc["areaCode"] for loc in facility_locations]
    n = len(area_codes)
    post_fixes = ["".join([f"{randint(0, 9)}" for num in range(6)]) for x in range(n)]

    numbers = {}
    for i in range(n):
        numbers[area_codes[i]] = prefix + "-" + str(area_codes[i]) + "-" + post_fixes[i]

    return numbers


def get_facility_phone_number(area_code):
    return facility_phone_numbers[area_code]


def generate_health_facilities():
    n = len(facility_locations)

    # Sets are unique element lists, prevents from having duplicates
    facilities = set()
    while len(facilities) < n:
        facilities.add(
            "H" + "".join([f"{randint(0, 9)}" for num in range(4)]),
        )

    facilities = list(facilities)

    return sorted(facilities)


def generate_villages():
    n = len(facility_locations)
    villages = set()
    while len(villages) < n:
        villages.add("1" + "".join([f"{randint(0, 9)}" for num in range(3)]))
    villages = list(villages)
    return villages


def get_random_DOB():
    format = "%Y-%m-%d"
    start = time.mktime(time.strptime("1950-1-1", format))
    end = time.mktime(time.strptime("2010-1-1", format))
    rand_range = random.random()

    p_time = start + rand_range * (end - start)

    return time.strftime(format, time.localtime(p_time))


def get_facility_name(index):
    return health_facility_list[index]


def get_facility_type():
    return random.choice(facility_type)


def get_facility_about():
    return random.choice(facility_about)


if __name__ == "__main__":
    NUM_OF_PATIENTS = 250
    # This is used to get random dates to generate readings for patients.
    # TODO: This should be updated once in a while, for readings to be displayed in the frontend.
    START_DATE = "1/1/2022 12:01 AM"

    patient_list = random.sample(range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patient_list)
    patient_list = list(map(str, patient_list))

    # Get cities
    with open("./data/seed_data/seed.json") as f:
        facility_locations = json.load(f)["locations"]

    users_list = [1, 2, 3, 4]
    village_list = generate_villages()
    health_facility_list = generate_health_facilities()

    facility_type = ["HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facility_about = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]

    facility_phone_numbers = generate_phone_numbers()

    symptoms_list = ["HEADACHE", "BLURRED VISION", "ABDO PAIN", "BLEEDING", "FEVERISH"]
    sex_list = ["FEMALE", "MALE"]
    bp_systolic_list = np.clip(np.random.normal(120, 35, 1000).astype(int), 50, 300)
    bp_diastolic_list = np.clip(np.random.normal(80, 25, 1000).astype(int), 30, 200)
    heart_rate_list = np.clip(np.random.normal(60, 17, 1000).astype(int), 30, 250)

    date_1 = datetime.datetime.strptime(START_DATE, "%m/%d/%Y %I:%M %p")
    date_2 = datetime.datetime.today().replace(microsecond=0)

    cli()
