import data.db_operations as crud

# has_conflicting_pregnancy_record tests


def test_conflicting_pregnancy_basics(patient_factory, pregnancy_factory):
    patient = patient_factory.create()
    first_pregnancy = pregnancy_factory.create(
        patient_id=patient.id, start_date=100, end_date=200
    )
    pregnancy_factory.create(patient_id=patient.id, start_date=150, end_date=200)

    assert crud.has_conflicting_pregnancy_record(patient.id, 150)

    assert not crud.has_conflicting_pregnancy_record(
        patient.id, 0, 105, first_pregnancy.id
    )

    assert crud.has_conflicting_pregnancy_record(patient.id, 0, 150, first_pregnancy.id)

    assert crud.has_conflicting_pregnancy_record(patient.id, 150, 205)

    assert not crud.has_conflicting_pregnancy_record(patient.id, 205)


def test_conflicting_pregnancy_none(patient_factory):
    patient = patient_factory.create()

    assert not crud.has_conflicting_pregnancy_record(patient.id, 0)


def test_conflicting_pregnancy_invalid_patient():
    assert not crud.has_conflicting_pregnancy_record("Invalid Search Term", 0)
