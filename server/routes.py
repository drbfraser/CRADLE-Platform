"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *
from Api_endpoints.PatientApi import *


def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')
    api.add_resource(Patient, '/patient', '/patient/<string:patient_id>')
