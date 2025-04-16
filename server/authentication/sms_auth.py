import jwt

from data import crud
from models import SmsSecretKeyOrm, UserOrm

"""
The Cognito access token is quite large, and transmitting it along with SMS requests significantly increases the 
number of SMS messages that need to be sent. To reduce the number of SMS messages transmitted, we can take advantage of
the fact that we can authenticate the senders of SMS requests with their SMS secret key. 

To avoid needing to place the Cognito access token in the SMS requests, we can create a secondary access token on the
server once the sender has been authenticated via their SMS secret key.
"""

CRADLE_SMS_ISSUER = "CRADLE-SMS"
ALGORITHM = "HS256"


def _get_sms_secret_key(user_id: int) -> str:
    sms_secret_key_orm = crud.read(SmsSecretKeyOrm, user_id=user_id)
    if sms_secret_key_orm is None:
        raise ValueError(f"No SMS secret key found for user with ID: {user_id}")
    return sms_secret_key_orm.secret_key


def create_sms_access_token(user_id: int):
    user_orm = crud.read(UserOrm, id=user_id)
    if user_orm is None:
        raise ValueError(f"No user found with ID: {user_id}")

    sms_secret_key = _get_sms_secret_key(user_id)

    username: str = user_orm.username

    sms_access_token = jwt.encode(
        payload={"iss": CRADLE_SMS_ISSUER, "sub": str(user_id), "username": username},
        key=sms_secret_key,
        algorithm=ALGORITHM,
    )
    return sms_access_token


def decode_sms_access_token(access_token: str) -> dict:
    payload: dict = jwt.decode(access_token, options={"verify_signature": False})
    # The 'sub' claim is short for 'subject', and refers to the identity of the token holder.
    sub_claim = payload.get("sub")

    if sub_claim is None:
        raise ValueError("No 'sub' claim found in access token.")
    user_id = int(sub_claim)

    sms_secret_key = _get_sms_secret_key(user_id)
    if sms_secret_key is None:
        raise ValueError(f"No SMS secret key found for user with ID: {user_id}")

    try:
        payload = jwt.decode(
            jwt=access_token, key=sms_secret_key, algorithms=[ALGORITHM]
        )
    except Exception as err:
        print(err)
        raise ValueError(str(err))

    return payload
