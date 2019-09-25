"""
    @File: routes.py
    @Description: This file contains all the routes for the server
"""

from Controller.HelloWorld import *
from Controller.Multi import *

def init(api):
    api.add_resource(HelloWorld, '/', '/home', '/api/hello-world')
    api.add_resource(Multi, '/multi/<int:num>')

