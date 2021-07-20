import random
import string
import uuid
import datetime
import time
import numpy as np
import sys
import json
from random import randrange
from datetime import timedelta, datetime
from flask_script import Manager
from config import app, db, flask_bcrypt
from models import *
from random import randint, choice
from string import ascii_lowercase, digits
import data.crud as crud
import data.marshal as marshal
import service.invariant as invariant


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
    create_health_facility("H0000")

    print("Creating admin user...")
    create_user(email, "Admin", password, "H0000", RoleEnum.ADMIN.value)

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
    print("Creating test health facilities and users...")
    create_health_facility("H1000")
    create_health_facility("H2000")
    create_user("brian@admin.com", "Brian", "brian123", "H0000", RoleEnum.ADMIN.value)
    create_user("vht@vht.com", "TestVHT", "vht123", "H0000", RoleEnum.VHT.value)
    create_user("vht2@vht.com", "TestVHT2", "vht123", "H1000", RoleEnum.VHT.value)
    create_user("hcw@hcw.com", "TestHCW", "hcw123", "H0000", RoleEnum.HCW.value)
    create_user("cho@cho.com", "TestCHO", "cho123", "H0000", RoleEnum.CHO.value)

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
        "WEEKS",
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
    create_pregnancy(
        "49300028162",
        1547341217,
        1570928417,
    )
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
    print("Finished seeding minimal test data")


# USAGE: python manage.py seed
@manager.command
def seed():
    start = time.time()

    # SEED villages
    print("Seeding Villages...")
    village_schema = VillageSchema()
    for village in villageList:
        v_schema = {
            "villageNumber": village,
        }
        db.session.add(village_schema.load(v_schema))

    # SEED health facilities
    print("Seeding health facilities...")

    healthfacility_schema = HealthFacilitySchema()
    for index, hf in enumerate(facilityLocations):
        hf_schema = {
            "healthFacilityName": getFacilityName(index),
            "healthFacilityPhoneNumber": getFacilityPhoneNumber(hf["areaCode"]),
            "facilityType": getFacilityType(),
            "about": getFacilityAbout(),
            "location": hf["city"],
        }
        db.session.add(healthfacility_schema.load(hf_schema))

    seed_test_data()

    print("Seeding Patients with readings and referrals...")
    # seed patients with readings and referrals
    patient_schema = PatientSchema()
    reading_schema = ReadingSchema()
    referral_schema = ReferralSchema()

    fnames, lnames = getNames()
    generated_names = set()
    for count, patientId in enumerate(patientList):
        # get random patient
        person = random.choice(fnames)
        name, sex = person["name"], person["sex"]
        lname = random.choice(lnames)

        while name + lname in generated_names:
            person = random.choice(fnames)
            name, sex = person["name"], person["sex"]
            lname = random.choice(lnames)

        generated_names.add(name + lname)

        if sex == SexEnum.MALE.value:
            pregnant = False
        else:
            pregnant = bool(random.getrandbits(1))

        gestational_age_unit = None
        gestational_timestamp = None
        gestational_units = [
            GestationalAgeUnitEnum.WEEKS.value,
            GestationalAgeUnitEnum.MONTHS.value,
        ]

        if sex == SexEnum.FEMALE.value and pregnant:
            gestational_age_unit = random.choice(gestational_units)
            gestational_timestamp = getRandomPregnancyDate()

        p1 = {
            "patientId": patientId,
            "patientName": name + " " + lname,
            "gestationalAgeUnit": gestational_age_unit,
            "gestationalTimestamp": gestational_timestamp,
            "villageNumber": getRandomVillage(),
            "patientSex": sex,
            "isPregnant": pregnant,
            "dob": getRandomDOB(),
            "isExactDob": bool(random.getrandbits(1)),
        }

        db.session.add(patient_schema.load(p1))
        db.session.commit()

        if pregnant:
            pregnancy_schema = PregnancySchema()
            pRecord = {
                "patientId": patientId,
                "startDate": gestational_timestamp,
                "defaultTimeUnit": gestational_age_unit,
            }
            db.session.add(pregnancy_schema.load(pRecord))
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

            r1Model = marshal.unmarshal(Reading, r1)
            crud.create(r1Model, refresh=True)

            referral_comments = [
                " needs help!",
                " is doing fine!",
                " is seeking urgent care!",
            ]
            if random.choice([True, False]):
                # Cap the referral date at today, if it goes into future
                refer_date = min(
                    r1["dateTimeTaken"] + int(timedelta(days=10).total_seconds()),
                    int(datetime.now().timestamp()),
                )
                referral1 = {
                    "userId": getRandomUser(),
                    "patientId": patientId,
                    "readingId": readingId,
                    "dateReferred": refer_date,
                    "referralHealthFacilityName": healthFacilityName,
                    "comment": name + random.choice(referral_comments),
                }
                db.session.add(referral_schema.load(referral1))
                db.session.commit()

        if count > 0 and count % 25 == 0:
            print("{}/{} Patients have been seeded".format(count, len(patientList)))

    print("{}/{} Patients have been seeded".format(count + 1, len(patientList)))
    print("Complete!")

    end = time.time()
    print("The seed script took: {} seconds".format(round(end - start, 3)))


