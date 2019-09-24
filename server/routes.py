"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *
from Api_endpoints.UsersController import *

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

    api.add_resource(UserApi, '/user/register') # [POST]
    api.add_resource(UserAuthApi, '/user/auth') # [POST]
    api.add_resource(UserTokenApi, '/user/current') # [GET]

