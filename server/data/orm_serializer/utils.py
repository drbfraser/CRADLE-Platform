import importlib
from collections.abc import Mapping
from contextlib import nullcontext
from enum import Enum
from typing import Any, Dict, List, Optional, Type

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


def models_to_list(models: List[Any], schema) -> List[dict]:
    """
    Converts a list of models into a list of dictionaries mapping column names
    to values.

    :param models: List of model instances.
    :param schema: The schema of the models
    :return: List of dictionaries.
    """
    return schema(many=True).dump(models)


def model_to_dict(model: Any, schema) -> Optional[dict]:
    """
    Converts a model into a dictionary mapping column names to values.

    :param model: Model instance (or mapping stub).
    :param schema: The schema of the model
    :return: Dict, or ``None`` if ``model`` is falsy. Returns ``model`` as-is if it
        already implements ``Mapping`` (local DB stub).
    """
    if not model:
        return None
    if isinstance(model, Mapping):  # Local database stub
        return model
    return schema().dump(model)


def _no_autoflush_ctx():
    """
    Return a context manager that disables autoflush for the ORM session.

    If the ORM session is not found, return a nullcontext that does nothing.

    The context manager is used to prevent the ORM from automatically flushing
    changes to the database when a model instance is loaded/unloaded.

    :return: A context manager that disables autoflush for the ORM session.
    :rtype: typing.ContextManager
    """
    try:
        pkg = importlib.import_module("data.orm_serializer")
        sess = getattr(pkg, "db_session", None)
        ctx = getattr(sess, "no_autoflush", None)
        return ctx if ctx is not None else nullcontext()
    except Exception:
        return nullcontext()
