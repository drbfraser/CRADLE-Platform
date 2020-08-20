"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

import api as new_api
from Controller.FollowUpController import (
    FollowUp,
    FollowUpMobile,
    FollowUpMobileSummarized,
)
from Controller.HealthFacilityController import *
from Controller.Multi import *
from Controller.PasswordResetController import *
from Controller.PatientsController import *
from Controller.ReferralsController import ReferralApi, ReferralInfo
from Controller.SMSController import *
from Controller.StatsController import *
from Controller.UsersController import *
from api.resources.assessments import Root as Assessments, SingleAssessment
from api.resources.associations import Root as Associations
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


def init(api):
    api.add_resource(Multi, "/api/multi/<int:num>")
    api.add_resource(AllStats, "/api/stats")  # [GET]

    api.add_resource(UserApi, "/api/user/register")  # [POST]
    api.add_resource(UserAuthApi, "/api/user/auth")  # [POST]
    api.add_resource(UserAuthTokenRefreshApi, "/api/user/auth/refresh_token")  # [POST]
    api.add_resource(UserTokenApi, "/api/user/current")  # [GET]
    api.add_resource(UserAll, "/api/user/all")  # [GET]
    api.add_resource(UserEdit, "/api/user/edit/<int:id>")  # [POST]
    api.add_resource(UserDelete, "/api/user/delete/<int:id>")  # [DELETE]
    api.add_resource(UserAllVHT, "/api/user/vhts")  # [GET]

    api.add_resource(PatientAllInformation, "/api/patient/allinfo")  # [GET]
    api.add_resource(
        PatientGlobalSearch, "/api/patient/global/<string:search>"
    )  # [GET]

    api.add_resource(PatientFacility, "/api/patient/facility")  # [POST]

    api.add_resource(ReferralApi, "/api/referral")  # [GET, POST]
    api.add_resource(ReferralInfo, "/api/referral/<int:id>")  # [GET, PUT]

    api.add_resource(
        HealthFacility, "/api/health_facility", endpoint="healthfacility"
    )  # [PUT, DELETE]
    api.add_resource(
        HealthFacility,
        "/api/health_facility/<string:name>",
        endpoint="healthfacility_path",
    )  # [GET, POST, PUT, DELETE]
    api.add_resource(HealthFacilityList, "/api/health_facility_list")  # [GET]

    api.add_resource(FollowUp, "/api/follow_up", endpoint="followup")  # [PUT, DELETE]
    api.add_resource(
        FollowUp, "/api/follow_up/<int:id>", endpoint="followup_path"
    )  # [PUT, DELETE]
    api.add_resource(
        FollowUpMobile, "/api/mobile/follow_up", "/api/mobile/follow_up/<int:id>"
    )  # [GET]
    api.add_resource(
        FollowUpMobileSummarized,
        "/api/mobile/summarized/follow_up",
        "/api/mobile/summarized/follow_up/<int:id>",
    )  # [GET]

    api.add_resource(ForgotPassword, "/api/forgot")  # [POST]
    api.add_resource(ResetPassword, "/api/reset/<string:reset_token>")  # [PUT]

    api.add_resource(SMS, "/api/sms")

    #### New Endpoints ####
    api.add_resource(Assessments, "/api/assessments", endpoint="assessments")  # [POST]
    api.add_resource(
        SingleAssessment, "/api/assessments/<int:id>", endpoint="single_assessment"
    )  # [GET]

    api.add_resource(Associations, "/api/associations")  # [POST]

    api.add_resource(
        Facilities, "/api/facilities", endpoint="facilities"
    )  # [GET, POST]

    api.add_resource(Patients, "/api/patients", endpoint="patients")  # [GET, POST]
    api.add_resource(
        SinglePatient, "/api/patients/<string:patient_id>", endpoint="single_patient"
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
