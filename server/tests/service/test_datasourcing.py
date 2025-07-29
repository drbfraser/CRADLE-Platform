import pytest
from service.datasourcing import data_sourcing

@pytest.fixture
def sample_data():
    return {
        "id": "testid123",
        "column": "date_of_birth",
        "table": "patient",
        "data_string": "$patient.date_of_birth"
    }

def test_parsing_datastring(sample_data):
    # arrange
    ds = sample_data["data_string"]
    expected_col = sample_data["column"]
    expected_table = sample_data["table"]

    # act
    col = data_sourcing.__parse_column_name(ds)
    tb = data_sourcing.__parse_table_name(ds)

    # assert
    assert col == expected_col
    assert tb == expected_table

def test_resolve_datastring(sample_data):
    # arrange
    id = sample_data["id"]
    ds = sample_data["data_string"]
    expected = id + sample_data["column"]
    datasource = {ds: lambda id, column: expected}

    # act
    result = data_sourcing.resolve_datastring(id, ds, datasource)

    # assert
    assert result == expected


def test_resolve_datastring_not_found(sample_data):
    # arrange
    id = sample_data["id"]
    ds = sample_data["data_string"]
    catalouge = {"$test.test": lambda id, column: "should_not_match"}

    # act
    result = data_sourcing.resolve_datastring(id, ds, catalouge)

    # assert
    assert result is None
    

@pytest.mark.parametrize("dsl, columns, expected_values", [
    (
        ["$test.test", "$test.test1", "$test.not_exists"],
        ["test", "test1", None],
        ["testid123test", "testid123test1", None]
    )
])
def test_resolve_datasources(dsl, columns, expected_values):
    # arrange
    id = "testid123"
    query = lambda id, column: id + column
    catalogue = {
        dsl[0]: query,
        dsl[1]: query
    }
    expected = {
        dsl[0]: expected_values[0],
        dsl[1]: expected_values[1],
        dsl[2]: expected_values[2]
    }

    # act
    resolved = data_sourcing.resolve_datasources(id, dsl, catalogue)

    # assert
    assert resolved == expected
    
    