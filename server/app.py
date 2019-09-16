"""
    @File: app.py
    @ Description: 
    - This file is the main entry point for the server
    - It's main job is to initilize all of its connections including:
      * Connect to database 
      * Serve React App
      * Initilize server routes
      * Start Flask server
"""

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
import routes

app = Flask(__name__)
CORS(app)
api = Api(app)

# class HelloWorld(Resource):
#     def get(self):
#         return {
#             "msg": "hello, this is flask"
#         }
        
#     def post(self):
#         some_json = request.get_json()
#         return {'you sent': some_json}, 201

# class Multi(Resource):
#     def get(self, num):
#         return {'result': num*10}

routes.init(api)

if __name__ == '__main__':
    app.run(debug=True)

