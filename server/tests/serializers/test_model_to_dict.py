from data import orm_serializer
from tests.helpers import DummyModel, DummyModelSchema


def test_model_to_dict_returns_none_for_falsy_model():
    """
    If model is falsy (e.g. None), model_to_dict should return None.
    """
    result = orm_serializer.model_to_dict(None, DummyModelSchema)
    assert result is None


def test_model_to_dict_returns_mapping_as_is():
    """
    If model is already a Mapping (e.g. dict) and truthy, model_to_dict should
    return it as-is (same object), without invoking the schema.
    """
    stub = {"id": 1, "name": "Alice", "active": True}

    result = orm_serializer.model_to_dict(stub, DummyModelSchema)

    # same object, not just equal
    assert result is stub
    assert result == {"id": 1, "name": "Alice", "active": True}


def test_model_to_dict_uses_schema_for_non_mapping_model():
    """
    For a non-mapping model instance, model_to_dict should use schema().dump(model)
    and return the serialized dict.
    """
    model = DummyModel(id=2, name="Bob", active=False)

    result = orm_serializer.model_to_dict(model, DummyModelSchema)

    assert isinstance(result, dict)
    assert result == {"id": 2, "name": "Bob", "active": False}
