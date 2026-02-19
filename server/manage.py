import datetime
import json
import random
import string
import time
from random import randint, randrange
from typing import List

import click
import numpy as np
from flask.cli import FlaskGroup

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from data import orm_serializer
from enums import QuestionTypeEnum, SexEnum, WorkflowStatusEnum, WorkflowStepStatusEnum
from models import (
    FormAnswerOrmV2,
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormOrm,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrm,
    FormTemplateOrmV2,
    LangVersionOrmV2,
    MedicalRecordOrm,
    PatientAssociationsOrm,
    PatientOrm,
    PregnancyOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
    ReadingOrm,
    ReferralOrm,
    RelayServerPhoneNumberOrm,
    VillageOrm,
    WorkflowClassificationOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
    db,
)
from seed_users import (
    clear_user_pool as empty_user_pool,
)
from seed_users import (
    facilities_list,
    seed_minimal_users,
    seed_test_users,
)

# cli = FlaskGroup(app)
cli = FlaskGroup()


# USAGE: python manage.py reset_db
@cli.command("reset_db")
def reset_db_cli():
    reset_db()


def reset_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


# USAGE: python manage.py drop_all_tables
@cli.command("drop_all_tables")
def drop_all_tables():
    db.drop_all()
    db.session.commit()


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
@click.pass_context
def seed_minimal(ctx):
    """
    Seeds the database with the minimum amount of data required for it to be functional.

    The default data inserted into the database is deterministic so it is suitable for testing
    off of.

    The minimal set of data is as follows:
     - A single health facility (default name 'H0000')
     - A single admin user      (default email 'admin@admin.com')

    Defaults can be overridden, such as:
       python ./manage.py seed_minimal --email="abc@test.com" --password="TeyHo5@e!0B" --facility_name="Sunny Creek"
    """
    # ctx.invoke(reset_db)
    reset_db()
    seed_minimal_users()
    print("Finished seeding minimal data set")


