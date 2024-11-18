from flasgger import swag_from
from flask_restful import Resource, abort, reqparse

from api.decorator import roles_required
from api.util import filterPairsWithNone
from common import api_utils
from data import crud, marshal
from enums import RoleEnum
from models import RelayServerPhoneNumberOrm

parser = reqparse.RequestParser()
parser.add_argument("phone", type=str, required=True, help="Phone number is required.")
parser.add_argument("description", type=str, required=False)
parser.add_argument(
    "id",
    type=str,
    required=True,
    help="ID is required for this operation.",
)
parser.add_argument("last_received", type=int, required=False)


class RelayServerPhoneNumbers(Resource):
    @swag_from(
        "../../specifications/relay-server-phone-number-get.yml",
        methods=["GET"],
    )
    def get(self):
        phone_numbers = crud.read_all(RelayServerPhoneNumberOrm)
        return [marshal.marshal(f, shallow=True) for f in phone_numbers]

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/relay-server-phone-number-post.yml",
        methods=["POST"],
    )
    def post():
        request_body = api_utils.get_request_body()
        if len(request_body) == 0:
            abort(400, message="Request body is empty")
            return None

        server_details = marshal.unmarshal(RelayServerPhoneNumberOrm, request_body)
        phone_number = server_details.phone_number
        if crud.read(RelayServerPhoneNumberOrm, phone_number=phone_number):
            abort(409, message=f"A SMS relay server is already using {phone_number}")
            return None

        crud.create(server_details, refresh=True)
        return {"message": "Relay server phone number added successfully"}, 200

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/relay-server-phone-number-put.yml",
        methods=["PUT"],
    )
    def put():
        request_body = api_utils.get_request_body()

        if len(request_body) == 0:
            abort(400, message="Request body is empty")
            return None

        server_updates = filterPairsWithNone(parser.parse_args())

        if "id" not in server_updates:
            return {"message": "No id found in the request"}, 400

        id = server_updates["id"]

        crud.update(RelayServerPhoneNumberOrm, server_updates, id=id)

        return {"message": "Relay server updated"}, 200

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/relay-server-phone-number-delete.yml",
        methods=["DELETE"],
    )
    def delete():
        request_body = api_utils.get_request_body()

        if len(request_body) == 0:
            abort(400, message="Request body is empty")
            return None

        server_delete = filterPairsWithNone(parser.parse_args())

        if "id" not in server_delete:
            return {"message": "No id found in the request"}, 400

        id = server_delete["id"]

        num = crud.read(RelayServerPhoneNumberOrm, id=id)

        if num is None:
            return {"message": "Relay server does not contain a number"}, 400

        crud.delete(num)

        return {"message": "Relay number deleted"}, 200
