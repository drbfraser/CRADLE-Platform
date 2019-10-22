"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Controller.HelloWorld import *
from Controller.Multi import *
from Controller.UsersController import *
from Controller.PatientsController import *
from Controller.ReferralsController import ReferralApi, ReferralInfo
from Controller.HealthFacilityController import HealthFacility
from Controller.FollowUpController import FollowUp
from Controller.StatsController import *
from Controller.PatientStatsController import *




def init(api):
    api.add_resource(HelloWorld, '/api/hello-world')
    api.add_resource(Multi, '/api/multi/<int:num>')
    api.add_resource(AllStats, '/api/stats') # [GET]
    api.add_resource(PatientStats,'/api/patient/stats/<string:patient_id>') # [GET]

    api.add_resource(UserApi, '/api/user/register') # [POST]
    api.add_resource(UserAuthApi, '/api/user/auth') # [POST]
    api.add_resource(UserTokenApi, '/api/user/current') # [GET]

    api.add_resource(PatientAllInformation, '/api/patient/allinfo') # [GET]
    api.add_resource(PatientReading, '/api/patient/reading') # [POST]
    api.add_resource(PatientInfo, '/api/patient/<string:patient_id>') # [GET, PUT]
    api.add_resource(PatientAll, '/api/patient') # [GET, POST]

    api.add_resource(ReferralApi, '/api/referral') # [GET, POST]
    api.add_resource(ReferralInfo, '/api/referral/<int:id>') # [GET, PUT]

    api.add_resource(HealthFacility, '/api/health_facility', '/api/health_facility/<string:name>') # [GET, POST, PUT, DELETE]

    api.add_resource(FollowUp, '/api/follow_up', '/api/follow_up/<int:id>') # [GET, POST, PUT, DELETE]
