from models import RelayServerPhoneNumberOrm, SmsSecretKeyOrm

from .registry import register_legacy
from .utils import __load


def __unmarshal_RelayServerPhoneNumber(d: dict) -> RelayServerPhoneNumberOrm:
    """
    Construct a ``RelayServerPhoneNumberOrm`` and copy simple scalar fields.

    :param d: Relay server phone payload dictionary.
    :return: ``RelayServerPhoneNumberOrm`` instance.
    """
    relay_server_phone = __load(RelayServerPhoneNumberOrm, d)
    relay_server_phone.phone = d["phone"]
    relay_server_phone.description = d["description"]
    return relay_server_phone


def __marshal_SmsSecretKey(s: SmsSecretKeyOrm) -> dict:
    """
    Serialize an ``SmsSecretKeyOrm``; preserve raw datetime fields.

    :param s: SmsSecretKey instance to serialize.
    :return: Dict with ``id``, ``user_id``, ``secret_key``, ``stale_date``, ``expiry_date``.
    """
    return {
        "id": s.id,
        "user_id": s.user_id,
        "secret_key": s.secret_key,
        "stale_date": s.stale_date,
        "expiry_date": s.expiry_date,
    }


def __unmarshal_SmsSecretKey(d: dict) -> SmsSecretKeyOrm:
    """
    Construct an ``SmsSecretKeyOrm`` and copy scalar fields from the payload.

    :param d: SMS secret key payload dictionary.
    :return: ``SmsSecretKeyOrm`` instance.
    """
    sms_secret_key = __load(SmsSecretKeyOrm, d)
    sms_secret_key.user_id = d["user_id"]
    sms_secret_key.secret_key = d["secret_key"]
    sms_secret_key.stale_date = d["stale_date"]
    sms_secret_key.expiry_date = d["expiry_date"]
    return sms_secret_key


register_legacy(
    RelayServerPhoneNumberOrm,
    marshal_helper=None,
    marshal_mode="",
    unmarshal_helper=__unmarshal_RelayServerPhoneNumber,
    type_label="relay_server_phone",
)
register_legacy(
    SmsSecretKeyOrm,
    marshal_helper=__marshal_SmsSecretKey,
    marshal_mode="",
    unmarshal_helper=__unmarshal_SmsSecretKey,
    type_label="sms_secret_key",
)
