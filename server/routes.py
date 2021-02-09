"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

import api as new_api
from controller.PasswordResetController import *
from controller.SMSController import *
from controller.PatientsController import *
from controller.UsersController import *
from api.resources.assessments import (
    Root as Assessments,
    SingleAssessment,
    UpdateAssessment,
)
from api.resources.stats import (
    Root as AllStats,
    UniqueReadings,
    TotalReadings,
    ColorReadings,
    SentReferrals,
    ReferredPatients,
    TimeFrameReadings,
)

from api.resources.patientAssociations import Root as PatientAssociations
from api.resources.facilities import Root as Facilities
from api.resources.patients import (
    Root as Patients,
    SinglePatient,
    AndroidPatients,
    PatientInfo,
    PatientStats,
    PatientReadings,
)
from api.resources.readings import Root as Readings, SingleReading
from api.resources.referrals import Root as Referrals, SingleReferral


def init(api):
    api.add_resource(AllStats, "/api/stats")  # [GET]
    api.add_resource(UniqueReadings, "/api/stats_unique_readings/<int:vht_id>")  # [GET]
    api.add_resource(TotalReadings, "/api/stats_total_readings/<int:vht_id>")  # [GET]
    api.add_resource(ColorReadings, "/api/stats_color_readings/<int:vht_id>")  # [GET]
    api.add_resource(SentReferrals, "/api/stats_sent_referrals/<int:vht_id>")  # [GET]
    api.add_resource(
        ReferredPatients, "/api/stats_referred_patients/<string:referral_facility>"
    )  # GET
    # TODO possibly change to a GET Method
    api.add_resource(TimeFrameReadings, "/api/stats_timeframe")  # POST

    api.add_resource(UserApi, "/api/user/register")  # [POST]
    api.add_resource(UserAuthApi, "/api/user/auth")  # [POST]
    api.add_resource(UserAuthTokenRefreshApi, "/api/user/auth/refresh_token")  # [POST]
    api.add_resource(UserTokenApi, "/api/user/current")  # [GET]
    api.add_resource(UserAll, "/api/user/all")  # [GET]
    api.add_resource(UserEdit, "/api/user/edit/<int:id>")  # [POST]
    api.add_resource(UserDelete, "/api/user/delete/<int:id>")  # [DELETE]
    api.add_resource(UserAllVHT, "/api/user/vhts")  # [GET]

    api.add_resource(
        PatientGlobalSearch, "/api/patient/global/<string:search>"
    )  # [GET]

    api.add_resource(ForgotPassword, "/api/forgot")  # [POST]
    api.add_resource(ResetPassword, "/api/reset/<string:reset_token>")  # [PUT]

    api.add_resource(SMS, "/api/sms")

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

    new_api.init_routes(api)