def create_health_facility(
    facilityName,
    facilityType="HOSPITAL",
    phone="555-555-55555",
    location="Sample Location",
    about="Sample health centre",
):
    facility = {
        "healthFacilityName": facilityName,
        "facilityType": facilityType,
        "healthFacilityPhoneNumber": phone,
        "location": location,
        "about": about,
    }
    schema = HealthFacilitySchema()
    db.session.add(schema.load(facility))
    db.session.commit()


def create_user(email, name, password, hf_name, role):
    """
    Creates a user in the database.
    """
    user = {
        "email": email,
        "firstName": name,
        "password": flask_bcrypt.generate_password_hash(password),
        "healthFacilityName": hf_name,
        "role": role,
    }
    user_schema = UserSchema()
    db.session.add(user_schema.load(user))
    db.session.commit()


def create_patient_reading_referral_pregnancy(
    patientId,
    readingId,
    userId,
    patientName,
    dob,
    sex,
    villageNum,
    dateReferred,
    healthFacility,
    isAssessed,
    isPregnant=False,
    gestAgeUnit=None,
    gestTimestamp=None,
):
    """
    Creates a patient in the database.
    """
    if isPregnant:
        patient = {
            "patientId": patientId,
            "patientName": patientName,
            "gestationalAgeUnit": gestAgeUnit,
            "gestationalTimestamp": gestTimestamp,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "true",
            "dob": dob,
            "isExactDob": False,
        }
        pregnancy = {
            "patientId": patientId,
            "startDate": gestTimestamp,
            "defaultTimeUnit": gestAgeUnit,
        }
    else:
        patient = {
            "patientId": patientId,
            "patientName": patientName,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "false",
            "dob": dob,
            "isExactDob": False,
        }
        pregnancy = None

    reading = {
        "userId": userId,
        "patientId": patientId,
        "dateTimeTaken": dateReferred,
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
        "userId": userId,
        "dateReferred": dateReferred,
        "referralHealthFacilityName": healthFacility,
        "isAssessed": isAssessed,
    }

    patient_schema = PatientSchema()
    db.session.add(patient_schema.load(patient))
    db.session.commit()

    readingModel = marshal.unmarshal(Reading, reading)
    crud.create(readingModel, refresh=True)

    referral_schema = ReferralSchema()
    db.session.add(referral_schema.load(referral))
    db.session.commit()

    if pregnancy:
        pregnancy_schema = PregnancySchema()
        db.session.add(pregnancy_schema.load(pregnancy))
        db.session.commit()


def create_pregnancy(
    patientId,
    startDate,
    endDate=None,
    defaultTimeUnit="WEEKS",
):
    pregnancy = {
        "patientId": patientId,
        "startDate": startDate,
        "defaultTimeUnit": defaultTimeUnit,
        "endDate": endDate,
    }
    schema = PregnancySchema()
    db.session.add(schema.load(pregnancy))
    db.session.commit()


