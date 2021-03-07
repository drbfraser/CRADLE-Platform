from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort, reqparse

import api.util as util
import data.crud as crud
import data.marshal as marshal
from models import HealthFacility
from validation import facilities


# /api/facilities
class Root(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('healthFacilityName',
                        type=str,
                        required=True,
                        help="This field cannot be left blank!"
                        )

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/facilities-get.yml",
        methods=["GET"],
        endpoint="facilities",
    )
    def get():
        facilities = crud.read_all(HealthFacility)
        if util.query_param_bool(request, "simplified"):
            # If responding to a "simplified" request, only return the names of the
            # facilities and no other information
            return [f.healthFacilityName for f in facilities]
        else:
            # Otherwise, return all information about the health facilities
            return [marshal.marshal(f) for f in facilities]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/facilities-post.yml",
        methods=["POST"],
        endpoint="facilities",
    )
    def post():
        json = request.get_json(force=True)
        error_message = facilities.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        facility = marshal.unmarshal(HealthFacility, json)
        crud.create(facility)
        return marshal.marshal(facility), 201

    def put(self):

        data = request.get_json(force=True)
        error_message = facilities.validate(data)
        if error_message is not None:
            abort(400, message=error_message)
        
        if crud.read(HealthFacility, healthFacilityName=data['healthFacilityName']) is None:

            facility = marshal.unmarshal(HealthFacility, data)
            crud.create(facility)
            return marshal.marshal(facility), 201
        crud.update(HealthFacility, data, healthFacilityName=data['healthFacilityName'])



        return {"message" : 'Hit the endpoint!'}, 200
