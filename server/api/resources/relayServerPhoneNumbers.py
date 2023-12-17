import data.crud as crud
import data.marshal as marshal
from api.decorator import roles_required
from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort, reqparse
from models import RelayServerPhoneNumber
from enums import RoleEnum
from api.util import filterPairsWithNone

parser = reqparse.RequestParser()
parser.add_argument(
    "phone", type=str, required=True, help="Phone number is required."
)
parser.add_argument(
    "description", type=str, required=False)
parser.add_argument(
    "id", type=str, required=False)
parser.add_argument(
    "lastRecieved", type=int, required=False)

class RelayServerPhoneNumbers(Resource):

    @jwt_required()
    @swag_from(
        "../../specifications/relay-server-phone-number-get.yml", methods=["GET"]
    )
    def get(self):
        phone_numbers = crud.read_all(RelayServerPhoneNumber)
        return [marshal.marshal(f, shallow=True) for f in phone_numbers]

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/relay-server-phone-number-post.yml",
        methods=["POST"],
    )
    def post():
        req = request.get_json(force=True)
        if len(req) == 0:
            abort(400, message="Request body is empty")

        serverDetails = marshal.unmarshal(RelayServerPhoneNumber, req)
        phone = serverDetails.phone
        if crud.read(RelayServerPhoneNumber, phone=phone):
            abort(409, message=f"A SMS relay server is already using {phone}")

        crud.create(serverDetails, refresh=True)
        return {"message": "Relay server phone number added successfully"}, 200

    @staticmethod
    @roles_required([RoleEnum.ADMIN]) #if only admin can post, can only admin put?
    @swag_from(
        "../../specifications/relay-server-phone-number-put.yml",
        methods=["PUT"],
    )
    def put():
      
        req = request.get_json(force=True)
        print("printing self:", req)

        if len(req) == 0:
            abort(400, message="Request body is empty")
        
        serverUpdates = filterPairsWithNone(parser.parse_args())

        print("serverupd:", serverUpdates)

        phone = serverUpdates["phone"]
        phone = serverUpdates["description"]
        id = serverUpdates["id"]

        crud.update(RelayServerPhoneNumber, serverUpdates, id=id)

        return {"message": "Finished update 2"}, 200

