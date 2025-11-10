import pytest

from service.workflow.datasourcing import data_sourcing


@pytest.fixture
def sample_data():
    return {
        "id": "testid123",
        "attribute": "date_of_birth",
        "object": "patient",
        "variable": "patient.date_of_birth",
    }


def test_parsing_variable(sample_data):
    var = sample_data["variable"]
    expected_col = sample_data["attribute"]
    expected_object = sample_data["object"]

    # act
    col = data_sourcing.parse_attribute_name(var)
    obj = data_sourcing.parse_object_name(var)

    # assert
    assert col == expected_col
    assert obj == expected_object


def test_parsing_invalid_variable():
    var = "testvalue"  

    col = data_sourcing.parse_attribute_name(var)
    obj = data_sourcing.parse_object_name(var)

    assert col == ""
    assert obj == "testvalue" 


def test_resolve_variable(sample_data):
    def mock_callable(id):
        return {attr: expected}

    id = sample_data["id"]
    obj = sample_data["object"]
    var = sample_data["variable"]
    attr = sample_data["attribute"]
    expected = 123123
    catalogue = {obj: {"query": mock_callable}}

    result = data_sourcing.resolve_variable(id, var, catalogue)

    assert result == expected


def test_resolve_variable_not_found(sample_data):
    def mock_callable(id):
        return {"test": "not found"}

    id = sample_data["id"]
    obj = sample_data["object"]
    var = sample_data["variable"]
    catalogue = {obj: {"query": mock_callable}}

    result = data_sourcing.resolve_variable(id, var, catalogue)

    assert result is None


def test_resolve_variable_with_none_object(sample_data):
    def mock_callable(id):
        return None

    id = sample_data["id"]
    obj = sample_data["object"]
    var = sample_data["variable"]
    catalogue = {obj: {"query": mock_callable}}

    result = data_sourcing.resolve_variable(id, var, catalogue)

    assert result is None


def test_resolve_variable_with_custom_attribute(sample_data):
    def mock_object_resolution(id):
        return {"base_value": 100}
    
    def mock_custom_resolution(obj):
        return obj.get("base_value") * 2

    id = sample_data["id"]
    var = "patient.custom_attr"
    catalogue = {
        "patient": {
            "query": mock_object_resolution,
            "custom": {"custom_attr": mock_custom_resolution}
        }
    }

    result = data_sourcing.resolve_variable(id, var, catalogue)

    assert result == 200


@pytest.mark.parametrize(
    "variables, objects, object_instance",
    [
        (
            ["test.test", "test.test1", "test.not_exists", "test.custom"],
            ["test"],
            {"test": "test", "test1": "test1", "not_exists": None, "test-custom": 123},
        )
    ],
)
def test_resolve_variables(variables, objects, object_instance):
    def mock_object_resolution(id):
        return object_instance

    def mock_custom_resolution(obj):
        return obj.get("test-custom") - 123

    id = "testid123"
    catalogue = {
        objects[0]: {
            "query": mock_object_resolution,
            "custom": {"custom": mock_custom_resolution},
        },
    }
    expected = {
        "test.test": "test",
        "test.test1": "test1",
        "test.not_exists": None,
        "test.custom": 0,
    }

    resolved = data_sourcing.resolve_variables(id, variables, catalogue)

    assert resolved == expected


def test_resolve_variables_with_missing_object():
    def mock_object_resolution(id):
        return None  

    id = "testid123"
    variables = ["patient.age", "patient.name"]
    catalogue = {
        "patient": {
            "query": mock_object_resolution,
            "custom": {}
        }
    }
    expected = {
        "patient.age": None,
        "patient.name": None,
    }

    resolved = data_sourcing.resolve_variables(id, variables, catalogue)

    assert resolved == expected


def test_resolve_variables_multiple_objects():
    def mock_patient_resolution(id):
        return {"age": 30, "name": "John"}
    
    def mock_reading_resolution(id):
        return {"systolic": 120, "diastolic": 80}

    id = "testid123"
    variables = ["patient.age", "patient.name", "reading.systolic", "reading.diastolic"]
    catalogue = {
        "patient": {
            "query": mock_patient_resolution,
            "custom": {}
        },
        "reading": {
            "query": mock_reading_resolution,
            "custom": {}
        }
    }
    expected = {
        "patient.age": 30,
        "patient.name": "John",
        "reading.systolic": 120,
        "reading.diastolic": 80,
    }

    resolved = data_sourcing.resolve_variables(id, variables, catalogue)

    assert resolved == expected
