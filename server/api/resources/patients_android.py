from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask_restful import Resource, abort
from data import crud, marshal
import service.FilterHelper as filter
from models import (
    Patient,
    PatientSchema,
    User,
    Form,
    Reading,
    Referral,
    ReadingSchema,
    ReferralSchema,
)
from flasgger import swag_from
import api.util as util
import service.view as view
import service.serialize as serialize

## Functions that are only used for these endpoints ##


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

            reading_data = marshal.model_to_dict(
                crud.read(Reading, readingId=reading), ReadingSchema
            )
            reading_json["dateTimeTaken"] = reading_data["dateTimeTaken"]
            reading_json["trafficLightStatus"] = reading_data["trafficLightStatus"]

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
class AndroidPatientGlobalSearch(Resource):

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    @swag_from("../../specifications/patient-search-get.yml", methods=["GET"])
    def get(self, search):
        current_user = get_jwt_identity()
        patients_readings_referrals = get_global_search_patients(
            current_user, search.upper()
        )

        if not patients_readings_referrals:
            return []
        else:
            return patients_readings_referrals


# /api/mobile/patients/
class AndroidPatients(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-patients-get.yml",
        methods=["GET"],
        endpoint="android_patient",
    )
    def get():
        user = get_jwt_identity()
        patients = view.patient_view(user)

        return [serialize.serialize_patient(p) for p in patients]


# /api/mobile/readings
class AndroidReadings(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-readings-get.yml",
        methods=["GET"],
        endpoint="android_readings",
    )
    def get():
        user = get_jwt_identity()
        readings = view.reading_view(user)

        return [serialize.serialize_reading(r) for r in readings]


# /api/mobile/referrals
class AndroidReferrals(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-referrals-get.yml",
        methods=["GET"],
        endpoint="android_referrals",
    )
    def get():
        user = get_jwt_identity()
        referrals = view.referral_view(user)
        return [serialize.serialize_referral_or_assessment(r) for r in referrals]


# /api/mobile/assessments
class AndroidAssessments(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-assessments-get.yml",
        methods=["GET"],
        endpoint="android_assessments",
    )
    def get():
        user = get_jwt_identity()
        assessments = view.assessment_view(user)
        return [serialize.serialize_referral_or_assessment(a) for a in assessments]

# /api/mobile/forms/<str:patient_id>/<str:form_id>
class AndroidForms(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/android-forms-get.yml",
        methods=["GET"],
        endpoint="android_forms",
    )
    def get(patient_id: str, form_id: str):
        
        filters: dict = {
            "patientId": patient_id,
            "formClassificationId": form_id,
        }

        form = crud.read(Form, **filters)
        
        if not form:
            abort(404, message=f"No forms for patient with id {patient_id} and form template with id {form_id}")

        return marshal.marshal(form, False)

