from data import orm_serializer
from tests.orm_helpers import DummyModel, DummyModelSchema


def test_models_to_list_empty_list_returns_empty_list():
    """
    When given an empty list of models, models_to_list should return an empty list.
    """
    models = []
    result = orm_serializer.models_to_list(models, DummyModelSchema)

    assert result == []


def test_models_to_list_single_model_serializes_to_single_dict_in_list():
    """
    For a single model instance, models_to_list should return a one-element list
    containing a dict with the fields defined by the schema.
    """
    model = DummyModel(id=1, name="Alice", active=True)

    result = orm_serializer.models_to_list([model], DummyModelSchema)

    assert isinstance(result, list)
    assert len(result) == 1

    row = result[0]
    assert row == {"id": 1, "name": "Alice", "active": True}


def test_models_to_list_multiple_models_preserves_order_and_fields():
    """
    Test that models_to_list preserves the order of models and their fields.
    """
    models = [
        DummyModel(id=1, name="Alice", active=True),
        DummyModel(id=2, name="Bob", active=False),
        DummyModel(id=3, name="Charlie", active=True),
    ]

    result = orm_serializer.models_to_list(models, DummyModelSchema)

    assert isinstance(result, list)
    assert len(result) == 3

    assert result[0] == {"id": 1, "name": "Alice", "active": True}
    assert result[1] == {"id": 2, "name": "Bob", "active": False}
    assert result[2] == {"id": 3, "name": "Charlie", "active": True}
