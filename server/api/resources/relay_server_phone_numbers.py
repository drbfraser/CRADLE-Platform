from typing import Optional

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import RelayServerPhoneNumberOrm
from validation import CradleBaseModel

# /api/relay/server/phone
api_relay_phone_numbers = APIBlueprint(
    name="relay_server_phone_numbers",
    import_name=__name__,
    url_prefix="/relay/server/phone",
    abp_tags=[Tag(name="SMS Relay Server Phone Numbers", description="")],
)


class RelayServerPhone(CradleBaseModel):
    id: str
    phone_number: str
    description: str
    last_received: Optional[int] = None


# /api/relay/server/phone [GET]
@api_relay_phone_numbers.get("")
def get_all_relay_phone_numbers():
    phone_numbers = crud.read_all(RelayServerPhoneNumberOrm)
    return [marshal.marshal(f, shallow=True) for f in phone_numbers]


# /api/relay/server/phone [POST]
@api_relay_phone_numbers.post("")
@roles_required([RoleEnum.ADMIN])
def create_relay_phone_number(body: RelayServerPhone):
    server_details = marshal.unmarshal(RelayServerPhoneNumberOrm, body.model_dump())
    phone_number = server_details.phone_number
    if crud.read(RelayServerPhoneNumberOrm, phone_number=phone_number):
        return abort(
            409, description=f"An SMS Relay Server is already using {phone_number}"
        )

    crud.create(server_details, refresh=True)
    return {"message": "Relay server phone number added successfully"}, 200


# /api/relay/server/phone [PUT]
@api_relay_phone_numbers.put("")
@roles_required([RoleEnum.ADMIN])
def update_relay_phone_number(body: RelayServerPhone):
    crud.update(RelayServerPhoneNumberOrm, body.model_dump(), id=body.id)
    return {"message": "Relay server updated"}, 200


# /api/relay/server/phone [DELETE]
@api_relay_phone_numbers.delete("")
@roles_required([RoleEnum.ADMIN])
def delete_relay_phone_number(body: RelayServerPhone):
    relay_phone_number = crud.read(RelayServerPhoneNumberOrm, id=body.id)
    if relay_phone_number is None:
        return abort(404, "No Relay Server Phone Number found.")
    crud.delete(relay_phone_number)
    return {"message": "Relay number deleted"}, 200
