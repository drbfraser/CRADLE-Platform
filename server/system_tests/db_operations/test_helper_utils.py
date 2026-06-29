import data.db_operations as crud
import models
from data.db_operations.helper_utils import (
    __filter_by_patient_association,
    __filter_by_patient_search,
    __get_slice_indexes,
    __order_by_column,
)

# __filter_by_patient_association tests


def test_filter_patient_association():
    query = crud.db_session.query(models.PatientOrm)

    results = __filter_by_patient_association(
        query,
        models.PatientOrm,
        user_id=3,
        is_cho=False,
    ).all()

    assert [p.id for p in results] == ["49300028162"]


def test_filter_association_referral():
    query = crud.db_session.query(models.ReferralOrm)

    results = __filter_by_patient_association(
        query,
        models.ReferralOrm,
        user_id=3,
        is_cho=False,
    ).all()

    assert [r.patient_id for r in results] == ["49300028162"]


def test_filter_association_cho():
    query = crud.db_session.query(models.PatientOrm)

    results = __filter_by_patient_association(
        query,
        models.PatientOrm,
        user_id=4,
        is_cho=True,
    ).all()

    assert [p.id for p in results] == ["49300028162"]


# __filter_by_patient_search tests


def test_filter_by_patient_search(patient_factory):
    patient_factory.create(
        id="patient-search-1", name="Fake Real Name", village_number="100"
    )
    patient_factory.create(
        id="patient-search-2", name="Test Name 2", village_number="200"
    )

    query = crud.db_session.query(models.PatientOrm)
    query = __filter_by_patient_search(query, search="Fake Real")

    results = query.all()

    assert len(results) == 1
    assert results[0].id == "patient-search-1"


# __order_by_column tests


def test_order_by_column():
    query = crud.db_session.query(models.PatientOrm)
    query = __order_by_column(
        query,
        [models.PatientOrm],
        order_by="name",
        direction="ASC",
    )

    results = query.all()
    names = [p.name for p in results]

    assert all(names[i] <= names[i + 1] for i in range(len(names) - 1))


# __get_slice_indexes tests


def test_get_slice_indexes():
    assert __get_slice_indexes("1", "10") == (0, 10)
    assert __get_slice_indexes("2", "10") == (10, 20)
    assert __get_slice_indexes("3", "25") == (50, 75)
