import manager.FilterHelper as filter
from models import (
    Patient, 
    PatientSchema,
    User,
    Reading,
    Referral,
    ReadingSchema,
    ReferralSchema
)
from data import crud, marshal


class PatientManager():

    def get_global_search_patients(self, current_user, search):
        def __make_gs_patient_dict(p: Patient, is_added: bool) -> dict:
            patient_dict = marshal.model_to_dict(p, PatientSchema)
            patient_dict["state"] = "Added" if is_added else "Add"
            return patient_dict

        user = crud.read(User, id=current_user["userId"])
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
               
                reading_data = marshal.model_to_dict(crud.read(Reading, readingId=reading), ReadingSchema)
                reading_json["dateTimeTaken"] = reading_data["dateTimeTaken"]
                reading_json["trafficLightStatus"] = reading_data["trafficLightStatus"]

                # add referral if exists in reading
                if reading_data["referral"]:
                    top_ref = marshal.model_to_dict(crud.read(Referral, id=reading_data["referral"]), ReferralSchema)
                    reading_json["dateReferred"] = top_ref["dateReferred"]

                # add reading dateReferred data to array
                readings_arr.append(reading_json)

            # add reading key to global_search_patient key
            global_search_patient["readings"] = readings_arr

        return global_search_patient
