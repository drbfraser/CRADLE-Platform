import json
from Database.PatientRepoNew import PatientRepo
from Database.ReadingRepoNew import ReadingRepo
from Database.ReferralRepo import ReferralRepo
from Manager.Manager import Manager
from Manager import referralManager, readingManager
from Manager.ReferralManager import ReferralManager #referral data
from Manager.ReadingManagerNew import ReadingManager #referral data
from models import *
from flask_sqlalchemy import SQLAlchemy
from Manager.urineTestManager import urineTestManager

urineTestManager = urineTestManager()

# to do: remove all the redundant imports

from Manager.UserManager import UserManager
userManager = UserManager()
referralManager = ReferralManager()
readingManager = ReadingManager()
from Manager.FilterHelper import filtered_list_hcw, filtered_list_vht, filtered_list_cho
from Manager.RoleManager import RoleManager
roleManager = RoleManager()
from flask_jwt_extended import (create_access_token, create_refresh_token,
jwt_required, jwt_refresh_token_required, get_jwt_identity)

class PatientManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientRepo)


    def get_patient_with_referral_and_reading(self, current_user):
        # harcoding for testing purposes
        # get filtered list of patients here, and then query only that list
        patient_list = self.read_all()
        ref_list = referralManager.read_all()
        readings_list = readingManager.read_all() 
        user_list = userManager.read_all()

        if 'ADMIN' in current_user['roles']:
            patients_query = self.read_all()
        elif 'HCW' in current_user['roles']:
            patients_query = filtered_list_hcw(patient_list, ref_list, user_list, current_user['userId'])
        elif 'CHO' in current_user['roles']:
            patients_query = filtered_list_cho(patient_list, readings_list, current_user['vhtList'], current_user['userId'])
        elif 'VHT' in current_user['roles']:
            patients_query = filtered_list_vht(patient_list, readings_list, current_user['userId'])
        
        # otherwise show them all, which is not the best way to handle it, but risky to throw errors atm
        else:
            patients_query = patient_list
        
        print("length of patients_query: " + str(len(patients_query)))

        if not patients_query:
            return None

        result_json_arr = []
        for patient in patients_query:

            if patient["readings"]:
                readings_arr = []
                needs_assessment = False
                for reading in patient["readings"]:
                    # build the reading json to add to array
                    reading_json = readingManager.read("readingId", reading)
                
                    reading_json['urineTests'] = urineTestManager.read("readingId", reading)

                    # add referral if exists in reading
                    if reading_json["referral"]:

                        top_ref = referralManager.read("id", reading_json["referral"])
                        if not top_ref['followUp']:
                            needs_assessment = True
                        
                        reading_json['comment'] = top_ref["comment"]
                        reading_json['dateReferred'] = top_ref["dateReferred"]
                        reading_json['healthFacilityName'] = top_ref["referralHealthFacilityName"]
                    
                    # add reading to readings array w/ referral info if exists
                    readings_arr.append(reading_json)

                # add assessed field to patient
                patient['needsAssessment'] = needs_assessment
                
                # add reading key to patient key
                patient['readings'] = readings_arr

                # add to result array 
                result_json_arr.append(patient)
        
        return result_json_arr
