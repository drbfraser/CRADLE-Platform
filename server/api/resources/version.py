from flasgger import swag_from
from flask_restful import Resource

import config as config

from api.decorator import public_endpoint


# /api/version
class Version(Resource):
    @swag_from("../../specifications/version.yml", methods=["GET"])
    @public_endpoint
    def get(self):
        return {"version": config.app_version}, 200
