from flask import request
from flask_restful import Resource
from flasgger import swag_from

class HelloWorld(Resource):
    @swag_from('../specifications/hello-world.yml', methods=['GET'])
    def get(self):
        return {
            "msg": "hello, this is flask"
        }
        
    def post(self):
        some_json = request.get_json()
        return {'you sent': some_json}, 201