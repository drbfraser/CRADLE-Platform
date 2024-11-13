import service.FilterHelper as filter
from service import assoc


def test_patients_for_hcw(user_factory, facility_factory, patient_factory):
    f = facility_factory.create(name="F")
    u1 = user_factory.create(email="u1@a", health_facility_name="F")
    u2 = user_factory.create(email="u2@a", health_facility_name="F")
    p1 = patient_factory.create(id="9001")
    p2 = patient_factory.create(id="9002")

    assoc.associate(p1, f, u1)
    assoc.associate(p2, f, u2)

    assert filter.patients_for_hcw(u1) == [p1, p2]


def test_patients_for_cho(database, user_factory, facility_factory, patient_factory):
    f = facility_factory.create(name="F")
    u1 = user_factory.create(email="u1@a", health_facility_name="F")
    u2 = user_factory.create(email="u2@a", health_facility_name="F")
    p1 = patient_factory.create(id="9001")
    p2 = patient_factory.create(id="9002")

    u1.vht_list.append(u2)
    database.session.commit()

    assoc.associate(p1, f, u1)
    assoc.associate(p2, f, u2)

    assert filter.patients_for_cho(u1) == [p1, p2]

    # Need to manually clean up this relation so that the factories can clean up their
    # objects as this table is not annotated with cascade=delete.
    u1.vhtList = []
    database.session.commit()


def test_patients_for_vht(user_factory, facility_factory, patient_factory):
    f = facility_factory.create(name="F")
    u1 = user_factory.create(email="u1@a", health_facility_name="F")
    u2 = user_factory.create(email="u2@a", health_facility_name="F")
    p1 = patient_factory.create(id="9001")
    p2 = patient_factory.create(id="9002")

    assoc.associate(p1, f, u1)
    assoc.associate(p2, f, u2)

    assert filter.patients_for_vht(u1) == [p1]
