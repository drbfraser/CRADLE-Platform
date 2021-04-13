"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

import api as new_api
from api.resources.patients_android import *
from api.resources.version import *
from api.resources.assessments import (
    Root as Assessments,
    SingleAssessment,
    UpdateAssessment,
)
from api.resources.stats import (
    Root as GeneralStats,
    AllStats,
    FacilityReadings,
    UserReadings,
    ExportStats,
)

from api.resources.patientAssociations import Root as PatientAssociations
from api.resources.facilities import Root as Facilities
from api.resources.patients import (
    Root as Patients,
    SinglePatient,
    PatientInfo,
    PatientStats,
    PatientReadings,
)
from api.resources.readings import Root as Readings, SingleReading
from api.resources.referrals import Root as Referrals, SingleReferral
from api.resources.users import *


def init(api):
    api.add_resource(GeneralStats, "/api/stats")  # [GET]
    api.add_resource(AllStats, "/api/stats/all")  # [GET]

    api.add_resource(
        FacilityReadings, "/api/stats/facility/<string:facility_id>"
    )  # [GET]
    api.add_resource(ExportStats, "/api/stats/export/<int:user_id>")  # [GET]

    api.add_resource(UserReadings, "/api/stats/user/<int:user_id>")

    api.add_resource(UserRegisterApi, "/api/user/register")  # [POST]
    api.add_resource(UserAuthApi, "/api/user/auth")  # [POST]
    api.add_resource(UserAuthTokenRefreshApi, "/api/user/auth/refresh_token")  # [POST]
    api.add_resource(UserTokenApi, "/api/user/current")  # [GET]
    api.add_resource(UserAll, "/api/user/all")  # [GET]

    api.add_resource(UserApi, "/api/user/<int:id>")  # [GET, PUT, DELETE]

    api.add_resource(UserAllVHT, "/api/user/vhts")  # [GET]

    api.add_resource(
        AndroidPatientGlobalSearch, "/api/patient/global/<string:search>"
    )  # [GET]

    #### New Endpoints ####
    api.add_resource(Assessments, "/api/assessments", endpoint="assessments")  # [POST]
    api.add_resource(
        UpdateAssessment,
        "/api/assessmentUpdate/<int:assessment_id>",
        endpoint="assessmentUpdate",
    )  # [POST]
    api.add_resource(
        SingleAssessment,
        "/api/assessments/<int:assessment_id>",
        endpoint="single_assessment",
    )  # [GET]

    api.add_resource(
        PatientAssociations, "/api/patientAssociations", endpoint="patientAssociations"
    )  # [POST]

    api.add_resource(
        Facilities, "/api/facilities", endpoint="facilities"
    )  # [GET, POST]

    api.add_resource(Patients, "/api/patients", endpoint="patients")  # [GET, POST]
    api.add_resource(
        SinglePatient, "/api/patients/<string:patient_id>", endpoint="single_patient"
    )  # [GET]
    api.add_resource(
        AndroidPatients, "/api/mobile/patients", endpoint="android_patient"
    )  # [GET]
    api.add_resource(
        PatientInfo, "/api/patients/<string:patient_id>/info", endpoint="patient_info"
    )  # [GET, PUT]
    api.add_resource(
        PatientStats,
        "/api/patients/<string:patient_id>/stats",
        endpoint="patient_stats",
    )  # [GET]
    api.add_resource(
        PatientReadings,
        "/api/patients/<string:patient_id>/readings",
        endpoint="patient_readings",
    )  # [GET]

    api.add_resource(Readings, "/api/readings", endpoint="readings")  # [POST]
    api.add_resource(
        SingleReading, "/api/readings/<string:reading_id>", endpoint="single_reading"
    )  # [GET]

    api.add_resource(Referrals, "/api/referrals", endpoint="referrals")  # [GET, POST]
    api.add_resource(
        SingleReferral,
        "/api/referrals/<string:referral_id>",
        endpoint="single_referral",
    )  # [GET]

    api.add_resource(AdminPasswordChange, "/api/user/<int:id>/change_pass")  # [POST]
    api.add_resource(UserPasswordChange, "/api/user/current/change_pass")  # [POST]

    api.add_resource(Version, "/api/version")  # [GET]

    new_api.init_routes(api)
