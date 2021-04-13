from service.assoc import (
    patients_for_user,
    patients_at_facility,
    has_association,
    associate,
    associate_by_id,
)


def test_patients_for_user_only_returns_patients_associated_with_user(
    patient_factory, facility_factory, user_factory
):
    u1 = user_factory.create(email="u1@a")
    u2 = user_factory.create(email="u2@a")

    f = facility_factory.create(healthFacilityName="F")

    p1 = patient_factory.create(patientId="8901")
    p2 = patient_factory.create(patientId="8902")
    p3 = patient_factory.create(patientId="8903")

    associate(p1, f, u1)
    associate(p2, f, u2)
    associate(p3, f, u1)

    assert patients_for_user(u1) == [p1, p3]
    assert patients_for_user(u2) == [p2]


def test_patients_for_user_doesnt_return_duplicate_patients(
    patient_factory, facility_factory, user_factory
):
    u = user_factory.create(email="u@a")

    f1 = facility_factory.create(healthFacilityName="F1")
    f2 = facility_factory.create(healthFacilityName="F2")

    p = patient_factory.create(patientId="8900")

    associate(p, f1, u)
    associate(p, f2, u)

    assert patients_for_user(u) == [p]


def test_patients_for_user_returns_empty_list_if_no_associations(user_factory):
    u = user_factory.create(email="u@a")
    assert patients_for_user(u) == []


def test_patients_at_facility_only_returns_patients_associated_with_facility(
    patient_factory, facility_factory, user_factory
):
    u = user_factory.create(email="u@a")

    f1 = facility_factory.create(healthFacilityName="F1")
    f2 = facility_factory.create(healthFacilityName="F2")

    p1 = patient_factory.create(patientId="8901")
    p2 = patient_factory.create(patientId="8902")
    p3 = patient_factory.create(patientId="8903")

    associate(p1, f1, u)
    associate(p2, f2, u)
    associate(p3, f1, u)

    assert patients_at_facility(f1) == [p1, p3]
    assert patients_at_facility(f2) == [p2]


def test_patients_at_facility_doesnt_return_duplicate_patients(
    patient_factory, facility_factory, user_factory
):
    u1 = user_factory.create(email="u1@a")
    u2 = user_factory.create(email="u2@a")

    f = facility_factory.create(healthFacilityName="F")

    p = patient_factory.create(patientId="8900")

    associate(p, f, u1)
    associate(p, f, u2)

    assert patients_at_facility(f) == [p]


def test_patients_at_facility_returns_empty_list_if_no_associations(facility_factory):
    f = facility_factory.create(healthFacilityName="F")
    assert patients_at_facility(f) == []


def test_associate_by_id_creates_association(
    patient_factory, facility_factory, user_factory
):
    u = user_factory.create(email="u@a")
    f = facility_factory.create(healthFacilityName="F")
    p = patient_factory.create(patientId="8900")

    associate_by_id(p.patientId, f.healthFacilityName, u.id)

    assert patients_for_user(u) == [p]


def test_has_association(patient_factory, facility_factory, user_factory):
    u1 = user_factory.create(email="u1@a")
    u2 = user_factory.create(email="u2@a")

    f1 = facility_factory.create(healthFacilityName="F1")
    f2 = facility_factory.create(healthFacilityName="F2")

    p1 = patient_factory.create(patientId="8901")
    p2 = patient_factory.create(patientId="8902")

    associate(p1, f1, u1)
    associate(p2, f2, u2)

    assert has_association(patient=p1, facility=f1, user=u1)
    assert has_association(patient=p2, facility=f2, user=u2)
    assert not has_association(patient=p1, facility=f2, user=u1)
    assert not has_association(patient=p2, facility=f2, user=u1)

    assert has_association(patient=p1, facility=f1)
    assert has_association(patient=p1, user=u1)
    assert has_association(facility=f1, user=u1)

    assert not has_association(patient=p2, facility=f1)
    assert not has_association(facility=f2, user=u1)
    assert not has_association(patient=p1, user=u2)