def seed_test_data():
    """
    Seeds data for testing.

    The data inserted here should be deterministically generated to ease testing.
    """
    # ctx.invoke(reset_db)
    reset_db()

    # Seed users and health facilities.
    seed_test_users()

    print("Creating test patients, readings, referrals, and records...")
    PATIENT_ID_1 = "49300028161"
    PATIENT_ID_2 = "49300028162"
    PATIENT_ID_3 = "49300028163"

    create_patient_reading_referral_pregnancy(
        PATIENT_ID_1,
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
        PATIENT_ID_2,
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
        PATIENT_ID_3,
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
    create_pregnancy(PATIENT_ID_2, 1547341217, 1570928417)
    create_medical_record(
        PATIENT_ID_2,
        "Pregnancy induced hypertension\nStarted on Labetalol 200mg three times daily two weeks ago",
        False,
    )
    create_medical_record(
        PATIENT_ID_2,
        "Aspirin 75mg\nLabetalol 200mg three times daily",
        True,
    )
    create_patient_association(PATIENT_ID_2, 3)
    create_patient_association(PATIENT_ID_3, 4)

    print("Creating form template, form classification, and forms...")
    create_form_classification()
    create_form_template()
    create_form(PATIENT_ID_2, "Anna", "Bee", 31)
    create_form(PATIENT_ID_3, "Dianna", "Ele", 25)

    # Add V2 forms
    seed_forms_v2()

    print("Adding relay server numbers to admin page...")
    create_relay_nums()

    print("Creating a simple workflow template and form for the workflow template")
    form_template_id = create_simple_workflow_template_step_form()

    WORKFLOW_TEMPLATE_ID1 = "workflow-template-1"
    WORKFLOW_TEMPLATE_ID2 = "workflow-template-2"
    create_simple_workflow_template(WORKFLOW_TEMPLATE_ID1, form_template_id)
    create_simple_workflow_template_with_branching(
        WORKFLOW_TEMPLATE_ID2, form_template_id
    )

    print("Creating workflow instances")
    # Create forms to be used by workflow instance
    create_workflow_instance_form(
        form_id="workflow-instance-form-1",
        patient_id=PATIENT_ID_1,
        user_id=3,
        form_template_id=form_template_id,
        form_classification_id="wt-simple-1-form-classification",
        first_name="Anna",
    )

    create_workflow_instance_form(
        form_id="workflow-instance-form-2",
        patient_id=PATIENT_ID_2,
        user_id=3,
        form_template_id=form_template_id,
        form_classification_id="wt-simple-1-form-classification",
        first_name="Anna",
    )

    create_workflow_instance_form(
        form_id="workflow-instance-form-3",
        patient_id=PATIENT_ID_3,
        user_id=3,
        form_template_id=form_template_id,
        form_classification_id="wt-simple-1-form-classification",
        first_name="Anna",
    )

    # Create workflow instances
    create_workflow_instance(
        instance_id="test-workflow-instance-1",
        instance_name="Patient Workflow Instance",
        patient_id=PATIENT_ID_1,
        workflow_template_id=WORKFLOW_TEMPLATE_ID1,
    )

    create_workflow_instance(
        instance_id="test-workflow-instance-2",
        instance_name="Patient Workflow Instance",
        patient_id=PATIENT_ID_2,
        workflow_template_id=WORKFLOW_TEMPLATE_ID1,
    )

    create_workflow_instance(
        instance_id="test-workflow-instance-3",
        instance_name="Patient Workflow Instance V2",
        patient_id=PATIENT_ID_2,
        workflow_template_id=WORKFLOW_TEMPLATE_ID2,
        num_steps=6,  # must be 6 for fixed template
    )

    create_workflow_instance(
        instance_id="test-workflow-instance-4",
        instance_name="Collect Readings Workflow Instance",
        patient_id=PATIENT_ID_3,
        workflow_template_id=WORKFLOW_TEMPLATE_ID2,
        num_steps=6,  # must be 6 for fixed template
    )

    print("Finished seeding test data")


# USAGE: python manage.py seed_test_patient
@cli.command("seed_test_patient")
def seed_test_patient_cli():
    seed_test_patient()


# USAGE: python manage.py seed_test_data
@cli.command("seed_test_data")
@click.pass_context
def seed_test_data_cli(ctx):
    seed_test_data()


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
    create_pregnancy("4930004967", 1549015028,
                     1573379828, "SVD. Baby weighed 3kg.")


def seed():
    seed_test_data()

    # SEED villages
    print("Seeding Villages...")
    for village_number in village_numbers_list:
        village = {"village_number": village_number}
        db.session.add(VillageOrm(**village))

    print("Seeding Patients with readings and referrals...")
    # seed patients with readings and referrals

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

        if sex == SexEnum.MALE.value:
            pregnant = False
        else:
            pregnant = bool(random.getrandbits(1))

        pregnancy_start_date = None

        if sex == SexEnum.FEMALE.value and pregnant:
            pregnancy_start_date = get_random_pregnancy_date()

        patient = {
            "id": patient_id,
            "name": name + " " + last_name,
            "village_number": get_random_village(),
            "sex": sex,
            "is_pregnant": pregnant,
            "date_of_birth": get_random_DOB(),
            "is_exact_date_of_birth": bool(random.getrandbits(1)),
            "is_archived": False,
        }

        db.session.add(orm_serializer.unmarshal(PatientOrm, patient))
        db.session.commit()

        if pregnant:
            pregnancy_record = {
                "patient_id": patient_id,
                "start_date": pregnancy_start_date,
            }
            db.session.add(PregnancyOrm(**pregnancy_record))
            db.session.commit()

        num_of_readings = random.randint(1, 5)
        date_list = [get_random_date() for i in range(num_of_readings)]
        date_list.sort()

        user_id = get_random_user()
        for i in range(num_of_readings):
            health_facility_name = get_random_health_facility_name()

            reading_date = date_list[i]
            # get random reading(s) for patient
            reading = {
                "user_id": user_id,
                "patient_id": patient_id,
                "date_taken": reading_date,
                "systolic_blood_pressure": get_random_systolic_bp(),
                "diastolic_blood_pressure": get_random_diastolic_bp(),
                "heart_rate": get_random_heart_rate(),
                "symptoms": get_random_symptoms(),
            }

            reading_orm = orm_serializer.unmarshal(ReadingOrm, reading)

            referral_comments = [
                " needs help!",
                " is doing fine!",
                " is seeking urgent care!",
            ]
            if random.choice([True, False]):
                referral = {
                    "user_id": get_random_user(),
                    "patient_id": patient_id,
                    "date_referred": reading["date_taken"],
                    "health_facility_name": health_facility_name,
                    "comment": name + random.choice(referral_comments),
                }
                referral_orm = ReferralOrm(**referral)
                reading_orm.referral = referral_orm
            db.session.add(reading_orm)
            db.session.commit()

        if count > 0 and count % 25 == 0:
            print(f"{count}/{len(patient_list)} Patients have been seeded")

    print(f"{count + 1}/{len(patient_list)} Patients have been seeded")

    print("Seeding PAPAGAIO Research Study Workflow Template...")
    create_complex_workflow_classification()
    create_complex_workflow_template()
    print("PAPAGAIO Research Study Workflow Template has been seeded")

    print("Complete!")


# USAGE: python manage.py seed
@cli.command("seed")
@click.pass_context
def seed_cli(ctx):
    start = time.time()
    seed()
    end = time.time()
    print(f"The seed script took: {round(end - start, 3)} seconds")


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
    pregnancy_start_date=None,
):
    """
    Creates a patient in the database.
    """
    if is_pregnant:
        patient = {
            "id": patient_id,
            "name": patient_name,
            "village_number": village_number,
            "sex": sex,
            "is_pregnant": True,
            "date_of_birth": date_of_birth,
            "is_exact_date_of_birth": False,
            "is_archived": False,
        }
        pregnancy = {
            "patient_id": patient_id,
            "start_date": pregnancy_start_date,
        }
    else:
        patient = {
            "id": patient_id,
            "name": patient_name,
            "village_number": village_number,
            "sex": sex,
            "is_pregnant": False,
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
        "heart_rate": 70,
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

    db.session.add(PatientOrm(**patient))
    db.session.commit()

    reading_orm = orm_serializer.unmarshal(ReadingOrm, reading)
    crud.create(reading_orm, refresh=True)

    db.session.add(ReferralOrm(**referral))
    db.session.commit()

    if pregnancy:
        db.session.add(PregnancyOrm(**pregnancy))
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
    db.session.add(PregnancyOrm(**pregnancy))
    db.session.commit()


def create_medical_record(patient_id, info, is_drug_record, date_created=1622541428):
    record = {
        "patient_id": patient_id,
        "information": info,
        "is_drug_record": is_drug_record,
        "date_created": date_created,
    }
    db.session.add(MedicalRecordOrm(**record))
    db.session.commit()


def create_patient_association(patient_id, user_id):
    association = {"patient_id": patient_id, "user_id": user_id}
    db.session.add(PatientAssociationsOrm(**association))
    db.session.commit()


def create_form_classification():
    if crud.read(FormClassificationOrm, id="dc9") is not None:
        return

    form_classification = {
        "id": "dc9",
        "name": "Personal Intake Form",
    }
    db.session.add(FormClassificationOrm(**form_classification))
    db.session.commit()


def create_form_template():
    if crud.read(FormTemplateOrm, id="dt9") is not None:
        return

    form_template = {
        "id": "dt9",
        "version": "V1",
    }
    questions = [
        {
            "id": "cat1_seed_test_data",
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
            "category_index": 0,
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
            "category_index": 0,
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
            "category_index": 0,
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
    ]
    create_form_classification()
    form_classification_orm = crud.read(FormClassificationOrm, id="dc9")
    form_template_orm = FormTemplateOrm(
        classification=form_classification_orm, **form_template
    )
    for question in questions:
        question_orm = QuestionOrm(**question)
        form_template_orm.questions.append(question_orm)

    db.session.add(form_template_orm)
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
        db.session.add(QuestionLangVersionOrm(**curr_q))
        db.session.commit()


def create_form(patient_id, fname, lname, age):
    form = {
        "id": "form_1_" + patient_id,
        "lang": "English",
        "patient_id": patient_id,
        "form_template_id": "dt9",
    }

    questions = [
        {
            "id": "cat1_seed_test_data-" + patient_id,
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
            "id": "fname_seed_test_data-" + patient_id,
            "form_id": patient_id,
            "visible_condition": "[]",
            "is_blank": False,
            "answers": f'{{"text": "{fname}"}}',
            "mc_options": "[]",
            "category_index": 0,
            "question_index": 1,
            "question_text": "First Name",
            "question_type": "STRING",
        },
        {
            "has_comment_attached": False,
            "required": False,
            "id": "lname_seed_test_data-" + patient_id,
            "form_id": patient_id,
            "visible_condition": "[]",
            "is_blank": False,
            "answers": f'{{"text": "{lname}"}}',
            "mc_options": "[]",
            "category_index": 0,
            "question_index": 2,
            "question_text": "Last Name",
            "question_type": "STRING",
        },
        {
            "has_comment_attached": False,
            "required": False,
            "id": "age_seed_test_data-" + patient_id,
            "form_id": patient_id,
            "visible_condition": "[]",
            "is_blank": False,
            "answers": f'{{"number": {age}}}',
            "mc_options": "[]",
            "category_index": 0,
            "question_index": 3,
            "question_text": "Approximate Age",
            "question_type": "INTEGER",
        },
    ]
    create_form_template()
    form_classification_orm = crud.read(FormClassificationOrm, id="dc9")

    form_orm = FormOrm(classification=form_classification_orm, **form)

    for question in questions:
        form_orm.questions.append(QuestionOrm(**question))

    db.session.add(form_orm)
    db.session.commit()


def create_form_classification_v2():
    """Create sample form classifications V2 with translations"""
    if crud.read(FormClassificationOrmV2, id="fc-v2-intake") is not None:
        return

    # Create "Patient Intake Form" classification
    intake_name_string_id = get_uuid()
    intake_name_translation = LangVersionOrmV2(
        string_id=intake_name_string_id,
        lang="English",
        text="Patient Intake Form",
    )
    db.session.add(intake_name_translation)

    # Add French translation
    intake_name_translation_fr = LangVersionOrmV2(
        string_id=intake_name_string_id,
        lang="French",
        text="Formulaire d'admission du patient",
    )
    db.session.add(intake_name_translation_fr)

    intake_classification = FormClassificationOrmV2(
        id="fc-v2-intake",
        name_string_id=intake_name_string_id,
    )
    db.session.add(intake_classification)

    # Create "Medical History Form" classification
    history_name_string_id = get_uuid()
    history_name_translation = LangVersionOrmV2(
        string_id=history_name_string_id,
        lang="English",
        text="Medical History Form",
    )
    db.session.add(history_name_translation)

    history_name_translation_fr = LangVersionOrmV2(
        string_id=history_name_string_id,
        lang="French",
        text="Formulaire d'antécédents médicaux",
    )
    db.session.add(history_name_translation_fr)

    history_classification = FormClassificationOrmV2(
        id="fc-v2-history",
        name_string_id=history_name_string_id,
    )
    db.session.add(history_classification)

    db.session.commit()
    print("Created form classifications V2")


def create_form_template_v2():
    """Create sample form templates V2 with categories and questions"""
    if crud.read(FormTemplateOrmV2, id="ft-v2-intake-v1") is not None:
        return

    create_form_classification_v2()

    intake_classification = crud.read(
        FormClassificationOrmV2, id="fc-v2-intake")

    intake_template_v1 = FormTemplateOrmV2(
        id="ft-v2-intake-v1",
        form_classification_id=intake_classification.id,
        version=1,
        archived=False,
    )
    db.session.add(intake_template_v1)
    db.session.flush()

    # Category 1: basic info
    cat1_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=cat1_string_id, lang="English", text="Basic Information"
            ),
            LangVersionOrmV2(
                string_id=cat1_string_id, lang="French", text="Informations de base"
            ),
        ]
    )

    category1 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-cat-basic",
        form_template_id=intake_template_v1.id,
        order=0,
        question_type=QuestionTypeEnum.CATEGORY,
        question_string_id=cat1_string_id,
        required=False,
        category_index=None,
    )
    db.session.add(category1)

    # Q1: Patient Name
    q1_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q1_string_id,
                lang="English",
                text="What is the patient's full name?",
            ),
            LangVersionOrmV2(
                string_id=q1_string_id,
                lang="French",
                text="Quel est le nom complet du patient?",
            ),
        ]
    )
    question1 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-name",
        form_template_id=intake_template_v1.id,
        order=1,
        question_type=QuestionTypeEnum.STRING,
        question_string_id=q1_string_id,
        user_question_id="patient_full_name",
        required=True,
        string_max_length=100,
        category_index=category1.order,
    )
    db.session.add(question1)

    # Q2: Age
    q2_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q2_string_id,
                lang="English",
                text="What is the patient's age?",
            ),
            LangVersionOrmV2(
                string_id=q2_string_id, lang="French", text="Quel est l'âge du patient?"
            ),
        ]
    )
    question2 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-age",
        form_template_id=intake_template_v1.id,
        order=2,
        question_type=QuestionTypeEnum.INTEGER,
        question_string_id=q2_string_id,
        user_question_id="patient_age",
        required=True,
        num_min=0,
        num_max=150,
        units="years",
        category_index=category1.order,
    )
    db.session.add(question2)

    # Q3: Sex
    q3_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q3_string_id,
                lang="English",
                text="What is the patient's sex?",
            ),
            LangVersionOrmV2(
                string_id=q3_string_id,
                lang="French",
                text="Quel est le sexe du patient?",
            ),
        ]
    )

    mc_male_id, mc_female_id, mc_other_id = get_uuid(), get_uuid(), get_uuid()
    mc_options = [
        (mc_male_id, "Male", "Homme"),
        (mc_female_id, "Female", "Femme"),
        (mc_other_id, "Other", "Autre"),
    ]
    for opt_id, en, fr in mc_options:
        db.session.add(LangVersionOrmV2(
            string_id=opt_id, lang="English", text=en))
        db.session.add(LangVersionOrmV2(
            string_id=opt_id, lang="French", text=fr))

    question3 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-sex",
        form_template_id=intake_template_v1.id,
        order=3,
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
        question_string_id=q3_string_id,
        user_question_id="patient_sex",
        mc_options=json.dumps([mc_male_id, mc_female_id, mc_other_id]),
        required=True,
        category_index=category1.order,
    )
    db.session.add(question3)

    # Q4: Date of Birth
    q4_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q4_string_id,
                lang="English",
                text="What is the patient's date of birth?",
            ),
            LangVersionOrmV2(
                string_id=q4_string_id,
                lang="French",
                text="Quelle est la date de naissance du patient?",
            ),
        ]
    )
    question4 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-dob",
        form_template_id=intake_template_v1.id,
        order=4,
        question_type=QuestionTypeEnum.DATE,
        question_string_id=q4_string_id,
        user_question_id="patient_dob",
        required=False,
        allow_future_dates=False,
        allow_past_dates=True,
        category_index=category1.order,
    )
    db.session.add(question4)

    # Category 2: vitals
    cat2_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(string_id=cat2_string_id,
                             lang="English", text="Vitals"),
            LangVersionOrmV2(
                string_id=cat2_string_id, lang="French", text="Signes vitaux"
            ),
        ]
    )

    category2 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-cat-vitals",
        form_template_id=intake_template_v1.id,
        order=5,
        question_type=QuestionTypeEnum.CATEGORY,
        question_string_id=cat2_string_id,
        required=False,
        category_index=None,
    )
    db.session.add(category2)

    # Q5: Blood Pressure
    q5_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q5_string_id,
                lang="English",
                text="What is the patient's systolic blood pressure?",
            ),
            LangVersionOrmV2(
                string_id=q5_string_id,
                lang="French",
                text="Quelle est la pression artérielle systolique du patient?",
            ),
        ]
    )
    question5 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-bp-systolic",
        form_template_id=intake_template_v1.id,
        order=6,
        question_type=QuestionTypeEnum.INTEGER,
        question_string_id=q5_string_id,
        user_question_id="systolic_bp",
        required=True,
        num_min=40.0,
        num_max=300.0,
        units="mmHg",
        category_index=category2.order,
    )
    db.session.add(question5)

    # Category 3: symptoms and notes
    cat3_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=cat3_string_id, lang="English", text="Symptoms and Notes"
            ),
            LangVersionOrmV2(
                string_id=cat3_string_id, lang="French", text="Symptômes et notes"
            ),
        ]
    )

    category3 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-cat-symptoms",
        form_template_id=intake_template_v1.id,
        order=7,
        question_type=QuestionTypeEnum.CATEGORY,
        question_string_id=cat3_string_id,
        required=False,
        category_index=None,
    )
    db.session.add(category3)

    # Q6: Symptoms
    q6_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q6_string_id,
                lang="English",
                text="What symptoms is the patient experiencing? (Select all that apply)",
            ),
            LangVersionOrmV2(
                string_id=q6_string_id,
                lang="French",
                text="Quels symptômes le patient présente-t-il? (Sélectionner tout ce qui s'applique)",
            ),
        ]
    )

    # MC Options
    symptoms = [
        ("Headache", "Mal de tête"),
        ("Fever", "Fièvre"),
        ("Nausea", "Nausée"),
        ("Dizziness", "Étourdissement"),
        ("None", "Aucun"),
    ]
    mc_symptom_ids = []
    for en, fr in symptoms:
        sid = get_uuid()
        mc_symptom_ids.append(sid)
        db.session.add(LangVersionOrmV2(
            string_id=sid, lang="English", text=en))
        db.session.add(LangVersionOrmV2(string_id=sid, lang="French", text=fr))

    question6 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-symptoms",
        form_template_id=intake_template_v1.id,
        order=8,
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
        question_string_id=q6_string_id,
        user_question_id="patient_symptoms",
        mc_options=json.dumps(mc_symptom_ids),
        required=True,
        has_comment_attached=True,
        category_index=category3.order,
    )
    db.session.add(question6)

    # Q7: Additional Notes
    q7_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q7_string_id,
                lang="English",
                text="Additional notes about the patient:",
            ),
            LangVersionOrmV2(
                string_id=q7_string_id,
                lang="French",
                text="Notes supplémentaires sur le patient:",
            ),
        ]
    )
    question7 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-notes",
        form_template_id=intake_template_v1.id,
        order=9,
        question_type=QuestionTypeEnum.STRING,
        question_string_id=q7_string_id,
        user_question_id="additional_notes",
        required=False,
        string_max_length=500,
        string_max_lines=5,
        category_index=category3.order,
    )
    db.session.add(question7)

    db.session.commit()
    print("Created form template V2 (Patient Intake v1)")


