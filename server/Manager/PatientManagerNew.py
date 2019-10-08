import json
from Database.PatientRepoNew import PatientRepo
from Database.ReadingRepoNew import ReadingRepo
from Database.ReferralRepo import ReferralRepo
from Manager.Manager import Manager
from Manager import referralManager, readingManager


class PatientManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientRepo)

    def get_patient_with_referral_and_reading(self):
        patients_query = self.read_all()

        if not patients_query:
            return None

        result_json_arr = []
        for patient in patients_query:

            if patient["readings"]:
                readings_arr = []
                for reading in patient["readings"]:
                    # build the reading json to add to array
                    reading_json = readingManager.read("readingId", reading)

                    print(json.dumps(reading_json, indent=2, sort_keys=True))

                    # add referral if exists in reading
                    if reading_json["referrals"]:
                        top_ref = referralManager.read("id", reading_json["referrals"][0])
                        print("top_ref: " + json.dumps(top_ref, indent=2, sort_keys=True))
                    
                        reading_json['comment'] = top_ref["comment"]
                        reading_json['dateReferred'] = top_ref["dateReferred"]
                        reading_json['healthFacilityName'] = top_ref["referralHealthFacilityName"]
                    
                    # add reading to readings array w/ referral info if exists
                    readings_arr.append(reading_json)
                
                # add reading key to patient key
                patient['readings'] = readings_arr

                # add to result array 
                result_json_arr.append(patient)
        
        return result_json_arr
