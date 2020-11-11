import random
import string
import uuid
import datetime
import numpy as np
from random import randrange
from datetime import timedelta, datetime
from flask_script import Manager
from config import app, db, flask_bcrypt
from models import *
from database.ReadingRepoNew import ReadingRepo

manager = Manager(app)

# USAGE: python manage.py reset_db
@manager.command
def reset_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


# USAGE: python manage.py drop_all_tables
@manager.command
def drop_all_tables():
    db.drop_all()
    db.session.commit()


# USAGE: python manage.py seed_minimal
@manager.command
def seed_minimal(email="admin123@admin.com", password="admin123"):
    """
    Seeds the database with the minimum amount of data required for it to be functional.

    The data inserted into the database is deterministic so it is suitable for testing
    off of.

    The minimal set of data is as follows:

     - A single health facility named: H0000
     - The set of predefined user roles
     - A single admin user
    """
    print("Seeding health facility...")
    hf = {
        "healthFacilityName": "H0000",
        "healthFacilityPhoneNumber": "555-555-55555",
        "facilityType": "HOSPITAL",
        "about": "Sample health centre",
        "location": "Sample Location",
    }
    hf_schema = HealthFacilitySchema()
    db.session.add(hf_schema.load(hf))
    db.session.commit()

    print("Seeding user roles...")
    role_vht = Role(name="VHT")
    role_hcw = Role(name="HCW")
    role_admin = Role(name="ADMIN")
    role_cho = Role(name="CHO")
    db.session.add_all([role_vht, role_hcw, role_admin, role_cho])
    db.session.commit()

    print("Creating admin user...")
    create_user(email, "Admin", password, "H0000", "ADMIN")

    print("Finished seeding minimal data set")


# USAGE: python manage.py seed_test_data
@manager.command
def seed_test_data():
    """
    Seeds data for testing.

    The data inserted here should be deterministically generated to ease testing.
    """
    # Start with a minimal setup.
    seed_minimal()

    # Add the rest of the users.
    print("Creating test users...")
    create_user("hcw@hcw.com", "Brian", "hcw123", "H0000", "HCW")
    create_user("vht@vht.com", "TestVHT", "vht123", "H0000", "VHT")
    create_user("cho@cho.com", "TestCHO", "cho123", "H0000", "CHO")

    print("Creating test patients, readings, referrals...")
    create_patient_reading_referral(
        "400260", "abc-123-de2-a74a", 2, "AA", 35, "MALE", "1001"
    )
    create_patient_reading_referral(
        "204652",
        "def-456-fg3-fh5k",
        2,
        "BB",
        40,
        "FEMALE",
        "1002",
        True,
        "GESTATIONAL_AGE_UNITS_WEEKS",
        1592339808,
    )
    # TODO: Add more data here

    print("Finished seeding minimal test data")


# USAGE: python manage.py seed
@manager.command
def seed():
    # SEED health facilities
    print("Seeding health facilities...")

    healthfacility_schema = HealthFacilitySchema()
    counter = 0
    for hf in healthFacilityList:
        hf_schema = {
            "healthFacilityName": hf,
            "healthFacilityPhoneNumber": facilityPhoneNumbers[counter],
            "facilityType": facilityType[counter],
            "about": facilityAbout[counter],
            "location": facilityLocation[counter],
        }
        counter += 1
        db.session.add(healthfacility_schema.load(hf_schema))

    seed_test_data()

    print("Seeding Patients with readings and referrals...")
    # seed patients with readings and referrals
    patient_schema = PatientSchema()
    reading_schema = ReadingSchema()
    referral_schema = ReferralSchema()
    for patientId in patientList:

        # get random patient
        p1 = {
            "patientId": patientId,
            "patientName": getRandomInitials(),
            "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalTimestamp": 1587068710,
            "villageNumber": getRandomVillage(),
            "patientSex": "FEMALE",
            "isPregnant": "true",
        }
        db.session.add(patient_schema.load(p1))
        db.session.commit()

        numOfReadings = random.randint(1, 5)
        dateList = [getRandomDate() for i in range(numOfReadings)]
        dateList.sort()

        userId = getRandomUser()
        for i in range(numOfReadings):
            readingId = str(uuid.uuid4())
            healthFacilityName = getRandomHealthFacilityName()

            # get random reading(s) for patient
            r1 = {
                "userId": userId,
                "patientId": patientId,
                "dateTimeTaken": dateList[i],
                "readingId": readingId,
                "bpSystolic": getRandomBpSystolic(),
                "bpDiastolic": getRandomBpDiastolic(),
                "heartRateBPM": getRandomHeartRateBPM(),
                "symptoms": getRandomSymptoms(),
            }
            ReadingRepo().create(r1)

            if i == numOfReadings - 1 and random.choice([True, False]):
                referral1 = {
                    "patientId": patientId,
                    "readingId": readingId,
                    "dateReferred": r1["dateTimeTaken"]
                    + int(timedelta(days=10).total_seconds()),
                    "referralHealthFacilityName": healthFacilityName,
                    "comment": "She needs help!",
                }
                db.session.add(referral_schema.load(referral1))
                db.session.commit()

    print("Complete!")


