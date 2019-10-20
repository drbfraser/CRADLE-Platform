
# this seeds the database with seed command below
import random
import string
import uuid
import sys
import datetime
import numpy as np
from random import randrange
from datetime import timedelta, datetime
from flask_script import Manager
from config import app, db, flask_bcrypt
from models import *

manager = Manager(app)

# USAGE: python manage.py seed
@manager.command
def seed():
    # SEED roles
    role1 = Role(name='VHT')
    role2 = Role(name='HCW')
    role3 = Role(name='ADMIN')

    print('Seeding roles...')
    db.session.add_all([role1,role2,role3])
    db.session.commit()

    # NOTE: users are automatically added to 'HCW' role
    role_hcw = Role.query.filter_by(name='HCW').first()

    user_schema = UserSchema()
    u1 = { 'email' : 'a@a.com', 'password': flask_bcrypt.generate_password_hash('123456') }
    u2 = { 'email' : 'b@b.com', 'password': flask_bcrypt.generate_password_hash('123456') }
    role_hcw.users.append(user_schema.load(u1, session=db.session))
    role_hcw.users.append(user_schema.load(u2, session=db.session))

    print('Seeding users...')
    db.session.add(role_hcw)
    db.session.commit()

    # seed health facilities
    print('Seeding health facilities...')

    healthfacility_schema = HealthFacilitySchema()
    for hf in healthFacilityList:
        hf_schema = { "healthFacilityName" : hf }
        db.session.add(healthfacility_schema.load(hf_schema))
    db.session.commit()


    print('Seeding Patients with readings and referrals...')
    # seed patients with readings and referrals
    patient_schema = PatientSchema()
    reading_schema = ReadingSchema()
    referral_schema = ReferralSchema()
    for patientId in patientList:

        # get random patient
        p1 = { 
            "patientId": patientId,
            "patientName": getRandomInitials(),
            "patientAge":getRandomAge(),
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"51",
            "villageNumber": getRandomVillage(),
            "patientSex": "FEMALE",
            "isPregnant":"true"
        }
        db.session.add(patient_schema.load(p1))
        db.session.commit()

        numOfReadings = random.randint(1,5)
        dateList = [getRandomDate() for i in range(numOfReadings)]
        dateList.sort()

        for i in range(numOfReadings):
            readingId = str(uuid.uuid4())
            healthFacilityName = getRandomHealthFacilityName()

            # get random reading(s) for patient
            r1 =  {
                "patientId" : patientId,
                "dateTimeTaken": dateList[i],
                "readingId": readingId,
                "bpSystolic": getRandomBpSystolic(),
                "bpDiastolic": getRandomBpDiastolic(),
                "heartRateBPM": getRandomHeartRateBPM(),
                "symptoms": getRandomSymptoms(),
            }
            db.session.add(reading_schema.load(r1))
            db.session.commit()

            if i == numOfReadings-1 and random.choice([True, False]):
                referral1 = {
                    "patientId" : patientId,
                    "readingId": readingId,
                    "dateReferred": (getDateTime(r1['dateTimeTaken']) + timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%S"),
                    "referralHealthFacilityName": healthFacilityName,
                    "comment": "She needs help!"
                }
                db.session.add(referral_schema.load(referral1))
                db.session.commit()

    print('Complete!')

def getRandomInitials():
    return (random.choice(string.ascii_letters) + random.choice(string.ascii_letters)).upper()

def getRandomVillage():
    return random.choice(villageList)

def getRandomAge():
    return random.randint(20,40)

def getRandomBpSystolic():
    return random.choice(bpSystolicList)

def getRandomBpDiastolic():
    return random.choice(bpDiastolicList)

def getRandomHeartRateBPM():
    return random.choice(heartRateList)

def getRandomHealthFacilityName():
    return random.choice(healthFacilityList)

def getRandomSymptoms():
    numOfSymptoms = random.randint(0,4)
    if numOfSymptoms == 0:
        return ''
    
    symptoms = random.sample(population=symptomsList, k=numOfSymptoms)
    return ', '.join(symptoms)

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
    return new_date.strftime("%Y-%m-%dT%H:%M:%S")

def getDateTime(dateStr):
    return datetime.strptime(dateStr, "%Y-%m-%dT%H:%M:%S")

if __name__ == "__main__":
    NUM_OF_PATIENTS = 100

    patientList = random.sample(range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patientList)
    patientList = list(map(str, patientList))

    villageList = ['1001','1002','1003','1004','1005','1006','1007','1008','1009']
    healthFacilityList = ['H1233', 'H2555', 'H3445', 'H5123']
    symptomsList = ['HEADACHE', 'BLURRED VISION', 'ABDO PAIN', 'BLEEDING', 'FEVERISH']
    sexList = ['FEMALE', 'MALE']
    bpSystolicList = list(np.random.normal(120, 20, 1000).astype(int))
    bpDiastolicList = list(np.random.normal(80, 20, 1000).astype(int))
    heartRateList = list(np.random.normal(60,15,1000).astype(int))

    d1 = datetime.strptime('1/1/2019 12:01 AM', '%m/%d/%Y %I:%M %p')
    d2 = datetime.strptime('12/31/2019 11:59 PM', '%m/%d/%Y %I:%M %p')

    manager.run()