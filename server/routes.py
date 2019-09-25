"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Controller.HelloWorld import *
from Controller.Multi import *
from Controller.PatientsController import *
from Controller.ReferralsController import ReferralApi, ReferralInfo

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

    api.add_resource(PatientInfo, '/patient/<string:patient_id>')
    api.add_resource(PatientAll, '/patient')

    api.add_resource(ReferralApi, '/referral') # [GET, POST]
    api.add_resource(ReferralInfo, '/referral/<int:id>') # [GET]

