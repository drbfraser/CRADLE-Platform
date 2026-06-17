from data import orm_serializer
from models import QuestionOrm
from tests.orm_helpers import (
    make_form_orm,
    make_medical_record_orm,
    make_pregnancy_orm,
    make_reading_orm,
    make_urine_test_orm,
)


def test_marshal_with_type_reading_sets_type_and_normalizes_symptoms():
    """
    Test that marshaling a ReadingOrm with shallow=True sets the "type" field to "reading"
    and normalizes the "symptoms" field from a CSV string to a list of strings.
    """
    reading = make_reading_orm(id="reading-1", symptoms="headache,fatigue")

    result = orm_serializer.marshal_with_type(reading, shallow=True)

    assert result["type"] == "reading"
    assert result["id"] == "reading-1"

    assert result["symptoms"] == ["headache", "fatigue"]


def test_marshal_with_type_reading_shallow_omits_nested_urine_tests():
    """
    Test that marshaling a ReadingOrm with shallow=True omits the nested urine_tests
    relationship, while marshaling with shallow=False includes the nested relationship.
    """
    parent = make_reading_orm(id="reading-parent", symptoms=None)

    nested = make_urine_test_orm(id=123, reading=parent)

    assert parent.urine_tests is nested

    shallow_result = orm_serializer.marshal_with_type(parent, shallow=True)
    assert shallow_result["type"] == "reading"
    assert "urine_tests" not in shallow_result

    deep_result = orm_serializer.marshal_with_type(parent, shallow=False)
    assert deep_result["type"] == "reading"
    assert "urine_tests" in deep_result
    assert isinstance(deep_result["urine_tests"], dict)
    # UrineTestOrm.id is an int primary key
    assert deep_result["urine_tests"]["id"] == 123


def test_marshal_with_type_pregnancy_sets_type_and_preserves_core_fields():
    """
    Test that marshaling a PregnancyOrm with shallow=True sets the "type" field to "pregnancy"
    and preserves the core scalar fields like id, start_date, end_date, and outcome.
    """
    pregnancy = make_pregnancy_orm(
        id=7,
        start_date=1_700_100_000,
        end_date=1_700_900_000,
        outcome="live birth",
    )

    result = orm_serializer.marshal_with_type(pregnancy, shallow=True)

    assert result["type"] == "pregnancy"
    assert result["id"] == 7
    assert result["start_date"] == 1_700_100_000
    assert result["end_date"] == 1_700_900_000
    assert result["outcome"] == "live birth"


def test_marshal_with_type_medical_record_sets_type():
    """
    Test that marshaling a MedicalRecordOrm with shallow=True sets the "type" field to "medical_record"
    and routes `information` into `medical_history` when is_drug_record is False.
    """
    mr = make_medical_record_orm(
        id=42,
        information="Patient has a history of hypertension.",
        is_drug_record=False,
    )

    result = orm_serializer.marshal_with_type(mr, shallow=True)

    assert result["type"] == "medical_record"
    assert result["id"] == 42
    assert "information" not in result
    assert "drug_history" not in result
    assert result["medical_history"] == "Patient has a history of hypertension."


def test_marshal_with_type_medical_record_routes_drug_history():
    """
    Test that marshaling a MedicalRecordOrm with shallow=True sets the "type" field to "medical_record"
    and routes `information` into `drug_history` when is_drug_record is True.
    """
    mr = make_medical_record_orm(
        id=7,
        information="Paracetamol 500mg daily",
        is_drug_record=True,
    )

    result = orm_serializer.marshal_with_type(mr, shallow=True)

    assert result["type"] == "medical_record"
    assert result["id"] == 7
    assert "information" not in result
    assert "medical_history" not in result
    assert result["drug_history"] == "Paracetamol 500mg daily"


def test_marshal_with_type_form_sets_type_and_uses_shallow_form_marshalling():
    """
    Test that marshaling a FormOrm with shallow=True sets the "type" field to "form",
    omits the patient relationship, and omits the questions list even though the form has questions.
    Test that marshaling a FormOrm with shallow=False also omits the patient relationship and questions list.
    """
    form = make_form_orm(
        id="form-123",
        name="ANC Intake",
        lang="en",
    )

    question = QuestionOrm()
    question.form = form

    result_shallow = orm_serializer.marshal_with_type(form, shallow=True)

    assert result_shallow["type"] == "form"
    assert result_shallow["id"] == "form-123"

    assert "patient" not in result_shallow
    assert "questions" not in result_shallow

    result_deep = orm_serializer.marshal_with_type(form, shallow=False)

    assert result_deep["type"] == "form"
    assert result_deep["id"] == "form-123"
    assert "patient" not in result_deep
    assert "questions" not in result_deep


class _RandomCustomObject:
    def __init__(self) -> None:
        self.id = "custom-1"
        self.label = "just a custom object"


def test_marshal_with_type_unrecognized_object_falls_back_to_other_type():
    """
    Test that marshaling an unrecognized object with shallow=True sets the "type" field to "other",
    and that __pre_process may drop private/None/invalid attributes, but basic public ones
    like 'id' and 'label' should survive.
    """
    obj = _RandomCustomObject()

    result = orm_serializer.marshal_with_type(obj, shallow=True)

    assert result["type"] == "other"
    # __pre_process may drop private/None/invalid attributes, but basic public ones
    # like 'id' and 'label' should survive.
    assert result["id"] == "custom-1"
    assert result["label"] == "just a custom object"
