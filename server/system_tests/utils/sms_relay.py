import gzip
import io
import json
from typing import Optional

import requests
from server.common import phone_number_utils
from server.service import compressor

import data.db_operations as crud
from models import (
    SmsSecretKeyOrm,
    UserOrm,
)
from service import encryptor


def get_sms_relay_response(response: requests.Response) -> dict:
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    decrypted_data = encryptor.decrypt(response.text, secret_key.secret_key)
    decoded_string = (
        gzip.GzipFile(fileobj=io.BytesIO(decrypted_data), mode="r").read().decode()
    )
    return json.loads(decoded_string)


def make_sms_relay_json(
    request_number: int,
    method: str,
    endpoint: str,
    headers: Optional[dict[str, str]] = None,
    body: Optional[dict[str, str]] = None,
) -> dict:
    user = crud.read(UserOrm, id=1)
    assert user is not None
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    # update for multiple phone numbers schema: each user is guaranteed to have at least one phone number
    phone_number = phone_number_utils.get_users_phone_numbers(user_id=1)[
        0
    ]  # just need one phone number that belongs to the user

    data = {
        "request_number": request_number,
        "method": method,
        "endpoint": endpoint,
    }

    if headers is not None:
        data["headers"] = headers
    if body is not None:
        data["body"] = json.dumps(body)

    compressed_data = compressor.compress_from_string(json.dumps(data))
    iv = "00112233445566778899aabbccddeeff"
    encrypted_data = encryptor.encrypt(compressed_data, iv, secret_key.secret_key)

    return {"phone_number": phone_number, "encrypted_data": encrypted_data}
