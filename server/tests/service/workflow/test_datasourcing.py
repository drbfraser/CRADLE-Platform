from unittest.mock import patch

from service.workflow.datasourcing import data_sourcing
from service.workflow.datasourcing.data_sourcing import DatasourceVariable
from validation.assessments import AssessmentModel
from validation.patients import PatientModel
from validation.readings import ReadingModel


REAL_MODEL_REGISTRY = {
    "patient": PatientModel,
    "assessment": AssessmentModel,
    "reading": ReadingModel,
}


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


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variable():
    def mock_callable(id):
        return {
            "id": "patient_123",
            "name": "Test Patient",
            "sex": "FEMALE",
            "date_of_birth": "1990-01-01",
            "is_exact_date_of_birth": True,
        }

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.date_of_birth")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result == "1990-01-01"


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variable_not_found():
    def mock_callable(id):
        return {
            "id": "patient_123",
            "name": "Test Patient",
            "sex": "FEMALE",
            "date_of_birth": "1990-01-01",
            "is_exact_date_of_birth": True,
        }

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.zone")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result is None


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variable_with_none_object():
    def mock_callable(id):
        return None

    context = {"patient_id": "testid123"}
    var = DatasourceVariable.from_string("patient.date_of_birth")
    catalogue = {"patient": {"query": mock_callable, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result is None


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variable_with_object_specific_id():
    def mock_assessment_query(id):
        if id == "assessment_456":
            return {
                "id": "assessment_456",
                "patient_id": "patient_123",
                "date_assessed": 1234567890,
                "follow_up_needed": False,
            }
        return None

    context = {"patient_id": "patient_123", "assessment_id": "assessment_456"}
    var = DatasourceVariable.from_string("assessment.date_assessed")
    catalogue = {"assessment": {"query": mock_assessment_query, "custom": {}}}

    result = data_sourcing.resolve_variable(context, var, catalogue)

    assert result == 1234567890


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variables_with_missing_object():
    def mock_object_resolution(id):
        return None

    context = {"patient_id": "testid123"}
    variables = [
        DatasourceVariable.from_string("patient.name"),
        DatasourceVariable.from_string("patient.sex"),
    ]
    catalogue = {"patient": {"query": mock_object_resolution, "custom": {}}}
    expected = {
        "patient.name": None,
        "patient.sex": None,
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variables_multiple_objects():
    def mock_patient_resolution(id):
        return {
            "id": "patient_123",
            "name": "John",
            "sex": "MALE",
            "date_of_birth": "1990-01-01",
            "is_exact_date_of_birth": True,
        }

    def mock_reading_resolution(id):
        return {
            "id": "reading_123",
            "patient_id": "patient_123",
            "systolic_blood_pressure": 120,
            "diastolic_blood_pressure": 80,
            "heart_rate": 70,
            "date_taken": 1234567890,
            "is_flagged_for_follow_up": False,
        }

    context = {"patient_id": "testid123"}
    variables = [
        DatasourceVariable.from_string("patient.name"),
        DatasourceVariable.from_string("reading.systolic_blood_pressure"),
        DatasourceVariable.from_string("reading.diastolic_blood_pressure"),
    ]
    catalogue = {
        "patient": {"query": mock_patient_resolution, "custom": {}},
        "reading": {"query": mock_reading_resolution, "custom": {}},
    }
    expected = {
        "patient.name": "John",
        "reading.systolic_blood_pressure": 120,
        "reading.diastolic_blood_pressure": 80,
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected


@patch.object(data_sourcing, "MODEL_REGISTRY", REAL_MODEL_REGISTRY)
def test_resolve_variables_with_mixed_context():
    def mock_patient_resolution(id):
        if id == "patient_123":
            return {
                "id": "patient_123",
                "name": "Mary",
                "sex": "FEMALE",
                "date_of_birth": "1990-01-01",
                "is_exact_date_of_birth": True,
            }
        return None

    def mock_assessment_resolution(id):
        if id == "assessment_456":
            return {
                "id": "assessment_456",
                "patient_id": "patient_123",
                "date_assessed": 1234567890,
                "follow_up_needed": False,
            }
        return None

    context = {"patient_id": "patient_123", "assessment_id": "assessment_456"}

    variables = [
        DatasourceVariable.from_string("patient.name"),
        DatasourceVariable.from_string("patient.sex"),
        DatasourceVariable.from_string("assessment.date_assessed"),
        DatasourceVariable.from_string("assessment.follow_up_needed"),
    ]
    catalogue = {
        "patient": {"query": mock_patient_resolution, "custom": {}},
        "assessment": {"query": mock_assessment_resolution, "custom": {}},
    }
    expected = {
        "patient.name": "Mary",
        "patient.sex": "FEMALE",
        "assessment.date_assessed": 1234567890,
        "assessment.follow_up_needed": False,
    }

    resolved = data_sourcing.resolve_variables(context, variables, catalogue)

    assert resolved == expected