def create_form_template_v2_version2():
    if crud.read(FormTemplateOrmV2, id="ft-v2-intake-v2") is not None:
        return

    create_form_template_v2()

    intake_classification = crud.read(
        FormClassificationOrmV2, id="fc-v2-intake")

    # Archive previous template
    previous_template = crud.read(
        FormTemplateOrmV2,
        form_classification_id=intake_classification.id,
        archived=False,
    )
    if previous_template:
        previous_template.archived = True

    intake_template_v2 = FormTemplateOrmV2(
        id="ft-v2-intake-v2",
        form_classification_id=intake_classification.id,
        version=2,
        archived=False,
    )
    db.session.add(intake_template_v2)
    db.session.flush()

    category_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=category_string_id, lang="English", text="Patient Information"
            ),
            LangVersionOrmV2(
                string_id=category_string_id,
                lang="French",
                text="Informations sur le patient",
            ),
        ]
    )

    category_question = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-category-info",
        form_template_id=intake_template_v2.id,
        order=0,
        question_type=QuestionTypeEnum.CATEGORY,
        question_string_id=category_string_id,
        required=False,
        category_index=0,
    )
    db.session.add(category_question)

    # Reuse questions 1-6 from v1
    v1_template = crud.read(FormTemplateOrmV2, id="ft-v2-intake-v1")
    v1_questions = crud.read_all(
        FormQuestionTemplateOrmV2,
        form_template_id=v1_template.id,
    )

    for idx, old_q in enumerate(v1_questions, start=1):  # start after category
        new_question = FormQuestionTemplateOrmV2(
            id=f"{old_q.id}-v2",
            form_template_id=intake_template_v2.id,
            order=idx,
            question_type=old_q.question_type,
            question_string_id=old_q.question_string_id,
            user_question_id=old_q.user_question_id,
            mc_options=old_q.mc_options,
            required=old_q.required,
            has_comment_attached=old_q.has_comment_attached,
            category_index=category_question.order,  # under "Patient Information"
            visible_condition=old_q.visible_condition,
            units=old_q.units,
            num_min=old_q.num_min,
            num_max=old_q.num_max,
            string_max_length=old_q.string_max_length,
            string_max_lines=old_q.string_max_lines,
            allow_future_dates=old_q.allow_future_dates,
            allow_past_dates=old_q.allow_past_dates,
        )
        db.session.add(new_question)

    # Add new question (Emergency contact)
    q8_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q8_string_id,
                lang="English",
                text="Emergency contact phone number:",
            ),
            LangVersionOrmV2(
                string_id=q8_string_id,
                lang="French",
                text="Numéro de téléphone d'urgence:",
            ),
        ]
    )

    question8 = FormQuestionTemplateOrmV2(
        id="fq-v2-intake-emergency-contact",
        form_template_id=intake_template_v2.id,
        order=len(v1_questions) + 1,
        question_type=QuestionTypeEnum.STRING,
        question_string_id=q8_string_id,
        user_question_id="emergency_contact_phone",
        required=False,
        string_max_length=20,
        category_index=category_question.order,
    )
    db.session.add(question8)

    db.session.commit()
    print("Created form template V2 (Patient Intake v2).")


