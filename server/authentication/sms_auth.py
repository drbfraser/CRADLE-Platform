import jwt

from common import user_utils

"""
The Cognito access token is quite large, and transmitting it along with SMS requests significantly increases the 
number of SMS messages that need to be sent. To reduce the number of SMS messages transmitted, we can take advantage of
the fact that we can authenticate the senders of SMS requests with their SMS secret key. 

To avoid needing to place the Cognito access token in the SMS requests, we can create a secondary access token on the
server once the sender has been authenticated via their SMS secret key.
"""

CRADLE_SMS_ISSUER = "CRADLE-SMS"


def create_sms_access_token(user_id: int):
    sms_secret_key = user_utils.get_user_sms_secret_key_string(user_id)
    if sms_secret_key is None:
        raise ValueError(f"No SMS secret key found for user with ID: {user_id}")

    username = user_utils.get_username_from_id(user_id)

    sms_access_token = jwt.encode(
        payload={"iss": CRADLE_SMS_ISSUER, "sub": str(user_id), "username": username},
        key=sms_secret_key,
    )

    return sms_access_token


def decode_sms_access_token(access_token: str) -> dict:
    payload: dict = jwt.decode(access_token, options={"verify_signature": False})
    # The 'sub' claim is short for 'subject', and refers to the identity of the token holder.
    user_id = payload.get("sub")

    if user_id is None:
        raise ValueError("No 'sub' claim found in access token.")

    sms_secret_key = user_utils.get_user_sms_secret_key_string(user_id)
    if sms_secret_key is None:
        raise ValueError(f"No SMS secret key found for user with ID: {user_id}")

    try:
        payload = jwt.decode(access_token, sms_secret_key)
    except Exception as err:
        print(err)
        raise ValueError(str(err))

    return payload
