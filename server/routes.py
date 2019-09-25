"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

<<<<<<< HEAD
from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *
from Api_endpoints.UsersController import *
=======
from Controller.HelloWorld import *
from Controller.Multi import *
from Controller.PatientsController import *
from Controller.ReferralsController import ReferralApi, ReferralInfo
>>>>>>> 7013252fa7c5661bcf912299e68d043832429d9d

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

<<<<<<< HEAD
    api.add_resource(UserApi, '/user/register') # [POST]
    api.add_resource(UserAuthApi, '/user/auth') # [POST]
    api.add_resource(UserTokenApi, '/user/current') # [GET]
=======
    api.add_resource(PatientInfo, '/patient/<string:patient_id>')
    api.add_resource(PatientAll, '/patient')

    api.add_resource(ReferralApi, '/referral') # [GET, POST]
    api.add_resource(ReferralInfo, '/referral/<int:id>') # [GET]
>>>>>>> 7013252fa7c5661bcf912299e68d043832429d9d