def create_followup_form_template_v2():
    if crud.read(FormTemplateOrmV2, id="ft-v2-followup-v1") is not None:
        return

    followup_classification = crud.read(
        FormClassificationOrmV2, id="fc-v2-followup")
    if not followup_classification:
        followup_name_string_id = get_uuid()
        db.session.add_all(
            [
                LangVersionOrmV2(
                    string_id=followup_name_string_id,
                    lang="English",
                    text="Follow-Up Visit Form",
                ),
                LangVersionOrmV2(
                    string_id=followup_name_string_id,
                    lang="French",
                    text="Formulaire de visite de suivi",
                ),
            ]
        )
        followup_classification = FormClassificationOrmV2(
            id="fc-v2-followup",
            name_string_id=followup_name_string_id,
        )
        db.session.add(followup_classification)
        db.session.flush()

    # Create Template
    followup_template = FormTemplateOrmV2(
        id="ft-v2-followup-v1",
        form_classification_id=followup_classification.id,
        version=1,
        archived=False,
    )
    db.session.add(followup_template)
    db.session.flush()

    category_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=category_string_id, lang="English", text="Follow-Up Details"
            ),
            LangVersionOrmV2(
                string_id=category_string_id, lang="French", text="Détails du suivi"
            ),
        ]
    )

    category_question = FormQuestionTemplateOrmV2(
        id="fq-v2-followup-category",
        form_template_id=followup_template.id,
        order=0,
        question_type=QuestionTypeEnum.CATEGORY,
        question_string_id=category_string_id,
        category_index=0,
    )
    db.session.add(category_question)

    # Question 1
    q1_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q1_string_id,
                lang="English",
                text="How is the patient feeling today?",
            ),
            LangVersionOrmV2(
                string_id=q1_string_id,
                lang="French",
                text="Comment le patient se sent-il aujourd'hui?",
            ),
        ]
    )

    q1 = FormQuestionTemplateOrmV2(
        id="fq-v2-followup-feeling",
        form_template_id=followup_template.id,
        order=1,
        question_type=QuestionTypeEnum.STRING,
        question_string_id=q1_string_id,
        user_question_id="patient_feeling",
        required=True,
        string_max_length=200,
        category_index=category_question.order,
    )
    db.session.add(q1)

    # Question 2
    q2_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q2_string_id,
                lang="English",
                text="Has the patient developed any new symptoms?",
            ),
            LangVersionOrmV2(
                string_id=q2_string_id,
                lang="French",
                text="Le patient a-t-il développé de nouveaux symptômes?",
            ),
        ]
    )

    q2 = FormQuestionTemplateOrmV2(
        id="fq-v2-followup-new-symptoms",
        form_template_id=followup_template.id,
        order=2,
        question_type=QuestionTypeEnum.STRING,
        question_string_id=q2_string_id,
        user_question_id="new_symptoms",
        required=False,
        string_max_length=300,
        category_index=category_question.order,
    )
    db.session.add(q2)

    # Question 3 (MC)
    q3_string_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(
                string_id=q3_string_id,
                lang="English",
                text="Has medication changed since last visit?",
            ),
            LangVersionOrmV2(
                string_id=q3_string_id,
                lang="French",
                text="Le traitement a-t-il changé depuis la dernière visite?",
            ),
        ]
    )

    yes_id = get_uuid()
    no_id = get_uuid()
    db.session.add_all(
        [
            LangVersionOrmV2(string_id=yes_id, lang="English", text="Yes"),
            LangVersionOrmV2(string_id=yes_id, lang="French", text="Oui"),
            LangVersionOrmV2(string_id=no_id, lang="English", text="No"),
            LangVersionOrmV2(string_id=no_id, lang="French", text="Non"),
        ]
    )

    q3 = FormQuestionTemplateOrmV2(
        id="fq-v2-followup-med-change",
        form_template_id=followup_template.id,
        order=3,
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
        question_string_id=q3_string_id,
        user_question_id="medication_changed",
        mc_options=json.dumps([yes_id, no_id]),
        required=True,
        category_index=category_question.order,
    )
    db.session.add(q3)

    db.session.commit()
    print("Created Follow-Up Visit form template V2.")


