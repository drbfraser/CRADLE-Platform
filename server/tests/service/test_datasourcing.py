import pytest

from service.datasourcing import data_sourcing


@pytest.fixture
def sample_data():
    return {
        "id": "testid123",
        "column": "date_of_birth",
        "object": "patient",
        "data_string": "$patient.date_of_birth",
    }


def test_parsing_datastring(sample_data):
    # arrange
    ds = sample_data["data_string"]
    expected_col = sample_data["column"]
    expected_object = sample_data["object"]

    # act
    col = data_sourcing.parse_column_name(ds)
    tb = data_sourcing.parse_object_name(ds)

    # assert
    assert col == expected_col
    assert tb == expected_object


def test_parsing_not_datastring():
    # arrange
    ds = "testvalue"

    # act
    col = data_sourcing.parse_column_name(ds)
    tb = data_sourcing.parse_object_name(ds)

    # assert
    assert col == ""
    assert tb == ""


def test_resolve_datastring(sample_data):
    # arrange
    def mock_callable(id, column):
        return expected

    id = sample_data["id"]
    ds = sample_data["data_string"]
    expected = id + sample_data["column"]

    datasource = {ds: mock_callable}

    # act
    result = data_sourcing.resolve_datastring(id, ds, datasource)

    # assert
    assert result == expected


def test_resolve_datastring_not_found(sample_data):
    # arrange
    def mock_callable(id, column):
        return "should_not_match"

    id = sample_data["id"]
    ds = sample_data["data_string"]
    catalogue = {"$test.test": mock_callable}

    # act
    result = data_sourcing.resolve_datastring(id, ds, catalogue)

    # assert
    assert result is None


@pytest.mark.parametrize(
    "dsl, columns, expected_values",
    [
        (
            ["$test.test", "$test.test1", "$test.not_exists"],
            ["test", "test1", None],
            ["testid123test", "testid123test1", None],
        )
    ],
)
def test_resolve_datasources(dsl, columns, expected_values):
    # arrange
    def mock_callable(id, column):
        return id + column

    id = "testid123"
    catalogue = {dsl[0]: mock_callable, dsl[1]: mock_callable}
    expected = {
        dsl[0]: expected_values[0],
        dsl[1]: expected_values[1],
        dsl[2]: expected_values[2],
    }

    # act
    resolved = data_sourcing.resolve_datasources(id, dsl, catalogue)

    # assert
    assert resolved == expected
