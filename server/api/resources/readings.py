from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import data.crud as crud
import data.marshal as marshal
import service.invariant as invariant
from models import Reading
from validation import readings


# /api/readings
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/readings-post.yml", methods=["POST"], endpoint="readings"
    )
    def post():
        json = request.get_json(force=True)
        print(json)
        error_message = readings.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        reading = marshal.unmarshal(Reading, json)

        if crud.read(Reading, readingId=reading.readingId):
            abort(409, message=f"A reading already exists with id: {reading.readingId}")

        invariant.resolve_reading_invariants(reading)
        crud.create(reading, refresh=True)
        return marshal.marshal(reading), 201


# /api/readings/<string:id>
class SingleReading(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-reading-get.yml",
        methods=["GET"],
        endpoint="single_reading",
    )
    def get(reading_id: str):
        reading = crud.read(Reading, readingId=reading_id)
        if not reading:
            abort(404, message=f"No reading with id {reading_id}")

        return marshal.marshal(reading)
