from database.ReadingRepo import ReadingRepo
from database.ReferralRepo import ReferralRepo
import manager.FilterHelper as filter
from database.PatientRepo import PatientRepo
from database.UserRepo import UserRepo
from manager.Manager import Manager
from models import Patient

readingRepo = ReadingRepo() 
referralRepo = ReferralRepo()

class PatientManager(Manager):

    def __init__(self):
        Manager.__init__(self, PatientRepo)

    def get_global_search_patients(self, current_user, search):
        def __make_gs_patient_dict(p: Patient, is_added: bool) -> dict:
            patient_dict = PatientRepo().model_to_dict(p)
            patient_dict["state"] = "Added" if is_added else "Add"
            return patient_dict

        user = UserRepo().select_one(id=current_user["userId"])
        pairs = filter.annotated_global_patient_list(user, search)
        patients_query = [__make_gs_patient_dict(p, state) for (p, state) in pairs]
        return [self.to_global_search_patient(p) for p in patients_query]

    def to_global_search_patient(self, patient):

        global_search_patient = {
            "patientName": patient["patientName"],
            "patientId": patient["patientId"],
            "villageNumber": patient["villageNumber"],
            "readings": patient["readings"],
            "state": patient["state"],
        }

        if global_search_patient["readings"]:
            readings_arr = []
            for reading in global_search_patient["readings"]:
                # build the reading json to add to array
                reading_json = {
                    "dateReferred": None,
                }
                reading_data = readingRepo.read("readingId", reading)
                reading_json["dateTimeTaken"] = reading_data["dateTimeTaken"]
                reading_json["trafficLightStatus"] = reading_data["trafficLightStatus"]

                # add referral if exists in reading
                if reading_data["referral"]:
                    top_ref = referralRepo.read("id", reading_data["referral"])
                    reading_json["dateReferred"] = top_ref["dateReferred"]

                # add reading dateReferred data to array
                readings_arr.append(reading_json)

            # add reading key to global_search_patient key
            global_search_patient["readings"] = readings_arr

        return global_search_patient