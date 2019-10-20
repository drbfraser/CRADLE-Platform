
# this seeds the database with seed command below
import random
import string
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
    h1 = {
        "healthFacilityName" : "H1233"
    }
    print('Seeding health facilities...')
    healthfacility_schema = HealthFacilitySchema()
    db.session.add(healthfacility_schema.load(h1))
    db.session.commit()

    # seed patients
    p1 = { 
            "patientId":"301231234",
            "patientName":"BF",
            "patientAge":49,
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"51",
            "villageNumber":"25",
            "patientSex":"FEMALE",
            "isPregnant":"true"
        }
    p2 = { 
            "patientId":"42152156",
            "patientName":"KL",
            "patientAge":27,
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"42",
            "villageNumber":"15",
            "patientSex":"FEMALE",
            "isPregnant":"true"
        }
    p3 = { 
            "patientId":"512321591",
            "patientName":"DF",
            "patientAge":19,
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"37",
            "villageNumber":"28",
            "patientSex":"FEMALE",
            "isPregnant":"true"
        }
    p4 = { 
            "patientId":"612321521",
            "patientName":"JP",
            "patientAge":29,
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"30",
            "villageNumber":"28",
            "patientSex":"FEMALE",
            "isPregnant":"true"
        }
    p5 = { 
            "patientId":"712321421",
            "patientName":"BP",
            "patientAge":41,
            "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalAgeValue":"33",
            "villageNumber":"28",
            "patientSex":"FEMALE",
            "isPregnant":"true"
        }
    print('Seeding patients...')
    patient_schema = PatientSchema()
    patientsList = patient_schema.load([p1,p2,p3,p4,p5], many=True)
    db.session.add_all(patientsList)
    db.session.commit()

    # Seed readings
    r1 = {
        "patientId" : "301231234",
    	"dateTimeTaken": "2019-11-29T17:03:21.494-07:00[America\/Vancouver]",
        "readingId":"reading10",
        "bpSystolic":145,
        "bpDiastolic":76,
        "heartRateBPM":67,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Feverish, Unwell",
        "dateTimeTaken" : "2019-08-23T17:03:21.494-07:00[America\/Vancouver]",
    }
    r11 = {
        "patientId" : "301231234",
    	"dateTimeTaken": "2019-12-29T17:05:21.494-07:00[America\/Vancouver]",
        "readingId":"reading11",
        "bpSystolic":160,
        "bpDiastolic":76,
        "heartRateBPM":78,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Headaches, Unwell",
        "dateTimeTaken" : "2019-08-25T17:03:21.494-07:00[America\/Vancouver]",
    }
    r2 = {
        "patientId" : "42152156",
    	"dateTimeTaken": "2019-12-29T17:05:21.494-07:00[America\/Vancouver]",
        "readingId":"reading2",
        "bpSystolic":130,
        "bpDiastolic":76,
        "heartRateBPM":78,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Headaches, Unwell",
        "dateTimeTaken" : "2019-08-29T17:03:21.494-07:00[America\/Vancouver]",
    }
    r3 = {
        "patientId" : "512321591",
    	"dateTimeTaken": "2019-12-29T17:05:21.494-07:00[America\/Vancouver]",
        "readingId":"reading3",
        "bpSystolic":150,
        "bpDiastolic":76,
        "heartRateBPM":78,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Headaches, Unwell",
        "dateTimeTaken" : "2019-09-23T17:03:21.494-07:00[America\/Vancouver]",
    }
    r4 = {
        "patientId" : "612321521",
    	"dateTimeTaken": "2019-12-29T17:05:21.494-07:00[America\/Vancouver]",
        "readingId":"reading4",
        "bpSystolic":150,
        "bpDiastolic":76,
        "heartRateBPM":78,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Headaches, Unwell",
        "dateTimeTaken" : "2019-09-25T17:03:21.494-07:00[America\/Vancouver]",
    }
    r5 = {
        "patientId" : "712321421",
    	"dateTimeTaken": "2019-12-29T17:05:21.494-07:00[America\/Vancouver]",
        "readingId":"reading5",
        "bpSystolic":155,
        "bpDiastolic":76,
        "heartRateBPM":78,
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup": "true",
        "symptoms":"Headaches, Unwell",
        "dateTimeTaken" : "2019-09-26T17:03:21.494-07:00[America\/Vancouver]",
    }
    print('Seeding readings...')
    reading_schema = ReadingSchema()
    readingList = reading_schema.load([r1,r11,r2,r3,r4,r5], many=True)
    db.session.add_all(readingList)
    db.session.commit()


    # Seed referrals
    rf1 = {
        "patientId" : "301231234",
        "readingId":"reading11",
        "dateReferred": "2019-10-26T17:03:44.552-07:00[America/Vancouver]",
        "referralHealthFacilityName": "H1233",
        "comment": "He needs help!"
    }
    rf2 = {
        "patientId" : "42152156",
        "readingId":"reading2",
        "dateReferred": "2019-10-25T17:03:44.552-07:00[America/Vancouver]",
        "referralHealthFacilityName": "H1233",
        "comment": "He needs help!"
    }

    print('Seeding referrals...')
    referral_schema = ReferralSchema()
    referralList = referral_schema.load([rf1,rf2], many=True)
    db.session.add_all(referralList)
    db.session.commit()


    print('Complete!')

@manager.command
def getRandomInitials():
    return random.choice(string.ascii_letters) + random.choice(string.ascii_letters)

@manager.command
def getRandomVillage():
    return random.choice(villageList)


@manager.command
def getRandomPatientId():
    return random.choice(patientList)

def getRandomAge():
    return random.randint(20,40)

@manager.command
def random_date():
    """
    This function will return a random datetime between two datetime 
    objects.
    """
    start = d1
    end = d2
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second)

if __name__ == "__main__":
    patientList = [random.randint(48300027408,48300099999) for i in range(100)]
    villageList = ['1001','1002','1003','1004','1005','1006','1007','1008','1009']
    sexList = ['FEMALE', 'MALE']
    d1 = datetime.strptime('1/1/2019 12:01 AM', '%m/%d/%Y T%I:%M %p')
    d2 = datetime.strptime('12/31/2019 11:59 PM', '%m/%d/%Y %I:%M %p')
    manager.run()