def create_form_submission_v2(patient_id: str, user_id: int):
    """Create sample form submissions V2"""
    submission_id = f"fs-v2-{patient_id}"
    if crud.read(FormSubmissionOrmV2, id=submission_id) is not None:
        return

    create_form_template_v2()

    # Get the latest template
    template = crud.read(
        FormTemplateOrmV2,
        form_classification_id="fc-v2-intake",
        archived=False,
    )

    if not template:
        print("No template found for submission")
        return

    # Create submission
    submission = FormSubmissionOrmV2(
        id=submission_id,
        form_template_id=template.id,
        patient_id=patient_id,
        user_id=user_id,
        lang="English",
    )
    db.session.add(submission)
    db.session.flush()

    # Get questions for this template
    questions = crud.read_all(
        FormQuestionTemplateOrmV2, form_template_id=template.id)

    # Create sample answers
    sample_answers = {
        "patient_full_name": {"text": "Jane Doe"},
        "patient_age": {"number": 32},
        "patient_sex": {"mc_id_array": [1]},  # Female (index 1)
        "patient_dob": {"date": "1993-05-15"},
        "systolic_bp": {"number": 118.5},
        "patient_symptoms": {
            "mc_id_array": [0, 2],
            "comment": "Mild symptoms, started yesterday",
        },
        "additional_notes": {
            "text": "Patient is responsive and alert. No immediate concerns."
        },
    }

    for question in questions:
        if question.user_question_id in sample_answers:
            answer_data = sample_answers[question.user_question_id]
            answer = FormAnswerOrmV2(
                id=f"fa-v2-{submission_id}-{question.user_question_id}",
                question_id=question.id,
                form_submission_id=submission.id,
                answer=json.dumps(answer_data),
            )
            db.session.add(answer)

    db.session.commit()
    print(f"Created form submission V2 for patient {patient_id}")


def seed_forms_v2():
    """Seed all V2 form data"""
    print("\nSeeding Forms V2 (updated)")
    create_form_classification_v2()
    create_form_template_v2()
    create_form_template_v2_version2()
    create_followup_form_template_v2()

    # Create submissions for test patients if they exist
    test_patient_ids = ["49300028161", "49300028162", "49300028163"]
    for patient_id in test_patient_ids:
        patient = crud.read(PatientOrm, id=patient_id)
        if patient:
            create_form_submission_v2(patient_id, 3)  # user_id 3

    print("Finished seeding Forms V2\n")


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
        db.session.add(RelayServerPhoneNumberOrm(**curr_num))
        db.session.commit()


def create_simple_workflow_classification():
    classification_id = "wc-simple-1"
    if crud.read(WorkflowClassificationOrm, id=classification_id) is not None:
        return None

    workflow_classification = {
        "id": classification_id,
        "name": "Get Patient Name Workflow",
    }

    workflow_classification_orm = WorkflowClassificationOrm(
        **workflow_classification)

    db.session.add(workflow_classification_orm)
    db.session.commit()

    return workflow_classification["id"]


def create_simple_workflow_template(
    workflow_template_id, form_template_id, num_steps=3
):
    # workflow_template_id = "workflow-template-simple-1"
    if crud.read(WorkflowTemplateOrm, id=workflow_template_id) is not None:
        return

    classification_id = create_simple_workflow_classification()

    workflow_template = {
        "id": workflow_template_id,
        "description": "Collect name from patient",
        "archived": False,
        "starting_step_id": f"{workflow_template_id}-step-1",
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "V1",
        "classification_id": classification_id,
    }

    classification = crud.read(WorkflowClassificationOrm, id=classification_id)
    workflow_template_orm = WorkflowTemplateOrm(
        classification=classification, **workflow_template
    )

    for step_number in range(1, num_steps + 1):
        step = {
            "id": f"{workflow_template_id}-step-{step_number}",
            "name": "Get Patient Name",
            "description": "Enter the patient's name",
            "expected_completion": get_current_time()
            + 86400,  # Expected completion is 24 hours after this step was created
            "last_edited": get_current_time(),
            "form_id": form_template_id,
            "workflow_template_id": workflow_template["id"],
        }

        form_template_orm = crud.read(FormTemplateOrm, id=form_template_id)
        step_orm = WorkflowTemplateStepOrm(form=form_template_orm, **step)

        # Add branch if not last step
        if step_number != num_steps:
            branch = {
                "id": f"{workflow_template_id}-step-{step_number}-branch",
                "target_step_id": f"{workflow_template_id}-step-{step_number+1}",
                "step_id": step["id"],
                "condition_id": None,
                "condition": None,
            }

            branch_orm = WorkflowTemplateStepBranchOrm(**branch)
            step_orm.branches.append(branch_orm)

        workflow_template_orm.steps.append(step_orm)

    db.session.add(workflow_template_orm)
    db.session.commit()


def create_simple_workflow_template_with_branching(
    workflow_template_id, form_template_id
):
    NUM_STEPS = 6
    if crud.read(WorkflowTemplateOrm, id=workflow_template_id) is not None:
        return

    classification_id = create_simple_workflow_classification()

    workflow_template = {
        "id": workflow_template_id,
        "description": "Collect name from patient",
        "archived": False,
        "starting_step_id": f"{workflow_template_id}-step-1",
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "V1",
        "classification_id": classification_id,
    }

    classification = crud.read(WorkflowClassificationOrm, id=classification_id)
    workflow_template_orm = WorkflowTemplateOrm(
        classification=classification, **workflow_template
    )

    db.session.add(workflow_template_orm)
    db.session.flush()

    steps_dict = {}

    paths = [
        ["step-1", "step-3", "step-5"],
        ["step-1", "step-2", "step-4", "step-6"],
        ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6"],
    ]

    for step_number in range(1, NUM_STEPS + 1):
        step_id = f"{workflow_template_id}-step-{step_number}"
        step_data = {
            "id": step_id,
            "name": f"Step {step_number}",
            "description": "Enter the patient's name",
            "expected_completion": get_current_time() + 86400,
            "last_edited": get_current_time(),
            "form_id": form_template_id,
            "workflow_template_id": workflow_template_id,
        }
        form_template_orm = crud.read(FormTemplateOrm, id=form_template_id)
        steps_dict[step_id] = WorkflowTemplateStepOrm(
            form=form_template_orm, **step_data
        )

    for path in paths:
        for i in range(len(path) - 1):
            source_step_id = f"{workflow_template_id}-{path[i]}"
            target_step_id = f"{workflow_template_id}-{path[i+1]}"
            branch_id = f"{source_step_id}-to-{path[i+1]}"

            source_step = steps_dict[source_step_id]

            existing_branch_ids = {b.id for b in source_step.branches}

            # Only add branch if it doesn't already exist
            if branch_id not in existing_branch_ids:
                branch_orm = WorkflowTemplateStepBranchOrm(
                    id=branch_id,
                    step_id=source_step_id,
                    target_step_id=target_step_id,
                    condition_id=None,
                    condition=None,
                )
                source_step.branches.append(branch_orm)

    workflow_template_orm.steps.extend(steps_dict.values())

    db.session.add(workflow_template_orm)
    db.session.commit()


def create_simple_workflow_template_step_form_classification():
    id = "wt-simple-1-form-classification"
    if crud.read(FormClassificationOrm, id=id) is not None:
        return None

    simple_form_classification = {
        "id": id,
        "name": "Patient Name Form",
    }

    simple_form_classification_orm = FormClassificationOrm(
        **simple_form_classification)

    db.session.add(simple_form_classification_orm)
    db.session.commit()

    return id


