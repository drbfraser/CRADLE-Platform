"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *
from Api_endpoints.PatientsController import PatientController
from Api_endpoints.ReferralsController import ReferralApi, ReferralInfo

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

    api.add_resource(PatientController, '/patient', '/patient/<string:patient_id>')

    api.add_resource(ReferralApi, '/referral') # [GET, POST]
    api.add_resource(ReferralInfo, '/referral/<int:id>') # [GET]

