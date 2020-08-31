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
from Controller.HelloWorld import *
from Controller.Multi import *
from Controller.PasswordResetController import *
from Controller.PatientsController import *
from Controller.ReferralsController import ReferralApi, ReferralInfo
from Controller.SMSController import *
from Controller.StatsController import *
from Controller.UsersController import *


def init(api):
    api.add_resource(HelloWorld, "/api/hello-world")
    api.add_resource(Multi, "/api/multi/<int:num>")
    api.add_resource(AllStats, "/api/stats")  # [GET]
    api.add_resource(
        PatientStats,
        "/api/patient/stats/<string:patient_id>",
        endpoint="old_patient_stats",
    )  # [GET]

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
    )  # [GET, POST, PUT, DELETE]
    api.add_resource(
        HealthFacility,
        "/api/health_facility/<string:name>",
        endpoint="healthfacility_path",
    )  # [GET, POST, PUT, DELETE]
    api.add_resource(HealthFacilityList, "/api/health_facility_list")  # [GET]

    api.add_resource(
        FollowUp, "/api/follow_up", endpoint="followup"
    )  # [GET, POST, PUT, DELETE]
    api.add_resource(
        FollowUp, "/api/follow_up/<int:id>", endpoint="followup_path"
    )  # [GET, POST, PUT, DELETE]
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

    new_api.init_routes(api)
