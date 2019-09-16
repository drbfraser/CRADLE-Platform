"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Api_endpoints.HelloWorld import *
from Api_endpoints.Multi import *

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

