from typing import Optional

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import RootModel

import service.FilterHelper as filter
from api.resources.patients import api_patients
from common import user_utils
from data import crud, marshal
from enums import TrafficLightEnum
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
from validation.assessments import AssessmentModel
from validation.forms import FormModel
from validation.patients import NestedPatientList
from validation.readings import ReadingWithUrineTestsList
from validation.referrals import ReferralModel

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
            reading_json: dict[str, Optional[str]] = {
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


class SearchPath(CradleBaseModel):
    search: str


mobile_patient_tag = Tag(name="Mobile Patients", description="")


class MobileGlobalSearchReading(CradleBaseModel):
    date_taken: int
    date_referred: Optional[int]
    traffic_light_status: TrafficLightEnum


class MobileGlobalSearchPatient(CradleBaseModel):
    id: str
    name: str
    state: str
    village_number: str
    readings: list[MobileGlobalSearchReading]


class MobileGlobalSearchPatientsList(RootModel):
    root: list[MobileGlobalSearchPatient]


# api/patients/global/<string:search>
# [GET]: Get a list of ALL patients and their basic information
#        (information necessary for the patient page)
#        if they match search criteria
#        For now search criteria could be:
#           a portion/full match of the patient's id
#           a portion/full match of the patient's initials
@api_patients.get(
    "/global/<string:search>",
    tags=[mobile_patient_tag],
    responses={200: MobileGlobalSearchPatientsList},
)
def search_patient_list_mobile(path: SearchPath):
    """
    Search Patient List (Mobile)
    Get a list of ALL patients and their basic information
    (information necessary for the patient page) that match the search criteria.
    For now search criteria could be:
        - A portion/full match of the patient's ID.
        - A portion/full match of the patient's initials.

    Returns info for Patient and their Readings.
    """
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


api_patients_mobile = APIBlueprint(
    name="patients_android",
    import_name=__name__,
    url_prefix="/mobile",
    abp_tags=[Tag(name="Mobile Patients", description="")],
    abp_security=[{"jwt": []}],
)


# /api/mobile/patients [GET]
@api_patients_mobile.get(
    "/patients", tags=[mobile_patient_tag], responses={200: NestedPatientList}
)
def get_patients_mobile():
    """
    Get Patients (Mobile)
    Retrieve info for all Patients associated with the current user.
    Returns info for Patient, their Medical/Drug Records, and their latest Pregnancy.
    """
    current_user = user_utils.get_current_user_from_jwt()
    patients = view.patient_view(current_user)

    return [serialize.serialize_patient(p) for p in patients]


# /api/mobile/readings [GET]
@api_patients_mobile.get(
    "/readings", tags=[mobile_patient_tag], responses={200: ReadingWithUrineTestsList}
)
def get_readings_mobile():
    """Get Readings (Mobile)"""
    current_user = user_utils.get_current_user_from_jwt()
    readings = view.reading_view(current_user)

    return [serialize.serialize_reading(r) for r in readings]


# /api/mobile/referrals [GET]
@api_patients_mobile.get(
    "/referrals", tags=[mobile_patient_tag], responses={200: ReferralModel}
)
def get_referrals_mobile():
    """Get Referrals (Mobile)"""
    current_user = user_utils.get_current_user_from_jwt()
    referrals = view.referral_view(current_user)
    return [serialize.serialize_referral_or_assessment(r) for r in referrals]


# /api/mobile/assessments
@api_patients_mobile.get(
    "/assessments",
    tags=[mobile_patient_tag],
    responses={200: AssessmentModel},
)
def get_assessments_mobile():
    """Get Assessments (Mobile)"""
    current_user = user_utils.get_current_user_from_jwt()
    assessments = view.assessment_view(current_user)
    return [serialize.serialize_referral_or_assessment(a) for a in assessments]


class GetFormMobilePath(CradleBaseModel):
    patient_id: str
    form_template_id: str


# /api/mobile/forms/<string:patient_id>/<string:form_template_id>
@api_patients_mobile.get(
    "/forms/<string:patient_id>/<string:form_template_id>",
    tags=[mobile_patient_tag],
    responses={200: FormModel},
)
def get_form_mobile(path: GetFormMobilePath):
    """Get Form Mobile"""
    filters: dict = {
        "patient_id": path.patient_id,
        "form_template_id": path.form_template_id,
    }

    form = crud.read(FormOrm, **filters)

    if form is None:
        return abort(
            404,
            description=f"No forms for Patient with ID: {path.patient_id} and Form Template with ID: {path.form_template_id}",
        )

    return marshal.marshal(form, False)
