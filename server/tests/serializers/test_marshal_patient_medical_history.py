from data import orm_serializer
from tests.orm_helpers import make_medical_record_orm


def test_marshal_patient_medical_history_returns_empty_dict_when_no_records():
    """
    Verify that marshaling patient medical history with no records returns an empty dict.
    """
    result = orm_serializer.marshal_patient_medical_history()

    assert result == {}


def test_marshal_patient_medical_history_with_medical_only():
    """
    Verify that marshaling patient medical history with only a medical record returns
    a dict with the correct medical history fields and no drug history fields.
    """
    medical = make_medical_record_orm(
        id=101,
        information="Patient has a history of hypertension and asthma.",
        is_drug_record=False,
    )

    result = orm_serializer.marshal_patient_medical_history(medical=medical)

    assert result["medical_history_id"] == 101
    assert (
        result["medical_history"] == "Patient has a history of hypertension and asthma."
    )
    assert "drug_history_id" not in result
    assert "drug_history" not in result


def test_marshal_patient_medical_history_with_drug_only():
    """
    Verify that marshaling patient medical history with only a drug record returns
    a dict with the correct drug history fields and no medical history fields.
    """
    drug = make_medical_record_orm(
        id=202,
        information="Currently taking Paracetamol 500mg twice daily.",
        is_drug_record=True,
    )

    result = orm_serializer.marshal_patient_medical_history(drug=drug)

    assert result["drug_history_id"] == 202
    assert result["drug_history"] == "Currently taking Paracetamol 500mg twice daily."
    assert "medical_history_id" not in result
    assert "medical_history" not in result


def test_marshal_patient_medical_history_with_both_medical_and_drug():
    """
    Verify that marshaling patient medical history with both medical and drug records
    returns a dict with the correct medical history and drug history fields.
    """
    medical = make_medical_record_orm(
        id=1,
        information="History of gestational diabetes.",
        is_drug_record=False,
    )
    drug = make_medical_record_orm(
        id=2,
        information="Metformin 500mg once daily.",
        is_drug_record=True,
    )

    result = orm_serializer.marshal_patient_medical_history(medical=medical, drug=drug)

    # medical side
    assert result["medical_history_id"] == 1
    assert result["medical_history"] == "History of gestational diabetes."

    # drug side
    assert result["drug_history_id"] == 2
    assert result["drug_history"] == "Metformin 500mg once daily."
