import Manager.FilterHelper as filter
from Manager.PatientAssociationsManager import PatientAssociationsManager


def test_patients_for_hcw(user_factory, facility_factory, patient_factory):
    f = facility_factory.create(healthFacilityName="F")
    u1 = user_factory.create(email="u1@a", healthFacilityName="F")
    u2 = user_factory.create(email="u2@a", healthFacilityName="F")
    p1 = patient_factory.create(patientId="9001")
    p2 = patient_factory.create(patientId="9002")

    manager = PatientAssociationsManager()
    manager.associate(p1, f, u1)
    manager.associate(p2, f, u2)

    assert filter.patients_for_hcw(u1) == [p1, p2]


def test_patients_for_cho(database, user_factory, facility_factory, patient_factory):
    f = facility_factory.create(healthFacilityName="F")
    u1 = user_factory.create(email="u1@a", healthFacilityName="F")
    u2 = user_factory.create(email="u2@a", healthFacilityName="F")
    p1 = patient_factory.create(patientId="9001")
    p2 = patient_factory.create(patientId="9002")

    u1.vhtList.append(u2)
    database.session.commit()

    manager = PatientAssociationsManager()
    manager.associate(p1, f, u1)
    manager.associate(p2, f, u2)

    assert filter.patients_for_cho(u1) == [p1, p2]

    # Need to manually clean up this relation so that the factories can clean up their
    # objects as this table is not annotated with cascade=delete.
    u1.vhtList = []
    database.session.commit()


def test_patients_for_vht(user_factory, facility_factory, patient_factory):
    f = facility_factory.create(healthFacilityName="F")
    u1 = user_factory.create(email="u1@a", healthFacilityName="F")
    u2 = user_factory.create(email="u2@a", healthFacilityName="F")
    p1 = patient_factory.create(patientId="9001")
    p2 = patient_factory.create(patientId="9002")

    manager = PatientAssociationsManager()
    manager.associate(p1, f, u1)
    manager.associate(p2, f, u2)

    assert filter.patients_for_vht(u1) == [p1]