def create_simple_workflow_template_step_form():
    form_template_id = "workflow-form-template"
    if crud.read(FormTemplateOrm, id=form_template_id) is not None:
        return None

    # Add classification for form to DB
    classification_id = create_simple_workflow_template_step_form_classification()
    form_classification_orm = crud.read(
        FormClassificationOrm, id=classification_id)

    # Set up form template associated with workflow
    form_template = {
        "id": form_template_id,
        "version": "V1",
    }

    form_template_orm = FormTemplateOrm(
        classification=form_classification_orm, **form_template
    )

    # Create question associated with form
    question = {
        "id": f"{form_template_id}-question",
        "category_index": None,
        "question_index": 0,
        "is_blank": True,
        "question_type": "STRING",
        "required": True,
        "allow_future_dates": True,
        "allow_past_dates": True,
        "num_min": None,
        "num_max": None,
        "string_max_length": None,
        "units": None,
        "visible_condition": "[]",
        "string_max_lines": None,
    }

    question_orm = QuestionOrm(**question)

    # Add question to form template and
    form_template_orm.questions.append(question_orm)

    # Add form template to DB
    db.session.add(form_template_orm)
    db.session.commit()

    # Add language to question and add question to DB
    lang_version = {
        "id": 104,
        "lang": "English",
        "question_text": "Enter the Patient's Name",
        "question_id": question["id"],
    }

    db.session.add(QuestionLangVersionOrm(**lang_version))
    db.session.commit()

    return form_template["id"]


def create_complex_workflow_classification():
    if (
        crud.read(
            WorkflowClassificationOrm, id="papagaio_study_workflow_classification"
        )
        is not None
    ):
        return

    papagaio_study_workflow_classification = {
        "id": "papagaio_study_workflow_classification",
        "name": "PAPAGAIO Research Study",
    }

    papagaio_study_workflow_classification_orm = WorkflowClassificationOrm(
        **papagaio_study_workflow_classification
    )
    db.session.add(papagaio_study_workflow_classification_orm)
    db.session.commit()


def create_complex_workflow_template():
    if (
        crud.read(WorkflowTemplateOrm, id="papagaio_study_workflow_template")
        is not None
    ):
        return

    create_complex_workflow_classification()

    papagaio_study_workflow_template = {
        "id": "papagaio_study_workflow_template",
        "description": "PAPAGAIO is an NIHR Global Health Research Group focussed on reducing maternal and perinatal"
        "mortality and morbidity from pre-eclampsia, across low- and middle-income countries",
        "archived": True,
        "starting_step_id": "prerequisites_template_step",
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "V1",
        "classification_id": "papagaio_study_workflow_classification",
    }

    papagaio_study_workflow_classification_orm = crud.read(
        WorkflowClassificationOrm, id="papagaio_study_workflow_classification"
    )
    papagaio_study_workflow_template_orm = WorkflowTemplateOrm(
        classification=papagaio_study_workflow_classification_orm,
        **papagaio_study_workflow_template,
    )

    create_complex_workflow_template_steps()

    for step in crud.read_all(
        WorkflowTemplateStepOrm, workflow_template_id="papagaio_study_workflow_template"
    ):
        papagaio_study_workflow_template_orm.steps.append(step)

    db.session.add(papagaio_study_workflow_template_orm)
    db.session.commit()


def create_complex_workflow_template_steps():
    create_complex_workflow_template_step_form_classifications()
    create_complex_workflow_template_step_forms()
    create_complex_workflow_template_step_form_questions()

    if crud.read(WorkflowTemplateStepOrm, id="prerequisites_template_step") is None:
        prerequisites_template_step = {
            "id": "prerequisites_template_step",
            "name": "prerequisites_step",
            "description": "Prerequisites Step",
            "expected_completion": None,
            "last_edited": get_current_time(),
            "form_id": "prerequisites_form_template",
            "workflow_template_id": "papagaio_study_workflow_template",
        }

        prerequisites_template_step_branch = {
            "id": "prerequisites_template_step_branch",
            "target_step_id": "papagaio_consent_template_step",
            "step_id": "prerequisites_template_step",
            "condition_id": None,
            "condition": None,
        }

        create_workflow_template_step_with_form_and_branches(
            prerequisites_template_step,
            "prerequisites_form_template",
            [prerequisites_template_step_branch],
        )

    if crud.read(WorkflowTemplateStepOrm, id="papagaio_consent_template_step") is None:
        papagaio_consent_template_step = {
            "id": "papagaio_consent_template_step",
            "name": "papagaio_consent_step",
            "description": "PAPAGAIO Consent Step",
            "expected_completion": None,
            "last_edited": get_current_time(),
            "form_id": "papagaio_consent_form_template",
            "workflow_template_id": "papagaio_study_workflow_template",
        }

        papagaio_consent_template_step_branch = {
            "id": "papagaio_consent_template_step_branch",
            "target_step_id": "papagaio_randomized_treatment_template_step",
            "step_id": "papagaio_consent_template_step",
            "condition_id": None,
            "condition": None,
        }

        create_workflow_template_step_with_form_and_branches(
            papagaio_consent_template_step,
            "papagaio_consent_form_template",
            [papagaio_consent_template_step_branch],
        )

    if (
        crud.read(
            WorkflowTemplateStepOrm, id="papagaio_randomized_treatment_template_step"
        )
        is None
    ):
        papagaio_randomized_treatment_template_step = {
            "id": "papagaio_randomized_treatment_template_step",
            "name": "papagaio_randomized_treatment_step",
            "description": "PAPAGAIO Randomized Treatment Step",
            "expected_completion": None,
            "last_edited": get_current_time(),
            "form_id": "papagaio_randomized_treatment_plan_form_template",
            "workflow_template_id": "papagaio_study_workflow_template",
        }

        papagaio_randomized_treatment_template_step_branch = {
            "id": "papagaio_randomized_treatment_template_step_branch",
            "target_step_id": "papagaio_observation_treatment_template_step",
            "step_id": "papagaio_randomized_treatment_template_step",
            "condition_id": None,
            "condition": None,
        }

        create_workflow_template_step_with_form_and_branches(
            papagaio_randomized_treatment_template_step,
            "papagaio_randomized_treatment_plan_form_template",
            [papagaio_randomized_treatment_template_step_branch],
        )

    if (
        crud.read(
            WorkflowTemplateStepOrm, id="papagaio_observation_treatment_template_step"
        )
        is None
    ):
        papagaio_observation_treatment_template_step = {
            "id": "papagaio_observation_treatment_template_step",
            "name": "papagaio_observation_treatment_step",
            "description": "PAPAGAIO Observation Treatment Step",
            "expected_completion": None,
            "last_edited": get_current_time(),
            "form_id": "papagaio_observation_treatment_plan_form_template",
            "workflow_template_id": "papagaio_study_workflow_template",
        }

        papagaio_observation_treatment_template_step_branch = {
            "id": "papagaio_obs_treatment_template_step_branch",
            "target_step_id": None,
            "step_id": "papagaio_observation_treatment_template_step",
            "condition_id": None,
            "condition": None,
        }

        create_workflow_template_step_with_form_and_branches(
            papagaio_observation_treatment_template_step,
            "papagaio_observation_treatment_plan_form_template",
            [papagaio_observation_treatment_template_step_branch],
        )


def create_workflow_template_step_with_form_and_branches(
    template_step: dict, form_id: str, template_step_branches: List[dict]
) -> None:
    form_template_orm = crud.read(FormTemplateOrm, id=form_id)
    template_step_orm = WorkflowTemplateStepOrm(
        form=form_template_orm, **template_step)

    for branch in template_step_branches:
        template_step_branch_orm = WorkflowTemplateStepBranchOrm(**branch)
        template_step_orm.branches.append(template_step_branch_orm)

    db.session.add(template_step_orm)
    db.session.commit()


