from typing import Optional, List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import RootModel

from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import RelayServerPhoneNumberOrm, RelayServerLogOrm  # Assuming logs are stored here
from validation import CradleBaseModel

# /api/relay/server/phone
api_relay_phone_numbers = APIBlueprint(
    name="relay_server_phone_numbers",
    import_name=__name__,
    url_prefix="/relay/server/phone",
    abp_tags=[Tag(name="SMS Relay Server Phone Numbers", description="")],
    abp_security=[{"jwt": []}],
)

class RelayServerPhoneNumberModel(CradleBaseModel):
    """Data model for SMS Relay Server phone numbers"""
    id: Optional[str] = None
    phone_number: str
    description: str
    last_received: Optional[int] = None

class RelayServerPhoneNumberList(RootModel):
    """Data model for a list of relay phone numbers"""
    root: list[RelayServerPhoneNumberModel]

class RelayServerLogModel(CradleBaseModel):
    """Data model for a log entry from the relay server"""
    id: str
    phone_number: str
    log_message: str
    timestamp: int

class RelayServerLogList(RootModel):
    """Data model for a list of logs"""
    root: List[RelayServerLogModel]


# /api/relay/server/phone [GET]
@api_relay_phone_numbers.get("", responses={200: RelayServerPhoneNumberList})
def get_all_relay_phone_numbers():
    """Retrieve all SMS Relay Server phone numbers"""
    phone_numbers = crud.read_all(RelayServerPhoneNumberOrm)
    return [marshal.marshal(f, shallow=True) for f in phone_numbers]


# /api/relay/server/phone [POST]
@api_relay_phone_numbers.post("", responses={201: RelayServerPhoneNumberModel})
@roles_required([RoleEnum.ADMIN])
def add_relay_phone_number(body: RelayServerPhoneNumberModel):
    """Add a new SMS Relay Server phone number"""
    server_details = marshal.unmarshal(RelayServerPhoneNumberOrm, body.model_dump())
    phone_number = server_details.phone_number
    if crud.read(RelayServerPhoneNumberOrm, phone_number=phone_number):
        return abort(
            409, description=f"An SMS Relay Server is already using {phone_number}"
        )

    crud.create(server_details, refresh=True)
    return marshal.marshal(server_details, shallow=True), 200


# /api/relay/server/phone [PUT]
@api_relay_phone_numbers.put("", responses={200: RelayServerPhoneNumberModel})
@roles_required([RoleEnum.ADMIN])
def update_relay_phone_number(body: RelayServerPhoneNumberModel):
    """Update details of an existing SMS Relay Server phone number"""
    crud.update(RelayServerPhoneNumberOrm, body.model_dump(), id=body.id)
    relay_server_phone_number_orm = crud.read(RelayServerPhoneNumberOrm, id=body.id)
    return marshal.marshal(relay_server_phone_number_orm, shallow=True), 200


# /api/relay/server/phone [DELETE]
@api_relay_phone_numbers.delete("")
@roles_required([RoleEnum.ADMIN])
def delete_relay_phone_number(body: RelayServerPhoneNumberModel):
    """Delete an SMS Relay Server phone number"""
    relay_phone_number = crud.read(RelayServerPhoneNumberOrm, id=body.id)
    if relay_phone_number is None:
        return abort(404, "No Relay Server Phone Number found.")
    crud.delete(relay_phone_number)
    return {"message": "Relay number deleted"}, 200


# ✅ NEW ENDPOINT: /api/relay/server/phone/logs/<phone_number> [GET]
@api_relay_phone_numbers.get("/logs/<string:phone_number>", responses={200: RelayServerLogList})
@roles_required([RoleEnum.ADMIN])
def download_logs(phone_number: str):
    """
    Retrieve logs associated with a given SMS Relay Server phone number.

    - Admins can fetch logs for any relay server phone.
    - If no logs exist, return an empty list.
    - If the phone number does not exist, return a 404 error.
    """
    # Check if the phone number exists in the database
    relay_phone_number = crud.read(RelayServerPhoneNumberOrm, phone_number=phone_number)
    if relay_phone_number is None:
        return abort(404, f"No relay server phone number found for {phone_number}.")

    # Fetch logs associated with this phone number
    logs = crud.read_all(RelayServerLogOrm, phone_number=phone_number)

    return marshal.marshal(logs, shallow=True), 200

