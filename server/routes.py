"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *
from Api_endpoints.PatientApi import *

from Api_endpoints.PatientsController import PatientApi, PatientInfo
from Api_endpoints.ReferralsController import ReferralApi, ReferralInfo

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')
    api.add_resource(Patient, '/patient', '/patient/<string:id>')

    api.add_resource(PatientApi, '/patient') # [GET, POST]
    api.add_resource(PatientInfo, '/patient/<int:id>') # [GET]

    api.add_resource(ReferralApi, '/referral') # [GET, POST]
    api.add_resource(ReferralInfo, '/referral/<int:id>') # [GET]

