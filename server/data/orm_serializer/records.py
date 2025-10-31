from typing import Any, Callable, Dict, Optional
from models import ReadingOrm, ReferralOrm
from .utils import __pre_process

Serializer = Callable[[Any], Dict[str, Any]]

def __marshal_reading(r: ReadingOrm, shallow: bool, rel_serialize: Optional[Serializer] = None) -> dict:
    """
    Serialize a ``ReadingOrm`` to a JSON-ready ``dict``.

    :param r: Reading instance to serialize.
    :param shallow: If ``True``, omit nested relationships.
    :return: Dictionary representation of the reading.
    """
    d = vars(r).copy()
    __pre_process(d)

    if d.get("symptoms"):
        d["symptoms"] = d["symptoms"].split(",")
    else:
        d["symptoms"] = []

    if not shallow and getattr(r, "urine_tests", None) is not None:
        if rel_serialize is not None:
            d["urine_tests"] = rel_serialize(r.urine_tests)
        else:
            # safe fallback to avoid hard dependency
            d["urine_tests"] = {"id": getattr(r.urine_tests, "id", None)}
    else:
        d.pop("urine_tests", None)

    return d


def __marshal_referral(r: ReferralOrm) -> dict:
    """
    Serialize a ``ReferralOrm`` and drop relationship objects (patient, facility).

    :param r: Referral instance to serialize.
    :return: Referral dictionary without relationship objects.
    """
    d = vars(r).copy()
    __pre_process(d)
    # Remove relationship object
    if d.get("health_facility"):
        del d["health_facility"]
    if d.get("patient"):
        del d["patient"]
    return d