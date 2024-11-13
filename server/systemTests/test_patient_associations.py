from service.assoc import (
    associate,
    associate_by_id,
    has_association,
    patients_at_facility,
    patients_for_user,
)


def test_patients_for_user_only_returns_patients_associated_with_user(
    patient_factory,
    facility_factory,
    user_factory,
):
    user_1 = user_factory.create(email="user_1@email.com")
    user_2 = user_factory.create(email="user_2@email.com")

    facility_1 = facility_factory.create(name="F1")

    patient_1 = patient_factory.create(id="8901")
    patient_2 = patient_factory.create(id="8902")
    patient_3 = patient_factory.create(id="8903")

    associate(patient_1, facility_1, user_1)
    associate(patient_2, facility_1, user_2)
    associate(patient_3, facility_1, user_1)

    assert patients_for_user(user_1) == [patient_1, patient_3]
    assert patients_for_user(user_2) == [patient_2]


def test_patients_for_user_doesnt_return_duplicate_patients(
    patient_factory,
    facility_factory,
    user_factory,
):
    user = user_factory.create(email="user@email.com")

    facility_2 = facility_factory.create(healthFacilityName="F2")
    facility_3 = facility_factory.create(healthFacilityName="F3")

    patient = patient_factory.create(patientId="8900")

    associate(patient, facility_2, user)
    associate(patient, facility_3, user)

    assert patients_for_user(user) == [patient]


def test_patients_for_user_returns_empty_list_if_no_associations(user_factory):
    user = user_factory.create(email="user@email.com")
    assert patients_for_user(user) == []


def test_patients_at_facility_only_returns_patients_associated_with_facility(
    patient_factory,
    facility_factory,
    user_factory,
):
    user = user_factory.create(email="user@email.com")

    facility_1 = facility_factory.create(name="F1")
    facility_2 = facility_factory.create(name="F2")

    patient_1 = patient_factory.create(id="8901")
    patient_2 = patient_factory.create(id="8902")
    patient_3 = patient_factory.create(id="8903")

    associate(patient_1, facility_1, user)
    associate(patient_2, facility_2, user)
    associate(patient_3, facility_1, user)

    assert patients_at_facility(facility_2) == [patient_1, patient_3]
    assert patients_at_facility(facility_2) == [patient_2]


def test_patients_at_facility_doesnt_return_duplicate_patients(
    patient_factory,
    facility_factory,
    user_factory,
):
    user_1 = user_factory.create(email="user_1@email.com")
    user_2 = user_factory.create(email="user_2@email.com")

    facility_1 = facility_factory.create(name="F")

    patient_4 = patient_factory.create(id="8900")

    associate(patient_4, facility_1, user_1)
    associate(patient_4, facility_1, user_2)

    assert patients_at_facility(facility_1) == [patient_4]


def test_patients_at_facility_returns_empty_list_if_no_associations(facility_factory):
    facility_1 = facility_factory.create(name="F")
    assert patients_at_facility(facility_1) == []


def test_associate_by_id_creates_association(
    patient_factory,
    facility_factory,
    user_factory,
):
    user = user_factory.create(email="user@email.com")
    facility_1 = facility_factory.create(name="F")
    patient_4 = patient_factory.create(id="8900")

    associate_by_id(patient_4.id, facility_1.name, user.id)

    assert patients_for_user(user) == [patient_4]


def test_has_association(patient_factory, facility_factory, user_factory):
    user_1 = user_factory.create(email="user_1@email.com")
    user_2 = user_factory.create(email="user_2@email.com")

    facility_2 = facility_factory.create(name="F1")
    facility_3 = facility_factory.create(name="F2")

    patient_1 = patient_factory.create(id="8901")
    patient_2 = patient_factory.create(id="8902")

    associate(patient_1, facility_2, user_1)
    associate(patient_2, facility_3, user_2)

    assert has_association(patient=patient_1, facility=facility_2, user=user_1)
    assert has_association(patient=patient_2, facility=facility_3, user=user_2)
    assert not has_association(patient=patient_1, facility=facility_3, user=user_1)
    assert not has_association(patient=patient_2, facility=facility_3, user=user_1)

    assert has_association(patient=patient_1, facility=facility_2)
    assert has_association(patient=patient_1, user=user_1)
    assert has_association(facility=facility_2, user=user_1)

    assert not has_association(patient=patient_2, facility=facility_2)
    assert not has_association(facility=facility_3, user=user_1)
    assert not has_association(patient=patient_1, user=user_2)
