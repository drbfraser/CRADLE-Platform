from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask_restful import Resource
from data import crud, marshal
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

## Functions that are only used for this endpoint ##

def to_global_search_patient(patient):

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

def get_global_search_patients(current_user, search):
        def __make_gs_patient_dict(p: Patient, is_added: bool) -> dict:
            patient_dict = marshal.model_to_dict(p, PatientSchema)
            patient_dict["state"] = "Added" if is_added else "Add"
            return patient_dict

        user = crud.read(User, id=current_user["userId"])
        pairs = filter.annotated_global_patient_list(user, search)
        patients_query = [__make_gs_patient_dict(p, state) for (p, state) in pairs]
        return [to_global_search_patient(p) for p in patients_query]



# URI: api/patient/global/<string:search>
# [GET]: Get a list of ALL patients and their basic information
#        (information necessary for the patient page)
#        if they match search criteria
#        For now search criteria could be:
#           a portion/full match of the patient's id
#           a portion/full match of the patient's initials
class PatientGlobalSearch(Resource):

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    def get(self, search):
        current_user = get_jwt_identity()
        patients_readings_referrals = get_global_search_patients(
            current_user, search.upper()
        )

        if not patients_readings_referrals:
            return []
        else:
            return patients_readings_referrals
