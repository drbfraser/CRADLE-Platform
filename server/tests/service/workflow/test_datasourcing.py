from service.workflow.datasourcing import data_sourcing
from service.workflow.datasourcing.data_sourcing import DatasourceVariable


def test_datasource_variable_from_string():
    var = DatasourceVariable.from_string("patient.age")

    assert var is not None
    assert var.obj.name == "patient"
    assert var.attr.name == "age"
    assert var.to_string() == "patient.age"
    assert str(var) == "patient.age"


def test_datasource_variable_from_invalid_string():
    var = DatasourceVariable.from_string("invalidformat")

    assert var is None


def test_datasource_variable_hashable():
    var1 = DatasourceVariable.from_string("patient.age")
    var2 = DatasourceVariable.from_string("patient.age")
    var3 = DatasourceVariable.from_string("patient.sex")

    assert var1 == var2
    assert hash(var1) == hash(var2)

    assert var1 != var3

    var_set = {var1, var2, var3}
    assert len(var_set) == 2


def test_resolve_variable():
    def mock_callable(id):
        return {"date_of_birth": "1990-01-01"}

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.date_of_birth")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result == "1990-01-01"


def test_resolve_variable_not_found():
    def mock_callable(id):
        return {"test": "not found"}

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.date_of_birth")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result is None


def test_resolve_variable_with_none_object():
    def mock_callable(id):
        return None

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.date_of_birth")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result is None


def test_resolve_variable_with_custom_attribute():
    def mock_object_resolution(id):
        return {"base_value": 100}

    def mock_custom_resolution(obj):
        return obj.get("base_value") * 2

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.custom_attr")
    catalogue = {
        "patient": {
            "query": mock_object_resolution,
            "custom": {"custom_attr": mock_custom_resolution},
        }
    }

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result == 200


def test_resolve_variable_with_object_specific_id():
    def mock_assessment_query(id):
        if id == "assessment_456":
            return {"score": 85, "risk_level": "HIGH"}
        return None

    context = {"patient_id": "patient_123", "assessment_id": "assessment_456"}
    var = DatasourceVariable.from_string("assessment.score")
    catalogue = {"assessment": {"query": mock_assessment_query, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result == 85


def test_resolve_variables():
    def mock_object_resolution(id):
        return {
            "test": "test",
            "test1": "test1",
            "not_exists": None,
            "test-custom": 123,
        }

    def mock_custom_resolution(obj):
        return obj.get("test-custom") - 123

    context = {"patient_id": "testid123"}

    variables = [
        DatasourceVariable.from_string("test.test"),
        DatasourceVariable.from_string("test.test1"),
        DatasourceVariable.from_string("test.not_exists"),
        DatasourceVariable.from_string("test.custom"),
    ]

    catalogue = {
        "test": {
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

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected


def test_resolve_variables_with_missing_object():
    def mock_object_resolution(id):
        return None

    context = {"patient_id": "testid123"}
    variables = [
        DatasourceVariable.from_string("patient.age"),
        DatasourceVariable.from_string("patient.name"),
    ]
    catalogue = {"patient": {"query": mock_object_resolution, "custom": {}}}
    expected = {
        "patient.age": None,
        "patient.name": None,
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected


def test_resolve_variables_multiple_objects():
    def mock_patient_resolution(id):
        return {"age": 30, "name": "John"}

    def mock_reading_resolution(id):
        return {"systolic": 120, "diastolic": 80}

    context = {"patient_id": "testid123"}
    variables = [
        DatasourceVariable.from_string("patient.age"),
        DatasourceVariable.from_string("patient.name"),
        DatasourceVariable.from_string("reading.systolic"),
        DatasourceVariable.from_string("reading.diastolic"),
    ]
    catalogue = {
        "patient": {"query": mock_patient_resolution, "custom": {}},
        "reading": {"query": mock_reading_resolution, "custom": {}},
    }
    expected = {
        "patient.age": 30,
        "patient.name": "John",
        "reading.systolic": 120,
        "reading.diastolic": 80,
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected


def test_resolve_variables_with_mixed_context():
    def mock_patient_resolution(id):
        if id == "patient_123":
            return {"age": 30, "sex": "FEMALE"}
        return None

    def mock_assessment_resolution(id):
        if id == "assessment_456":
            return {"score": 85, "risk_level": "HIGH"}
        return None

    context = {"patient_id": "patient_123", "assessment_id": "assessment_456"}

    variables = [
        DatasourceVariable.from_string("patient.age"),
        DatasourceVariable.from_string("patient.sex"),
        DatasourceVariable.from_string("assessment.score"),
        DatasourceVariable.from_string("assessment.risk_level"),
    ]
    catalogue = {
        "patient": {"query": mock_patient_resolution, "custom": {}},
        "assessment": {"query": mock_assessment_resolution, "custom": {}},
    }
    expected = {
        "patient.age": 30,
        "patient.sex": "FEMALE",
        "assessment.score": 85,
        "assessment.risk_level": "HIGH",
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected
