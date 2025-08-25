import pytest

from service.datasourcing import data_sourcing


@pytest.fixture
def sample_data():
    return {
        "id": "testid123",
        "attribute": "date_of_birth",
        "object": "patient",
        "data_string": "$patient.date_of_birth",
    }


def test_parsing_datastring(sample_data):
    # arrange
    ds = sample_data["data_string"]
    expected_col = sample_data["attribute"]
    expected_object = sample_data["object"]

    # act
    col = data_sourcing.parse_attribute_name(ds)
    tb = data_sourcing.parse_object_name(ds)

    # assert
    assert col == expected_col
    assert tb == expected_object


def test_parsing_not_datastring():
    # arrange
    ds = "testvalue"

    # act
    col = data_sourcing.parse_attribute_name(ds)
    tb = data_sourcing.parse_object_name(ds)

    # assert
    assert col == ""
    assert tb == ""


def test_resolve_datastring(sample_data):
    # arrange
    def mock_callable(id):
        return {attr: expected}

    id = sample_data["id"]
    obj = sample_data["object"]
    ds = sample_data["data_string"]
    attr = sample_data["attribute"]
    expected = 123123
    catalogue = {obj: {"query": mock_callable}}

    # act
    result = data_sourcing.resolve_datastring(id, ds, catalogue)

    # assert
    assert result == expected


def test_resolve_datastring_not_found(sample_data):
    # arrange
    def mock_callable(id):
        return {"test": "not found"}

    id = sample_data["id"]
    obj = sample_data["object"]
    ds = sample_data["data_string"]
    catalogue = {obj: {"query": mock_callable}}

    # act
    result = data_sourcing.resolve_datastring(id, ds, catalogue)

    # assert
    assert result is None


@pytest.mark.parametrize(
    "dsl, objects, object_instance",
    [
        (
            ["$test.test", "$test.test1", "$test.not_exists", "$test.custom"],
            ["test"],
            {"test": "test", "test1": "test1", "not_exists": None, "test-custom": 123},
        )
    ],
)
def test_resolve_datasources(dsl, objects, object_instance):
    # arrange
    def mock_object_resolution(id):
        return object_instance

    def mock_custom_resolution(object):
        return object.get("test-custom") - 123

    id = "testid123"
    catalogue = {
        objects[0]: {
            "query": mock_object_resolution,
            "custom": {"custom": mock_custom_resolution},
        },
    }
    expected = {
        "$test.test": "test",
        "$test.test1": "test1",
        "$test.not_exists": None,
        "$test.custom": 0,
    }

    # act
    resolved = data_sourcing.resolve_datasources(id, dsl, catalogue)

    # assert
    assert resolved == expected
