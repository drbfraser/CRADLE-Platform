from typing import Any, Dict, Type
from typing import Dict, Any
from enum import Enum
from data.db_operations import M

from models import get_schema_for_model

def __pre_process(d: Dict[str, Any]):
    """
    In-place cleanup: remove private/``None`` fields and coerce ``Enum`` values.

    :param d: Mutable dictionary to sanitize in place.
    :return: ``None``.
    """
    __strip_protected_attributes(d)
    __strip_none_values(d)
    for k, v in d.items():
        if isinstance(v, Enum):
            d[k] = v.value


def __strip_none_values(d: Dict[str, Any]):
    """
    Remove keys whose values are ``None`` (mutates ``d``).

    :param d: Dictionary to mutate.
    :return: ``None``.
    """
    remove = [k for k in d if d[k] is None]
    for k in remove:
        del d[k]


def __strip_protected_attributes(d: Dict[str, Any]):
    """
    Remove attributes starting with ``_`` (mutates ``d``).

    :param d: Dictionary to mutate.
    :return: ``None``.
    """
    remove = [k for k in d if k.startswith("_")]
    for k in remove:
        del d[k]

def __load(m: Type[M], d: dict) -> M:
    """
    Load a model instance from ``dict`` using the model's Marshmallow schema.

    :param m: Model class to load.
    :param d: Field dictionary for the model.
    :return: Deserialized model instance.
    :raises marshmallow.ValidationError: If validation fails.
    """
    schema = get_schema_for_model(m)
    return schema().load(d)

