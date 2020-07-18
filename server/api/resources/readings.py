from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

import data.crud as crud
import data.marshal as marshal
import service.invariant as invariant
from models import Reading


class Root(Resource):
    @staticmethod
    @jwt_required
    def post():
        json = request.get_json(force=True)
        # TODO: Validate request
        reading = marshal.unmarshal(Reading, json)
        invariant.resolve_reading_invariants(reading)
        crud.create(reading)
        return marshal.marshal(reading), 201


class SingleReading(Resource):
    @staticmethod
    @jwt_required
    def get(reading_id: str):
        reading = crud.read(Reading, readingId=reading_id)
        return marshal.marshal(reading)