def create_medical_record(patientId, info, isDrugRecord):
    record = {
        "patientId": patientId,
        "information": info,
        "isDrugRecord": isDrugRecord,
    }
    schema = MedicalRecordSchema()
    db.session.add(schema.load(record))
    db.session.commit()


def create_patient_association(patientId, userId):
    association = {
        "patientId": patientId,
        "userId": userId,
    }
    schema = PatientAssociationsSchema()
    db.session.add(schema.load(association))
    db.session.commit()


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


def getRandomPregnancyDate():
    max_preg = randint(1, 273)
    date = datetime.today() - timedelta(max_preg)
    return int(date.strftime("%s"))


def generateRandomReadingID():
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


def getNames():
    with open("./data/seed_data/seed.json") as f:
        names = json.load(f)
        return names["firstNames"], names["lastNames"]


def getDateTime(dateStr):
    return datetime.strptime(dateStr, "%Y-%m-%dT%H:%M:%S")


def generatePhoneNumbers():
    prefix = "+256"

    area_codes = [loc["areaCode"] for loc in facilityLocations]
    n = len(area_codes)
    post_fixes = [
        "".join(["{}".format(randint(0, 9)) for num in range(0, 6)]) for x in range(n)
    ]

    numbers = {}
    for i in range(n):
        numbers[area_codes[i]] = prefix + "-" + str(area_codes[i]) + "-" + post_fixes[i]

    return numbers


def getFacilityPhoneNumber(area_code):
    return facilityPhoneNumbers[area_code]


def generateHealthFacilities():
    n = len(facilityLocations)

    # Sets are unique element lists, prevents from having duplicates
    facilities = set()
    while len(facilities) < n:
        facilities.add(
            "H" + "".join(["{}".format(randint(0, 9)) for num in range(0, 4)])
        )

    facilities = list(facilities)

    return sorted(facilities)


def generateVillages():
    n = len(facilityLocations)
    villages = set()
    while len(villages) < n:
        villages.add("1" + "".join(["{}".format(randint(0, 9)) for num in range(0, 3)]))
    villages = list(villages)
    return villages


def getRandomDOB():
    format = "%Y-%m-%d"
    start = time.mktime(time.strptime("1950-1-1", format))
    end = time.mktime(time.strptime("2010-1-1", format))
    rand_range = random.random()

    ptime = start + rand_range * (end - start)

    return time.strftime(format, time.localtime(ptime))


def getFacilityName(index):
    return healthFacilityList[index]


def getFacilityType():
    return random.choice(facilityType)


def getFacilityAbout():
    return random.choice(facilityAbout)


if __name__ == "__main__":
    NUM_OF_PATIENTS = 250

    patientList = random.sample(range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patientList)
    patientList = list(map(str, patientList))

    # Get cities
    with open("./data/seed_data/seed.json") as f:
        facilityLocations = json.load(f)["locations"]

    usersList = [1, 2, 3, 4]
    villageList = generateVillages()
    healthFacilityList = generateHealthFacilities()

    facilityType = ["HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facilityAbout = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]

    facilityPhoneNumbers = generatePhoneNumbers()

    symptomsList = ["HEADACHE", "BLURRED VISION", "ABDO PAIN", "BLEEDING", "FEVERISH"]
    sexList = ["FEMALE", "MALE"]
    bpSystolicList = np.clip(np.random.normal(120, 35, 1000).astype(int), 50, 300)
    bpDiastolicList = np.clip(np.random.normal(80, 25, 1000).astype(int), 30, 200)
    heartRateList = np.clip(np.random.normal(60, 17, 1000).astype(int), 30, 250)

    d1 = datetime.strptime("1/1/2019 12:01 AM", "%m/%d/%Y %I:%M %p")
    d2 = datetime.today().replace(microsecond=0)
    manager.run()
