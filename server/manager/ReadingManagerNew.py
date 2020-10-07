from Database.ReadingRepoNew import ReadingRepo
from manager.Manager import Manager
from manager import patientManager
from manager.urineTestManager import urineTestManager
import logging
from marshmallow import ValidationError

urineTestManager = urineTestManager()
import uuid


class ReadingManager(Manager):
    def __init__(self):
        Manager.__init__(self, ReadingRepo)

    def create_reading_and_patient(self, patient_id, patient_reading_data):
        patient = patientManager.read("patientId", patient_id)
        if patient is None:
            patient = patientManager.create(patient_reading_data["patient"])

        patient_reading_data["reading"]["patientId"] = patient_id
        # get the symptoms array
        symptomArray = patient_reading_data["reading"]["symptoms"]
        # need to save urine test data from reading for urine test creation
        reading = self.create_reading(patient_reading_data["reading"])
        # clearlogging.debug(reading["patient"])
        # return all created data
        return {"reading": reading, "patient": patient}

    def create_reading(self, reading):
        # need to save urine test data from reading for urine test creation
        created_reading = None
        # get the symptoms array
        symptomArray = reading["symptoms"]
        # convert it into a string for the db
        reading["symptoms"] = ",".join(symptomArray)
        if "urineTests" in reading:
            urineTestData = reading["urineTests"]
            del reading["urineTests"]
            created_reading = self.create(reading)
            created_reading = self.add_urine_test(created_reading, urineTestData)
        else:
            created_reading = self.create(reading)
        created_reading["symptoms"] = symptomArray
        return created_reading

    def add_urine_test(self, reading, urineTestData):
        # if a urine test already exits for reading, throw an error, otherwise create the urine test reading
        existingReading = urineTestManager.read("readingId", reading["readingId"])
        if existingReading is None:
            urineTestData["readingId"] = reading["readingId"]
            urineTests = urineTestManager.create(urineTestData)
            logging.debug("urine test created")
            reading["urineTests"] = urineTests
            return reading
        else:
            logging.debug("urine test not created")
            raise ValueError("A urine test already exists for this reading")

    # do all the common stuff here for example changing symptom from string to array
    def get_reading_json_from_reading(self, reading):
        reading_json = self.read("readingId", reading)
        symtoms = reading_json["symptoms"]
        # convert the symptoms into an array
        reading_json["symptoms"] = symtoms.split(",")
        reading_json["urineTests"] = urineTestManager.read("readingId", reading)
        return reading_json
