from flask_restful import Resource
import config as config
from flasgger import swag_from

# /api/version
class Version(Resource):
    @swag_from("../../specifications/version.yml", methods=["GET"])
    def get(self):
        return {"version": config.app_version}, 200
