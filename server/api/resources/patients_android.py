from flask import abort
from flask_openapi3.blueprint import APIBlueprint

import service.FilterHelper as filter
from common import user_utils
from data import crud, marshal
from models import (
    FormOrm,
    PatientOrm,
    PatientSchema,
    ReadingOrm,
    ReadingSchema,
    UserOrm,
)
from service import serialize, view
from validation import CradleBaseModel

## Functions that are only used for these endpoints ##

# TODO: Add type annotations and error checking to this file.


def to_global_search_patient(patient):
    global_search_patient = {
        "name": patient["name"],
        "id": patient["id"],
        "village_number": patient["village_number"],
        "readings": patient["readings"],
        "state": patient["state"],
    }

    if global_search_patient["readings"]:
        readings_arr = []
        for reading in global_search_patient["readings"]:
            # build the reading json to add to array
            reading_json = {
                "date_referred": None,
            }

            reading_data = marshal.model_to_dict(
                crud.read(ReadingOrm, id=reading),
                ReadingSchema,
            )
            if reading_data is None:
                return abort(404, "No Reading found.")
            reading_json["date_taken"] = reading_data["date_taken"]
            reading_json["traffic_light_status"] = str(
                reading_data["traffic_light_status"]
            )

            # add reading date_referred data to array
            readings_arr.append(reading_json)

        # add reading key to global_search_patient key
        global_search_patient["readings"] = readings_arr

    return global_search_patient


def get_global_search_patients(current_user, search):
    def __make_gs_patient_dict(p: PatientOrm, is_added: bool) -> dict:
        patient_dict = marshal.model_to_dict(p, PatientSchema)
        patient_dict["state"] = "Added" if is_added else "Add"
        return patient_dict

    user = crud.read(UserOrm, id=current_user["id"])
    pairs = filter.annotated_global_patient_list(user, search)
    patients_query = [__make_gs_patient_dict(p, state) for (p, state) in pairs]
    return [to_global_search_patient(p) for p in patients_query]


api_patients_android = APIBlueprint(
    name="patients_android",
    import_name=__name__,
    url_prefix="/api",
)


class SearchPath(CradleBaseModel):
    search: str


# api/patients/global/<string:search>
# [GET]: Get a list of ALL patients and their basic information
#        (information necessary for the patient page)
#        if they match search criteria
#        For now search criteria could be:
#           a portion/full match of the patient's id
#           a portion/full match of the patient's initials
@api_patients_android.get("/patients/global/<string:search>")
def get(path: SearchPath):
    # TODO: Use query params for "search"
    # get all patient information (patientinfo, readings, and referrals)
    current_user = user_utils.get_current_user_from_jwt()
    patients_readings_referrals = get_global_search_patients(
        current_user,
        path.search.upper(),
    )

    if patients_readings_referrals is None:
        return []
    return patients_readings_referrals


# /api/mobile/patients [GET]
@api_patients_android.get("/mobile/patients")
def get_patients_mobile():
    current_user = user_utils.get_current_user_from_jwt()
    patients = view.patient_view(current_user)

    return [serialize.serialize_patient(p) for p in patients]


# /api/mobile/readings [GET]
@api_patients_android.get("/mobile/readings")
def get_readings_mobile():
    current_user = user_utils.get_current_user_from_jwt()
    readings = view.reading_view(current_user)

    return [serialize.serialize_reading(r) for r in readings]


# /api/mobile/referrals [GET]
@api_patients_android.get("/mobile/referrals")
def get_referrals_mobile():
    current_user = user_utils.get_current_user_from_jwt()
    referrals = view.referral_view(current_user)
    return [serialize.serialize_referral_or_assessment(r) for r in referrals]


# /api/mobile/assessments
@api_patients_android.get("/mobile/assessments")
def get_assessments_mobile():
    current_user = user_utils.get_current_user_from_jwt()
    assessments = view.assessment_view(current_user)
    return [serialize.serialize_referral_or_assessment(a) for a in assessments]


class GetFormMobilePath(CradleBaseModel):
    patient_id: str
    form_template_id: str


# /api/mobile/forms/<string:patient_id>/<string:form_template_id>
@api_patients_android.get("/mobile/forms/<string:patient_id>/<string:form_template_id>")
def get_form_mobile(path: GetFormMobilePath):
    filters: dict = {
        "patient_id": path.patient_id,
        "form_template_id": path.form_template_id,
    }

    form = crud.read(FormOrm, **filters)

    if form is None:
        return abort(
            404,
            message=f"No forms for Patient with ID: {path.patient_id} and Form Template with ID: {path.form_template_id}",
        )

    return marshal.marshal(form, False)