def create_complex_workflow_template_step_form_classifications():
    if crud.read(FormClassificationOrm, id="prerequisites_classification") is None:
        prerequisites_classification = {
            "id": "prerequisites_classification",
            "name": "Prerequisites Classification",
        }
        prerequisites_classification_orm = FormClassificationOrm(
            **prerequisites_classification
        )
        db.session.add(prerequisites_classification_orm)

    if crud.read(FormClassificationOrm, id="papagaio_consent_classification") is None:
        papagaio_consent_classification = {
            "id": "papagaio_consent_classification",
            "name": "PAPAGAIO Consent Classification",
        }
        papagaio_consent_classification_orm = FormClassificationOrm(
            **papagaio_consent_classification
        )
        db.session.add(papagaio_consent_classification_orm)

    if (
        crud.read(
            FormClassificationOrm,
            id="papagaio_randomized_treatment_plan_classification",
        )
        is None
    ):
        randomized_treatment_plan_classification = {
            "id": "papagaio_randomized_treatment_plan_classification",
            "name": "Randomized Treatment plan Classification",
        }
        randomized_treatment_plan_classification_orm = FormClassificationOrm(
            **randomized_treatment_plan_classification
        )
        db.session.add(randomized_treatment_plan_classification_orm)

    if (
        crud.read(
            FormClassificationOrm,
            id="papagaio_observation_treatment_plan_classification",
        )
        is None
    ):
        papagaio_observation_treatment_plan_classification = {
            "id": "papagaio_observation_treatment_plan_classification",
            "name": "Observation Treatment Plan Classification",
        }
        papagaio_observation_treatment_plan_classification_orm = FormClassificationOrm(
            **papagaio_observation_treatment_plan_classification
        )
        db.session.add(papagaio_observation_treatment_plan_classification_orm)

    db.session.commit()


def create_complex_workflow_template_step_forms():
    create_complex_workflow_template_step_form_classifications()

    if crud.read(FormTemplateOrm, id="prerequisites_form_template") is None:
        prerequisites_form_template = {
            "id": "prerequisites_form_template",
            "version": "V1",
        }

        create_form_template_for_workflow(
            prerequisites_form_template,
            "prerequisites_classification",
            [
                "prerequisites_question1",
                "prerequisites_question2",
                "prerequisites_question3",
            ],
        )

    if crud.read(FormTemplateOrm, id="papagaio_consent_form_template") is None:
        papagaio_consent_form_template = {
            "id": "papagaio_consent_form_template",
            "version": "V1",
        }

        create_form_template_for_workflow(
            papagaio_consent_form_template,
            "papagaio_consent_classification",
            ["papagaio_consent_question"],
        )

    if (
        crud.read(
            FormTemplateOrm, id="papagaio_randomized_treatment_plan_form_template"
        )
        is None
    ):
        papagaio_randomized_treatment_plan_form_template = {
            "id": "papagaio_randomized_treatment_plan_form_template",
            "version": "V1",
        }

        create_form_template_for_workflow(
            papagaio_randomized_treatment_plan_form_template,
            "papagaio_randomized_treatment_plan_classification",
            ["papagaio_randomized_treatment_plan_question"],
        )

    if (
        crud.read(
            FormTemplateOrm, id="papagaio_observation_treatment_plan_form_template"
        )
        is None
    ):
        papagaio_observation_treatment_plan_form_template = {
            "id": "papagaio_observation_treatment_plan_form_template",
            "version": "V1",
        }

        create_form_template_for_workflow(
            papagaio_observation_treatment_plan_form_template,
            "papagaio_observation_treatment_plan_classification",
            ["papagaio_observation_treatment_plan_question"],
        )


def create_form_template_for_workflow(
    workflow_template_step_form_template: dict,
    classification_id: str,
    question_ids: List[str],
):
    """Seeds the DB with an example form template used in a workflow template"""
    classification_orm = crud.read(FormClassificationOrm, id=classification_id)
    form_template_orm = FormTemplateOrm(
        classification=classification_orm, **workflow_template_step_form_template
    )
    create_complex_workflow_template_step_form_questions()

    for question_id in question_ids:
        question = crud.read(QuestionOrm, id=question_id)
        form_template_orm.questions.append(question)

    db.session.add(form_template_orm)
    db.session.commit()