def create_user(email, name, password, hf_name, role):
    """
    Creates a user in the database.
    """
    user = {
        "email": email,
        "firstName": name,
        "password": flask_bcrypt.generate_password_hash(password),
        "healthFacilityName": hf_name,
    }
    user_schema = UserSchema()
    user_role = Role.query.filter_by(name=role).first()
    user_role.users.append(user_schema.load(user, session=db.session))
    db.session.add(user_role)
    db.session.commit()


def create_patient_reading_referral(
    patientId,
    readingId,
    userId,
    name,
    age,
    sex,
    villageNum,
    isPregnant=False,
    gestAgeUnit=None,
    gestTimestamp=None,
):
    import data.crud as crud
    import data.marshal as marshal
    from models import Patient

    """
    Creates a patient in the database.
    """
    if isPregnant:
        patient = {
            "patientId": patientId,
            "patientName": name,
            "gestationalAgeUnit": gestAgeUnit,
            "gestationalTimestamp": gestTimestamp,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "true",
        }
    else:
        patient = {
            "patientId": patientId,
            "patientName": name,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "false",
        }

    reading = {
        "userId": userId,
        "patientId": patientId,
        "dateTimeTaken": 1551447833,
        "readingId": readingId,
        "bpSystolic": 50,
        "bpDiastolic": 60,
        "heartRateBPM": 70,
        "trafficLightStatus": "YELLOW_DOWN",
        "symptoms": "FEVERISH",
    }

    # health facility name based on one defined in seed_minimal()
    referral = {
        "patientId": patientId,
        "readingId": readingId,
        "dateReferred": reading["dateTimeTaken"]
        + int(timedelta(days=10).total_seconds()),
        "referralHealthFacilityName": "H0000",
        "comment": "They need help!",
    }

    reading["referral"] = referral
    patient["readings"] = [reading]
    model = marshal.unmarshal(Patient, patient)
    crud.create(model)


def getRandomInitials():
    return (
        random.choice(string.ascii_letters) + random.choice(string.ascii_letters)
    ).upper()


def getRandomVillage():
    return random.choice(villageList)


def getRandomBpSystolic():
    return random.choice(bpSystolicList)


def getRandomBpDiastolic():
    return random.choice(bpDiastolicList)


def getRandomHeartRateBPM():
    return random.choice(heartRateList)


def getRandomHealthFacilityName():
    return random.choice(healthFacilityList)


def getRandomUser():
    return random.choice(usersList)


def getRandomSymptoms():
    numOfSymptoms = random.randint(0, 4)
    if numOfSymptoms == 0:
        return ""

    symptoms = random.sample(population=symptomsList, k=numOfSymptoms)
    return ", ".join(symptoms)


def getRandomDate():
    """
    This function will return a random datetime between two datetime
    objects.
    """
    start = d1
    end = d2
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    new_date = start + timedelta(seconds=random_second)
    return int(new_date.strftime("%s"))


def getDateTime(dateStr):
    return datetime.strptime(dateStr, "%Y-%m-%dT%H:%M:%S")


if __name__ == "__main__":
    NUM_OF_PATIENTS = 100

    patientList = random.sample(range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patientList)
    patientList = list(map(str, patientList))

    usersList = [1, 2, 3, 4]
    villageList = [
        "1001",
        "1002",
        "1003",
        "1004",
        "1005",
        "1006",
        "1007",
        "1008",
        "1009",
    ]
    healthFacilityList = ["H1233", "H2555", "H3445", "H5123"]
    facilityType = ["HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facilityAbout = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]
    facilityLocation = ["District 1", "District 2", "District 3", "District 4"]
    facilityPhoneNumbers = [
        "+256-413-837484",
        "+256-223-927484",
        "+256-245-748573",
        "+256-847-0947584",
    ]
    symptomsList = ["HEADACHE", "BLURRED VISION", "ABDO PAIN", "BLEEDING", "FEVERISH"]
    sexList = ["FEMALE", "MALE"]
    bpSystolicList = list(np.random.normal(120, 35, 1000).astype(int))
    bpDiastolicList = list(np.random.normal(80, 25, 1000).astype(int))
    heartRateList = list(np.random.normal(60, 17, 1000).astype(int))

    d1 = datetime.strptime("1/1/2019 12:01 AM", "%m/%d/%Y %I:%M %p")
    d2 = datetime.today().replace(microsecond=0)
    manager.run()