def create_complex_workflow_template_step_form_questions():
    if crud.read(QuestionOrm, id="prerequisites_question1") is None:
        prerequisites_question1 = {
            "id": "prerequisites_question1",
            "category_index": None,
            "question_index": 0,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": '[{"mcId": 0, "opt": "Yes" }, {"mcId": 1, "opt": "No"}]',
        }

        prerequisites_lang_version1 = {
            "id": 105,
            "lang": "English",
            "question_text": "Is there any indication for immediate delivery?",
            "question_id": "prerequisites_question1",
        }

        prerequisites_question1_orm = QuestionOrm(**prerequisites_question1)
        db.session.add(prerequisites_question1_orm)
        db.session.add(QuestionLangVersionOrm(**prerequisites_lang_version1))

    if crud.read(QuestionOrm, id="prerequisites_question2") is None:
        prerequisites_question2 = {
            "id": "prerequisites_question2",
            "category_index": None,
            "question_index": 1,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": '[{"mcId": 0, "opt": "Yes" }, {"mcId": 1, "opt": "No"}]',
        }

        prerequisites_lang_version2 = {
            "id": 106,
            "lang": "English",
            "question_text": "Has the patient decided to deliver in the next 48 hours?",
            "question_id": "prerequisites_question2",
        }

        prerequisites_question2_orm = QuestionOrm(**prerequisites_question2)
        db.session.add(prerequisites_question2_orm)
        db.session.add(QuestionLangVersionOrm(**prerequisites_lang_version2))

    if crud.read(QuestionOrm, id="prerequisites_question3") is None:
        prerequisites_question3 = {
            "id": "prerequisites_question3",
            "category_index": None,
            "question_index": 2,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": '[{"mcId": 0, "opt": "Yes" }, {"mcId": 1, "opt": "No"}]',
        }

        prerequisites_lang_version3 = {
            "id": 107,
            "lang": "English",
            "question_text": "Does the patient have the capacity to provide informed consent?",
            "question_id": "prerequisites_question3",
        }

        prerequisites_question3_orm = QuestionOrm(**prerequisites_question3)
        db.session.add(prerequisites_question3_orm)
        db.session.add(QuestionLangVersionOrm(**prerequisites_lang_version3))

    if crud.read(QuestionOrm, id="papagaio_consent_question") is None:
        papagaio_consent_question = {
            "id": "papagaio_consent_question",
            "category_index": None,
            "question_index": 3,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": "["
            '{"mcId": 0, "opt": "Give Consent"}'
            ", "
            '{"mcId": 1, "opt": "Deny Consent"}'
            "]",
        }

        papagaio_consent_lang_version = {
            "id": 108,
            "lang": "English",
            "question_text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
            "Vivamus blandit at eros laoreet cursus. Nunc id quam dictum, cursus felis eu, mattis sem."
            " Quisque euismod, nisl quis rhoncus blandit, diam elit ornare dui, ut posuere tortor dui "
            "at risus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce fermentum "
            "leo at est egestas rutrum. Nullam vitae nunc placerat, consectetur justo eu, lobortis "
            "diam. Nullam malesuada elit ac magna varius interdum. Nulla a malesuada turpis. Praesent "
            "hendrerit dui arcu, id fringilla nisi vulputate at. Sed eu sapien ante. Morbi dapibus mi "
            "vitae dignissim pulvinar. Proin suscipit aliquet semper.",
            "question_id": "papagaio_consent_question",
        }

        papagaio_consent_question_orm = QuestionOrm(
            **papagaio_consent_question)
        db.session.add(papagaio_consent_question_orm)
        db.session.add(QuestionLangVersionOrm(**papagaio_consent_lang_version))

    if crud.read(QuestionOrm, id="papagaio_randomized_treatment_plan_question") is None:
        papagaio_randomized_treatment_plan_question = {
            "id": "papagaio_randomized_treatment_plan_question",
            "category_index": None,
            "question_index": 4,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": "["
            '{"mcId": 0, "opt": "Observe closely for 37 weeks"}'
            ", "
            '{"mcId": 1, "opt": "Expedite delivery within 48 hours"}'
            ","
            '{"mcId": 2, "opt": "None of the options provided (This withdraws patient from the study '
            'and exits workflow"}'
            "]",
        }

        papagaio_randomized_treatment_plan_lang_version = {
            "id": 109,
            "lang": "English",
            "question_text": "The treatment plan assigned to ths patient has been randomly selected as part of the "
            "study. Each treatment plan below has an equal 50% chance of being chosen. The assigned"
            "treatment plan does not constitute a medical recommendation or an endorsement of the "
            "chosen treatment plan. \n\n The patient has been randomly assigned to the "
            "'observation' category for the randomized treatment plan.",
            "question_id": "papagaio_randomized_treatment_plan_question",
        }

        papagaio_randomized_treatment_plan_question_orm = QuestionOrm(
            **papagaio_randomized_treatment_plan_question
        )
        db.session.add(papagaio_randomized_treatment_plan_question_orm)
        db.session.add(
            QuestionLangVersionOrm(
                **papagaio_randomized_treatment_plan_lang_version)
        )

    if (
        crud.read(QuestionOrm, id="papagaio_observation_treatment_plan_question")
        is None
    ):
        papagaio_observation_treatment_plan_question = {
            "id": "papagaio_observation_treatment_plan_question",
            "category_index": None,
            "question_index": 5,
            "is_blank": True,
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
            "string_max_lines": None,
            "mc_options": "["
            '{"mcId": 0, "opt": "Treatment plan complete"}'
            ", "
            '{"mcId": 1, "opt": "Treatment plan cancelled"}'
            ","
            '{"mcId": 2, "opt": "None of the options provided"}'
            "]",
        }

        papagaio_observation_treatment_plan_lang_version = {
            "id": 110,
            "lang": "English",
            "question_text": "This patient was randomly assigned to the 'observation category` as part of the"
            "PAPAGAIO Research Study.",
            "question_id": "papagaio_observation_treatment_plan_question",
        }

        papagaio_observation_treatment_plan_question_orm = QuestionOrm(
            **papagaio_observation_treatment_plan_question
        )
        db.session.add(papagaio_observation_treatment_plan_question_orm)
        db.session.add(
            QuestionLangVersionOrm(
                **papagaio_observation_treatment_plan_lang_version)
        )

    db.session.commit()


def create_workflow_instance(
    instance_id,
    instance_name,
    patient_id,
    workflow_template_id,
    num_steps=3,
):
    if crud.read(WorkflowInstanceOrm, id=instance_id) is None:
        workflow_instance = {
            "id": instance_id,
            "name": instance_name,
            "description": "Test Workflow Instance Description",
            "start_date": get_current_time(),
            "current_step_id": f"{instance_id}-step1",
            "last_edited": get_current_time(),
            "status": WorkflowStatusEnum.ACTIVE,
            "workflow_template_id": workflow_template_id,
            "patient_id": patient_id,
        }

        workflow_instance_orm = WorkflowInstanceOrm(**workflow_instance)

        for step_number in range(1, num_steps + 1):
            workflow_instance_step = {
                "id": f"{instance_id}-step{step_number}",
                "name": f"{instance_name} Step {step_number}",
                "description": f"{instance_name} Workflow Instance Step {step_number} Description",
                "start_date": get_current_time(),
                "triggered_by": None,
                "last_edited": get_current_time(),
                "assigned_to": 3,
                "workflow_instance_id": instance_id,
                "form_id": None,
                "workflow_template_step_id": f"{workflow_template_id}-step-{step_number}",
            }

            if step_number == 1:
                workflow_instance_step["status"] = WorkflowStepStatusEnum.ACTIVE
            else:
                workflow_instance_step["status"] = WorkflowStepStatusEnum.PENDING

            current_workflow_instance_step_orm = WorkflowInstanceStepOrm(
                **workflow_instance_step
            )

            workflow_instance_orm.steps.append(
                current_workflow_instance_step_orm)

        db.session.add(workflow_instance_orm)
        db.session.commit()


def create_workflow_instance_form(
    form_id, patient_id, form_template_id, user_id, form_classification_id, first_name
):
    if crud.read(FormOrm, id=form_id) is None:
        workflow_instance_form_question = {
            "id": f"{form_id}-form-question-1",
            "category_index": None,
            "question_index": 0,
            "is_blank": True,
            "answers": f'{{"text": "{first_name}"}}',
            "question_type": "STRING",
            "required": True,
            "allow_future_dates": True,
            "allow_past_dates": True,
            "num_min": None,
            "num_max": None,
            "string_max_length": None,
            "units": None,
            "visible_condition": "[]",
        }

        workflow_instance_form_question_orm = QuestionOrm(
            **workflow_instance_form_question
        )

        workflow_instance_form = {
            "id": form_id,
            "lang": "English",
            "name": "Patient Name Form",
            "category": "",
            "patient_id": patient_id,
            "form_template_id": form_template_id,
            "date_created": get_current_time(),
            "last_edited": get_current_time(),
            "last_edited_by": user_id,
            "form_classification_id": form_classification_id,
            "archived": False,
        }

        workflow_instance_form_orm = FormOrm(**workflow_instance_form)
        workflow_instance_form_orm.questions.append(
            workflow_instance_form_question_orm)

        db.session.add(workflow_instance_form_orm)
        db.session.commit()


def get_random_initials():
    return (
        random.choice(string.ascii_letters) +
        random.choice(string.ascii_letters)
    ).upper()


def get_random_village():
    return random.choice(village_numbers_list)


def get_random_systolic_bp():
    return random.choice(bp_systolic_list)


def get_random_diastolic_bp():
    return random.choice(bp_diastolic_list)


def get_random_heart_rate():
    return random.choice(heart_rate_list)


def get_random_health_facility_name():
    return random.choice(health_facility_list)["name"]


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
    post_fixes = ["".join([f"{randint(0, 9)}" for num in range(6)])
                  for x in range(n)]

    numbers = {}
    for i in range(n):
        numbers[area_codes[i]] = prefix + "-" + \
            str(area_codes[i]) + "-" + post_fixes[i]

    return numbers


def generate_village_numbers():
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

    patient_list = random.sample(
        range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patient_list)
    patient_list = list(map(str, patient_list))

    # Get cities
    with open("./data/seed_data/seed.json") as f:
        facility_locations = json.load(f)["locations"]

    users_list = [1, 2, 3, 4]
    village_numbers_list = generate_village_numbers()
    health_facility_list = facilities_list

    facility_type = ["HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facility_about = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]

    symptoms_list = ["HEADACHE", "BLURRED VISION",
                     "ABDO PAIN", "BLEEDING", "FEVERISH"]
    sex_list = ["FEMALE", "MALE"]
    bp_systolic_list = np.clip(np.random.normal(
        120, 35, 1000).astype(int), 50, 300)
    bp_diastolic_list = np.clip(np.random.normal(
        80, 25, 1000).astype(int), 30, 200)
    heart_rate_list = np.clip(np.random.normal(
        60, 17, 1000).astype(int), 30, 250)

    date_1 = datetime.datetime.strptime(START_DATE, "%m/%d/%Y %I:%M %p")
    date_2 = datetime.datetime.today().replace(microsecond=0)

    cli()
